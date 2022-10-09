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
     * FETCH TRANSACTION
     *
     * @Route("/api/_action/lunar_payment/{orderId}/fetch-transactions", name="api.action.lunar_payment.order_id.fetch-transactions", methods={"POST"})
     */
    public function fetchTransactions(string $orderId, Context $context): JsonResponse
    {
        $errors = [];


        /**
         * Check transaction registered in custom table
         */
        $criteria = new Criteria();
        $criteria->addFilter(new EqualsFilter('orderId', $orderId));

        $lunarTransactions = $this->lunarTransactionRepository->search($criteria, $context);

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
     * @Route("/api/_action/lunar_payment/{lunarTransactionId}/capture", name="api.action.lunar_payment.lunarTransactionId.capture", methods={"POST"})
     */
    public function capture(Request $request, Context $context): JsonResponse
    {
        // try {

        // } catch (\Exception $e) {

        // }

        $errors = [];

        $orderId = $request->orderId;
        $this->orderHelper->getOrderById($orderId, $context);

        $transactionId = $request->transactionId;
        $transaction = $this->orderHelper->getTransactionById($transactionId, $context);

        $transactionStateName = $transaction->getStateMachineState()->technicalName;

        /**
         * Check transaction registered in custom table
         */
        $criteria = new Criteria();
        $orderId = $transaction->getOrder()->getId();
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

        $lunarTransactionId = $lunarTransaction->getTransactionId();


        /**
         * Instantiate Api Client
         * Fetch transaction
         * Check amount & currency
         * Proceed with payment capture
         */
        $privateApiKey = $this->getApiKey($transaction);
        $apiClient = new ApiClient($privateApiKey);
        $fetchedTransaction = $apiClient->transactions()->fetch($lunarTransactionId);

        if (!$fetchedTransaction) {
            return new JsonResponse([
                'status'  => empty($errors),
                'message' => 'Error',
                'code'    => 0,
                'errors'=> ['fetch_transaction_failed' => 'Fetch transaction failed'],
            ], 400);
        }

        $totalPrice = $transaction->amount->getTotalPrice();
        $currencyCode = $transaction->getOrder()->getCurrency()->isoCode;
        $amountValue = (int) CurrencyHelper::getAmountInMinor($currencyCode, $totalPrice);

        if ($fetchedTransaction['amount'] !== $amountValue) {
            $errors['amount_mismatch'] = 'Fetch transaction failed: amount mismatch';
        }
        if ($fetchedTransaction['currency'] !== $currencyCode) {
            $errors['currency_mismatch'] = 'Fetch transaction failed: currency mismatch';
        }

        if ($fetchedTransaction['pendingAmount'] !== $amountValue) {

        }

        $transactionData = [
            'amount' => $amountValue,
            'currency' => $currencyCode,
        ];

        $result['successful'] = false;
        $result = $apiClient->transactions()->capture($lunarTransactionId, $transactionData);

        $this->logger->writeLog(['CAPTURE request data: ', $transactionData]);


        if (true !== $result['successful']) {
            $this->logger->writeLog(['CAPTURE error (admin): ', $result]);
            $errors['capture_failed'] = 'Capture transaction api action failed';
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
                'createdAt' => date(Defaults::STORAGE_DATE_TIME_FORMAT),
            ],
        ];

        /** Insert new data to database and log it. */
        $this->lunarTransactionRepository->create($transactionData, $context);

        $this->logger->writeLog(['Succes: ', $transactionData[0]]);


        if (!empty($errors)) {
            return new JsonResponse([
                'status'  => empty($errors),
                'message' => 'Error',
                'code'    => 0,
                'errors'=> $errors,
            ], 400);
        }

        return new JsonResponse([
            'status'  =>  empty($errors),
            'message' => 'Success',
            'code'    => 0,
            'errors'  => $errors,
        ], 200);
    }

    /**
     *
     */
    private function getApiKey($transaction)
    {
        $salesChannelId = $transaction->getOrder()->getSalesChannelId();

        $transactionMode = $this->systemConfigService->get(self::CONFIG_PATH . 'transactionMode', $salesChannelId);

        if ($transactionMode == 'test') {
            return $this->systemConfigService->get(self::CONFIG_PATH . 'testModeAppKey', $salesChannelId);
        }

        return $this->systemConfigService->get(self::CONFIG_PATH . 'liveModeAppKey', $salesChannelId);
    }
}
