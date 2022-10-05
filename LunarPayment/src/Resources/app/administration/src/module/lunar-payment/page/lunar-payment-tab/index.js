import template from './lunar-payment-tab.html.twig';

const { Component, Context, Mixin } = Shopware;
const { Criteria } = Shopware.Data;

Component.register('lunar-payment-tab', {
    template,

    inject: ['LunarPaymentService', 'repositoryFactory'],

    mixins: [
        Mixin.getByName('notification')
    ],

    data() {
        return {
            paymentResources: [],
            isLoading: true
        };
    },

    created() {
        this.createdComponent();
    },

    computed: {
        orderRepository() {
            return this.repositoryFactory.create('order');
        }
    },

    watch: {
        '$route'() {
            this.resetDataAttributes();
            this.createdComponent();
        }
    },

    methods: {
        createdComponent() {
            this.loadData();
        },

        resetDataAttributes() {
            this.paymentResources = [];
            this.isLoading = true;
        },

        reloadPaymentDetails() {
            this.resetDataAttributes();
            this.loadData();
        },

        loadData() {
            const orderId = this.$route.params.id;
            const criteria = new Criteria();
            criteria.addAssociation('transactions');

            this.orderRepository.get(orderId, Context.api, criteria).then((order) => {
                this.order = order;

                if (!order.transactions) {
                    return;
                }

                order.transactions.forEach((orderTransaction) => {
                    if (!orderTransaction.customFields) {
                        return;
                    }

                    if (!orderTransaction.customFields.lunar_payment_is_transaction) {
                        return;
                    }

                    this.LunarPaymentService.fetchPaymentDetails(orderTransaction.id)
                        .then((response) => {
                            this.isLoading = false;

                            this.paymentResources.push(JSON.parse(response.transaction));
                        })
                        .catch(() => {
                            this.createNotificationError({
                                title: this.$tc('lunar-payment.paymentDetails.notifications.genericErrorMessage'),
                                message: this.$tc('lunar-payment.paymentDetails.notifications.couldNotRetrieveMessage')
                            });

                            this.isLoading = false;
                        });
                });
            });
        }
    }
});
