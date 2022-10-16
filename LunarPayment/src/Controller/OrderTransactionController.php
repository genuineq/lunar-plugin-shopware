<?php declare(strict_types=1);

namespace LunarPayment\Controller;


use Shopware\Core\Defaults;
use Shopware\Core\Framework\Context;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Api\Exception\ExceptionFailedException;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionEntity;

use LunarPayment\lib\ApiClient;
use LunarPayment\Helpers\OrderHelper;
use LunarPayment\Helpers\PluginHelper;
use LunarPayment\Helpers\CurrencyHelper;
use LunarPayment\lib\Exception\ApiException;
use LunarPayment\Helpers\LogHelper as Logger;

/**
 * Responsible for handling order payment transactions
 *
 * @Route(defaults={"_routeScope"={"api"}})
 */
class OrderTransactionController extends AbstractController
{
    private const  CONFIG_PATH = PluginHelper::PLUGIN_CONFIG_PATH;

    /** @var EntityRepository */
    private $stateMachineHistory;

    /** @var EntityRepository */
    private $lunarTransactionRepository;

    /** @var OrderHelper */
    private $orderHelper;

    /** @var SystemConfigService */
    private $systemConfigService;

    /** @var Logger */
    private $logger;


    /**
     * Constructor
     */
    public function __construct(
        EntityRepository $stateMachineHistory,
        EntityRepository $lunarTransactionRepository,
        OrderHelper $orderHelper,
        SystemConfigService $systemConfigService,
        Logger $logger
    )
    {
        $this->stateMachineHistory = $stateMachineHistory;
        $this->lunarTransactionRepository = $lunarTransactionRepository;
        $this->orderHelper = $orderHelper;
        $this->systemConfigService = $systemConfigService;
        $this->logger = $logger;
    }

    /**
     * FETCH TRANSACTIONS
     *
     * @Route("/api/_action/lunar_payment/{orderId}/fetch-transactions", name="api.action.lunar_payment.order_id.fetch-transactions", methods={"POST"})
     */
    public function fetchTransactions(string $orderId, Context $context): JsonResponse
    {
        $errors = [];

        try {
            /**
             * Check transaction registered in custom table
             */
            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('orderId', $orderId));

            $lunarTransactions = $this->lunarTransactionRepository->search($criteria, $context);

        } catch (\Exception $e) {
            $errors[] = $e->getMessage();
        }

        if (!empty($errors)) {
            return new JsonResponse([
                'status'  =>  empty($errors),
                'message' => 'Error',
                'code'    => 0,
                'errors'  => $errors,
            ], 404);
        }

