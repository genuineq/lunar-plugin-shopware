<?php declare(strict_types=1);

namespace LunarPayment\Subscriber;

use LunarPayment\Helpers\OrderHelper;
use LunarPayment\Helpers\PluginHelper;
use LunarPayment\Helpers\CurrencyHelper;
use LunarPayment\Helpers\LogHelper as Logger;
use LunarPayment\lib\ApiClient;

use Shopware\Core\Defaults;
use Shopware\Core\Checkout\Order\OrderEvents;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionEntity;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityWrittenEvent;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Manage payment actions on order transaction state change
 * It works on single or bulk order transaction edit.
 */
class OrderTransactionStateChangeSubscriber implements EventSubscriberInterface
{
    /** @var EntityRepository */
    private $lunarTransactionRepository;

    /** @var OrderHelper */
    private $orderHelper;

    /** @var SystemConfigService */
    private $systemConfigService;

    /** @var Logger */
    private $logger;

    /** @var OrderTransactionEntity */
    private $orderTransaction;

    public function __construct(
        EntityRepository $lunarTransactionRepository,
        OrderHelper $orderHelper,
        SystemConfigService $systemConfigService,
        Logger $logger
    ) {
        $this->lunarTransactionRepository = $lunarTransactionRepository;
        $this->orderHelper = $orderHelper;
        $this->systemConfigService = $systemConfigService;
        $this->logger = $logger;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            OrderEvents::ORDER_TRANSACTION_WRITTEN_EVENT => 'makePaymentTransaction',
        ];
    }

    /**
     * @param EntityWrittenEvent $event
     */
    public function makePaymentTransaction(EntityWrittenEvent $event)
    {
        $context = $event->getContext();
        $configPath = PluginHelper::PLUGIN_CONFIG_PATH;
        $transactionMode = $this->systemConfigService->get($configPath . 'transactionMode');

        if ($transactionMode == 'test') {
            $privateApiKey = $this->systemConfigService->get($configPath . 'testModeAppKey');
        } else {
            $privateApiKey = $this->systemConfigService->get($configPath . 'liveModeAppKey');
        }

        foreach ($event->getIds() as $transactionId) {
            $transaction = $this->orderTransaction = $this->orderHelper->getTransactionById($transactionId, $context);

            /**
             * Check payment method
             * Check order transaction state sent
             */
            if (PluginHelper::PAYMENT_METHOD_UUID !== $transaction->paymentMethodId) return $this;

            $transactionTechnicalName = $transaction->getStateMachineState()->technicalName;

            /** Defaults to authorize. */
            $dbTransactionPreviousState = OrderHelper::AUTHORIZE_STATUS;

            /** Map statuses based on shopware actions (transaction states sent) */
            switch ($transactionTechnicalName) {
                case OrderHelper::TRANSACTION_PAID:
                    $dbTransactionPreviousState = OrderHelper::AUTHORIZE_STATUS;
                    $transactionType = OrderHelper::CAPTURE_STATUS;
                    $amountToCheck = 'capturedAmount';
                    break;
                case OrderHelper::TRANSACTION_REFUNDED:
                    $dbTransactionPreviousState = OrderHelper::CAPTURE_STATUS;
                    $transactionType = OrderHelper::REFUND_STATUS;
                    $amountToCheck = 'refundedAmount';
                    break;
                case OrderHelper::TRANSACTION_VOIDED:
                    $dbTransactionPreviousState = OrderHelper::AUTHORIZE_STATUS;
                    $transactionType = OrderHelper::VOID_STATUS;
                    $amountToCheck = 'voidedAmount';
                    break;
                default:
                    continue;
            }

            try {
                /**
                 * Check transaction registered in custom table
                 */
                $criteria = new Criteria();
                $orderId = $transaction->getOrder()->getId();
                $criteria->addFilter(new EqualsFilter('orderId', $orderId));
                $criteria->addFilter(new EqualsFilter('transactionType',  $dbTransactionPreviousState));

                $paymentTransaction = $this->lunarTransactionRepository->search($criteria, $context)->first();

                if (!$paymentTransaction) return $this;

                $paymentTransactionId = $paymentTransaction->getTransactionId();

                /**
                 * Instantiate Api Client
                 * Fetch transaction
                 * Check amount & currency
                 * Proceed with transaction action
                 */
                $apiClient = new ApiClient($privateApiKey);
                $fetchedTransaction = $apiClient->transactions()->fetch($paymentTransactionId);

                if (!$fetchedTransaction) return $this;

                $totalPrice = $transaction->amount->getTotalPrice();
                $currencyCode = $transaction->getOrder()->getCurrency()->isoCode;
                $amountValue = (int) CurrencyHelper::getAmountInMinor($currencyCode, $totalPrice);

                if ($fetchedTransaction['amount'] !== $amountValue) {
                    return $this;
                }
                if ($fetchedTransaction['currency'] !== $currencyCode) {
                    return $this;
                }

                $transactionData = [
                    'amount' => $amountValue,
                    'currency' => $currencyCode,
                ];

                $result['successful'] = false;

                if ($this->isCaptureAction() && $fetchedTransaction['pendingAmount'] !== 0) {
                    if ($fetchedTransaction['pendingAmount'] !== $amountValue) {
                        return $this;
                    }

                    /** Make capture. */
                    $result = $apiClient->transactions()->capture($paymentTransactionId, $transactionData);

                } elseif ($this->isRefundAction() && $fetchedTransaction['capturedAmount'] !== 0) {
                    if ($fetchedTransaction['capturedAmount'] !== $amountValue) {
                        return $this;
                    }

                    /** Make refund. */

                    $result = $apiClient->transactions()->refund($paymentTransactionId, $transactionData);

                } elseif ($this->isVoidAction() && $fetchedTransaction['pendingAmount'] !== 0) {
                    if ($fetchedTransaction['pendingAmount'] !== $amountValue) {
                        return $this;
                    }

                    /** Make void. */
                    $result = $apiClient->transactions()->void($paymentTransactionId, $transactionData);

                } else {
                    return $this;
                }

                $this->logger->writeLog([strtoupper($transactionTechnicalName) . ' request data: ', $transactionData]);

                if (true !== $result['successful']) {
                    $this->logger->writeLog(['Error: ', $result]);
                    return $this;
                }

                $transactionAmount = CurrencyHelper::getAmountInMajor($currencyCode, $result[$amountToCheck]);

                $transactionData = [
                    [
                        'orderId' => $orderId,
                        'transactionId' => $paymentTransactionId,
                        'transactionType' => $transactionType,
                        'transactionCurrency' => $currencyCode,
                        'orderAmount' => $totalPrice,
                        'transactionAmount' => $transactionAmount,
                        'createdAt' => date(Defaults::STORAGE_DATE_TIME_FORMAT),
                    ],
                ];

                /** Insert new data to database and log it. */
                $this->lunarTransactionRepository->create($transactionData, $context);

                $this->logger->writeLog(['Succes: ', $transactionData[0]]);

            } catch (\Exception $e) {
                $this->logger->writeLog(['Error: ', $e->getMessage()]);
            }
        }
    }

    /**
     *
     */
    private function isCaptureAction(): bool
    {
        return OrderHelper::TRANSACTION_PAID === $this->orderTransaction->getStateMachineState()->technicalName;
    }

    /**
     *
     */
    private function isRefundAction(): bool
    {
        return OrderHelper::TRANSACTION_REFUNDED === $this->orderTransaction->getStateMachineState()->technicalName;
    }

    /**
     *
     */
    private function isVoidAction(): bool
    {
        return OrderHelper::TRANSACTION_VOIDED === $this->orderTransaction->getStateMachineState()->technicalName;
    }
}
