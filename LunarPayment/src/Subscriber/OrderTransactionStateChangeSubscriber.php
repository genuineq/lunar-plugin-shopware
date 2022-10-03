<?php declare(strict_types=1);

namespace LunarPayment\Subscriber;

use LunarPayment\lib\ApiClient;
use LunarPayment\Helpers\OrderHelper;
use LunarPayment\Helpers\PluginHelper;
use LunarPayment\Helpers\CurrencyHelper;
use LunarPayment\Helpers\LogHelper as Logger;

use Shopware\Core\Defaults;
use Shopware\Core\Checkout\Order\OrderEvents;
use Shopware\Core\Checkout\Order\Aggregate\OrderTransaction\OrderTransactionEntity;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Api\Exception\ExceptionFailedException;
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
    private $stateMachineHistory;

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
        EntityRepository $stateMachineHistory,
        EntityRepository $lunarTransactionRepository,
        OrderHelper $orderHelper,
        SystemConfigService $systemConfigService,
        Logger $logger
    ) {
        $this->stateMachineHistory = $stateMachineHistory;
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

        $isAdminAction = false;
        $errors = [];

        foreach ($event->getIds() as $transactionId) {
            try {
                $transaction = $this->orderTransaction = $this->orderHelper->getTransactionById($transactionId, $context);

                /**
                 * Check payment method
                 */
                if (PluginHelper::PAYMENT_METHOD_UUID !== $transaction->paymentMethodId) {
                    continue;
                }

                $transactionTechnicalName = $transaction->getStateMachineState()->technicalName;

                /** Defaults to authorize. */
                $dbTransactionPreviousState = OrderHelper::AUTHORIZE_STATUS;

                /**
                 * Check order transaction state sent
                 * Map statuses based on shopware actions (transaction state sent)
                 */
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
                }

                /**
                 * Check transaction registered in custom table
                 */
                $criteria = new Criteria();
                $orderId = $transaction->getOrder()->getId();
                $criteria->addFilter(new EqualsFilter('orderId', $orderId));
                $criteria->addFilter(new EqualsFilter('transactionType',  $dbTransactionPreviousState));

                $paymentTransaction = $this->lunarTransactionRepository->search($criteria, $context)->first();

                if (!$paymentTransaction) {
                    continue;
                }

                /** If arrive here, then it is an admin action. */
                $isAdminAction = true;

                $paymentTransactionId = $paymentTransaction->getTransactionId();

                /**
                 * Instantiate Api Client
                 * Fetch transaction
                 * Check amount & currency
                 * Proceed with transaction action
                 */
                $apiClient = new ApiClient($privateApiKey);
                $fetchedTransaction = $apiClient->transactions()->fetch($paymentTransactionId);

                if (!$fetchedTransaction) {
                    $errors[$transactionId][] = 'Fetch transaction failed: amount mismatch';
                    continue;
                }

                $totalPrice = $transaction->amount->getTotalPrice();
                $currencyCode = $transaction->getOrder()->getCurrency()->isoCode;
                $amountValue = (int) CurrencyHelper::getAmountInMinor($currencyCode, $totalPrice);

                if ($fetchedTransaction['amount'] !== $amountValue) {
                    $errors[$transactionId][] = 'Fetch transaction failed: amount mismatch';
                    continue;
                }
                if ($fetchedTransaction['currency'] !== $currencyCode) {
                    $errors[$transactionId][] = 'Fetch transaction failed: currency mismatch';
                    continue;
                }

                $transactionData = [
                    'amount' => $amountValue,
                    'currency' => $currencyCode,
                ];

                $result['successful'] = false;

                if ($this->isCaptureAction() && $fetchedTransaction['pendingAmount'] !== 0) {
                    // if ($fetchedTransaction['pendingAmount'] !== $amountValue) {
                    if ($fetchedTransaction['pendingAmount'] !== 12) {
                        $errors[$transactionId][] = 'Capture api call failed: pendingAmount mismatch';
                        continue;
                    }

                    /** Make capture. */
                    $result = $apiClient->transactions()->capture($paymentTransactionId, $transactionData);

                } elseif ($this->isRefundAction() && $fetchedTransaction['capturedAmount'] !== 0) {
                    if ($fetchedTransaction['capturedAmount'] !== $amountValue) {
                        $errors[$transactionId][] = 'Refund api call failed: capturedAmount mismatch';
                        continue;
                    }

                    /** Make refund. */

                    $result = $apiClient->transactions()->refund($paymentTransactionId, $transactionData);

                } elseif ($this->isVoidAction() && $fetchedTransaction['pendingAmount'] !== 0) {
                    if ($fetchedTransaction['pendingAmount'] !== $amountValue) {
                        $errors[$transactionId][] = 'Void api call failed: pendingAmount mismatch';
                        continue;
                    }

                    /** Make void. */
                    $result = $apiClient->transactions()->void($paymentTransactionId, $transactionData);

                } else  {
                    continue;
                }

                $this->logger->writeLog([strtoupper($transactionTechnicalName) . ' request data: ', $transactionData]);

                if (true !== $result['successful']) {
                    $this->logger->writeLog(['Error: ', $result]);
                    $errors[$transactionId][] = 'Transaction api action was unsuccesfull';
                    continue;
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
                $errors[] = $e->getMessage();
            }
        }

        if (!empty($errors) && $isAdminAction) {
            /**
             * Revert order transaction to previous state
             */
            foreach ($errors as $transactionIdKey => $errorMessages) {
                $criteria = new Criteria();
                $criteria->addFilter(new EqualsFilter('entity_id', $transactionIdKey));
                $criteria->addFilter(new EqualsFilter('transactionType',  $dbTransactionPreviousState));

                $paymentTransaction = $this->lunarTransactionRepository->search($criteria, $context)->first();

                // $this->stateMachineHistory->
            }

            $this->logger->writeLog(['ADMIN ACTION ERRORS: ', json_encode($errors)]);
            throw new ExceptionFailedException($errors);
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