        return new JsonResponse([
            'status'  =>  empty($errors),
            'message' => 'Success',
            'code'    => 0,
            'errors'  => $errors,
            'transactions' => $lunarTransactions->getElements(),
        ], 200);
    }

    /**
     * CAPTURE
     *
     * @Route("/api/_action/lunar_payment/capture", name="api.action.lunar_payment.capture", methods={"POST"})
     */
    public function capture(Request $request, Context $context): JsonResponse
    {
        try {

            $requestContent = json_decode($request->getContent());
            $params = json_decode(json_encode($requestContent->params), true);
            $orderId = $params['orderId'];
            $lunarTransactionId = $params['lunarTransactionId'];


    // file_put_contents("/app/var/log/zzz.log", ($params), FILE_APPEND);
            // file_put_contents("/app/var/log/zzz.log", json_encode($params), FILE_APPEND);

            $order = $this->orderHelper->getOrderById($orderId, $context);

            $lastTransaction = $order->transactions->last();

            $transactionStateName = $lastTransaction->getStateMachineState()->technicalName;

            /**
             * Get lunar transaction
             */
            $criteria = new Criteria();
            $criteria->addFilter(new EqualsFilter('orderId', $orderId));
            $criteria->addFilter(new EqualsFilter('transactionType',  OrderHelper::AUTHORIZE_STATUS));

            $lunarTransaction = $this->lunarTransactionRepository->search($criteria, $context)->first();

            if (!$lunarTransaction || OrderHelper::TRANSACTION_AUTHORIZED != $transactionStateName) {
                return new JsonResponse([
                    'status'  => empty($errors),
                    'message' => 'Error',
                    'code'    => 0,
                    'errors'=> ['not_lunar_transaction' => 'Capture failed. Not lunar transaction or payment not authorised.'],
                ], 400);
            }

            /**
             * Instantiate Api Client
             * Fetch transaction
             * Check amount & currency
             * Proceed with payment capture
             */
            $privateApiKey = $this->getApiKey($order);
            $apiClient = new ApiClient($privateApiKey);
            $fetchedTransaction = $apiClient->transactions()->fetch($lunarTransactionId);

            if (!$fetchedTransaction) {
                return new JsonResponse([
                    'status'  => empty($errors),
                    'message' => 'Error',
                    'code'    => 0,
                    // 'errors'=> ['fetch_transaction_failed' => 'Fetch transaction failed'],
                    'errors'=> ['Fetch transaction failed'],
                ], 400);
            }

            $totalPrice = $lastTransaction->amount->getTotalPrice();
            $currencyCode = $order->getCurrency()->isoCode;
            $amountInMinor = (int) CurrencyHelper::getAmountInMinor($currencyCode, $totalPrice);

            if ($fetchedTransaction['amount'] !== $amountInMinor) {
                // $errors['amount_mismatch'] = 'Fetch transaction failed: amount mismatch';
                $errors[] = 'Fetch transaction failed: amount mismatch';
            }
            if ($fetchedTransaction['currency'] !== $currencyCode) {
                // $errors['currency_mismatch'] = 'Fetch transaction failed: currency mismatch';
                $errors[] = 'Fetch transaction failed: currency mismatch';
            }

            if ($fetchedTransaction['pendingAmount'] !== $amountInMinor) {
                // $errors['pending_amount_mismatch'] = 'Fetch transaction failed: currency mismatch';
                $errors[] = 'Fetch transaction failed: currency mismatch';
            }

            $transactionData = [
                'amount' => $amountInMinor,
                'currency' => $currencyCode,
            ];

            $result['successful'] = false;
            $result = $apiClient->transactions()->capture($lunarTransactionId, $transactionData);

            $this->logger->writeLog(['CAPTURE request data: ', $transactionData]);


            if (true !== $result['successful']) {
                $this->logger->writeLog(['CAPTURE error (admin): ', $result]);
                // $errors['capture_failed'] = 'Capture transaction api action failed';
                $errors[] = 'Capture transaction api action failed';
            }


            $transactionAmount = CurrencyHelper::getAmountInMajor($currencyCode, $result['capturedAmount']);

            $transactionData = [
                [
                    'orderId' => $orderId,
                    'transactionId' => $lunarTransactionId,
                    'transactionType' => OrderHelper::CAPTURE_STATUS,
                    'transactionCurrency' => $currencyCode,
                    'orderAmount' => $totalPrice,
                    'transactionAmount' => $transactionAmount,
                    'amountInMinor' => $amountInMinor,
                    'createdAt' => date(Defaults::STORAGE_DATE_TIME_FORMAT),
                ],
            ];

            /** Insert new data to database and log it. */
            $this->lunarTransactionRepository->create($transactionData, $context);

            $this->logger->writeLog(['Succes: ', $transactionData[0]]);

        } catch (\Exception $e) {
            // $errors['exception_error'] = 'An exception occured. Please try again. If this persist please contact plugin developer.';
            $errors[] = 'An exception occured. Please try again. If this persist please contact plugin developer.';
            $this->logger->writeLog(['EXCEPTION Capture (admin): ', $e->getMessage()]);
        }

        if (!empty($errors)) {
            return new JsonResponse([
                'status'  => empty($errors),
                'message' => 'Error',
                'code'    => 0,
                'errors'=> $errors ?? [],
            ], 400);
        }

        return new JsonResponse([
            'status'  =>  empty($errors),
            'message' => 'Success',
            'code'    => 0,
            'errors'  => $errors ?? [],
        ], 200);
    }

    /**
     *
     */
    private function getApiKey($order)
    {
        $salesChannelId = $order->getSalesChannelId();

        $transactionMode = $this->systemConfigService->get(self::CONFIG_PATH . 'transactionMode', $salesChannelId);

        if ($transactionMode == 'test') {
            return $this->systemConfigService->get(self::CONFIG_PATH . 'testModeAppKey', $salesChannelId);
        }

        return $this->systemConfigService->get(self::CONFIG_PATH . 'liveModeAppKey', $salesChannelId);
    }
}
