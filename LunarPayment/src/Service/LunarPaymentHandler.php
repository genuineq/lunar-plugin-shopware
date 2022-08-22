<?php declare(strict_types=1);

namespace LunarPayment\Service;

use Shopware\Core\Defaults;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Core\Framework\Validation\DataBag\RequestDataBag;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Checkout\Payment\Cart\SyncPaymentTransactionStruct;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionStateHandler;
use Shopware\Core\Checkout\Payment\Cart\PaymentHandler\SynchronousPaymentHandlerInterface;
use Shopware\Core\Checkout\Payment\Exception\SyncPaymentProcessException;

use LunarPayment\lib\ApiClient;
use LunarPayment\Helpers\OrderHelper;
use LunarPayment\Helpers\PluginHelper;
use LunarPayment\Helpers\CurrencyHelper;
use LunarPayment\Helpers\LogHelper as Logger;
use LunarPayment\Exception\TransactionException;

/**
 *
 */
class LunarPaymentHandler implements SynchronousPaymentHandlerInterface
{
    /** @var OrderTransactionStateHandler */
    private $transactionStateHandler;

    /** @var SystemConfigService */
    private $systemConfigService;

    /** @var EntityRepository */
    private $lunarTransactionRepository;

    /** @var Logger */
    private $logger;

    public function __construct(
        OrderTransactionStateHandler $transactionStateHandler,
        SystemConfigService $systemConfigService,
        EntityRepository $lunarTransactionRepository,
        Logger $logger
    ) {
        $this->transactionStateHandler = $transactionStateHandler;
        $this->systemConfigService = $systemConfigService;
        $this->lunarTransactionRepository = $lunarTransactionRepository;
        $this->logger = $logger;
    }

    public function pay(SyncPaymentTransactionStruct $transaction, RequestDataBag $dataBag, SalesChannelContext $salesChannelContext): void
    {
        /** Prepare vars. */
        $context = $salesChannelContext->getContext();
        $orderId = $transaction->getOrder()->getId();
        $orderTransactionId = $transaction->getOrderTransaction()->getId();
        $transactionAmount = $transaction->getOrderTransaction()->getAmount()->getTotalPrice();
        $orderCurrency = $salesChannelContext->getCurrency()->getIsoCode();
        $configPath = PluginHelper::PLUGIN_CONFIG_PATH;
        $captureMode = $this->systemConfigService->get($configPath . 'captureMode');
        $transactionMode = $this->systemConfigService->get($configPath . 'transactionMode');
        $transactionId = $dataBag->get('lunar_transaction_id');

        if ('' === $transactionId || null === $transactionId) {
            $this->logger->writeLog(['Frontend process error: No shopware order transaction ID was provided (unable to extract it)']);
            throw new TransactionException($orderTransactionId, '', null, 'AUTHORIZATION_ERROR');
        }

        $transactionData = [
            [
                'orderId' => $orderId,
                'transactionId' => $transactionId,
                'transactionType' => OrderHelper::AUTHORIZE_STATUS,
                'transactionCurrency' => $orderCurrency,
                'orderAmount' => $transactionAmount,
                'transactionAmount' => $transactionAmount,
                'createdAt' => date(Defaults::STORAGE_DATE_TIME_FORMAT),
            ],
        ];

        $this->logger->writeLog(['Frontend request data: ', $transactionData[0]]);

        if ('delayed' === $captureMode) {
            /**
             * Set order transaction status -> "Authorized"
             * @throws SyncPaymentProcessException
             */
            $this->transactionStateHandler->authorize($orderTransactionId, $context);
        } else {
            $privateApiKey = $this->systemConfigService->get($configPath . 'liveModeAppKey');

            if ('test' == $transactionMode) {
                $privateApiKey = $this->systemConfigService->get($configPath . 'testModeAppKey');
            }

            // instantiate API Client
            $apiClient = new ApiClient($privateApiKey);

            $captureTransactionData = [
                'currency' => $orderCurrency,
                'amount' => CurrencyHelper::getAmountInMinor($orderCurrency, $transactionAmount),
            ];

            $this->logger->writeLog(['Frontend capture data: ', $captureTransactionData]);

            /** Make capture. */
            $captureResponse = false;
            try {
                $captureResponse = $apiClient->transactions()->capture($transactionId, $captureTransactionData);
                $this->logger->writeLog(['Frontend capture ajax response: ', $captureResponse]);
            } catch (\Exception $e) {
                $this->logger->writeLog(['Frontend capture Exception: ', $e->getMessage()]);
                throw new TransactionException($orderTransactionId, '', null, 'CAPTURE_ERROR');
            }

            if ($captureResponse) {
                /** Set order transaction status -> "Paid" */
                $this->transactionStateHandler->paid($orderTransactionId, $context);

                /** Change type of transaction for data to be saved in DB. */
                $transactionData[0]['transactionType'] = OrderHelper::CAPTURE_STATUS;
            } else {
                /** Set order transaction status -> "Failed" */
                $this->transactionStateHandler->fail($orderTransactionId, $context);
                $this->logger->writeLog(['Frontend capture error: an error occured when trying to capture transaction']);

                throw new TransactionException($orderTransactionId, '', null, 'CAPTURE_ERROR');
            }
        }

        /** Insert transaction data to custom table. */
        $this->lunarTransactionRepository->create($transactionData, $context);
    }
}