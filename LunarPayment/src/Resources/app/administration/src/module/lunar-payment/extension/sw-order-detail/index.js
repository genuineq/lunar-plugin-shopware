import template from './sw-order-detail.html.twig';

const { Component, Context } = Shopware;
const { Criteria } = Shopware.Data;

Component.override('sw-order-detail', {
    template,

    data() {
        return {
            isLunarPayment: false
        };
    },

    computed: {
        showTabs() {
            return true; // TODO remove with PT-10455
        }
    },

    watch: {
        orderId: {
            deep: true,
            handler() {
                if (!this.orderId) {
                    this.isLunarPayment = false;

                    return;
                }

                const orderRepository = this.repositoryFactory.create('order');
                const orderCriteria = new Criteria(1, 1);
                orderCriteria.addAssociation('transactions');

                orderRepository.get(this.orderId, Context.api, orderCriteria).then((order) => {
                    order.transactions.forEach((orderTransaction) => {
                        if (!orderTransaction.customFields) {
                            return;
                        }

                        if (!orderTransaction.customFields.lunar_payment_is_transaction
                            && !orderTransaction.customFields.heidelpay_is_transaction) {
                            return;
                        }

                        this.isLunarPayment = true;
                    });
                });
            },
            immediate: true
        }
    }
});
