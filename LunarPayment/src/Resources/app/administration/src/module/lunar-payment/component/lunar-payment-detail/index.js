import template from './lunar-payment-detail.html.twig';

const {Component, Mixin, Module} = Shopware;

Component.register('lunar-payment-detail', {
    template,

    inject: ['LunarPaymentService'],

    mixins: [
        Mixin.getByName('notification')
    ],

    data() {
        return {
            isLoading: false,
            isSuccessful: false
        };
    },

    props: {
        paymentResource: {
            type: Object,
            required: true
        }
    },

    computed: {
        lunarMaxDigits() {
            const lunarPaymentModule = Module.getModuleRegistry().get('lunar-payment');

            if(!lunarPaymentModule || !lunarPaymentModule.manifest) {
                return 4;
            }

            return lunarPaymentModule.manifest.maxDigits;
        },

        remainingAmount() {
            if(!this.paymentResource || !this.paymentResource.amount) {
                return 0;
            }

            return this.formatAmount(this.paymentResource.amount.remaining, this.paymentResource.amount.decimalPrecision)
        },

        cancelledAmount() {
            if(!this.paymentResource || !this.paymentResource.amount) {
                return 0;
            }

            return this.formatAmount(this.paymentResource.amount.cancelled, this.paymentResource.amount.decimalPrecision)
        },

        chargedAmount() {
            if(!this.paymentResource || !this.paymentResource.amount) {
                return 0;
            }

            return this.formatAmount(this.paymentResource.amount.charged, this.paymentResource.amount.decimalPrecision)
        }
    },

    methods: {
        ship() {
            this.isLoading = true;

            this.LunarPaymentService.ship(
                this.paymentResource.orderId
            ).then(() => {
                this.createNotificationSuccess({
                    title: this.$tc('lunar-payment.paymentDetails.notifications.shipSuccessTitle'),
                    message: this.$tc('lunar-payment.paymentDetails.notifications.shipSuccessMessage')
                });

                this.isSuccessful = true;

                this.$emit('reload');
            }).catch((errorResponse) => {
                let message = errorResponse.response.data.message;

                if (message === 'generic-error') {
                    message = this.$tc('lunar-payment.paymentDetails.notifications.genericErrorMessage');
                } else if (message === 'invoice-missing-error') {
                    message = this.$tc('lunar-payment.paymentDetails.notifications.invoiceNotFoundMessage');
                } else if(message === 'documentdate-missing-error') {
                    message = this.$tc('lunar-payment.paymentDetails.notifications.documentDateMissingError');
                } else if(message === 'payment-missing-error') {
                    message = this.$tc('lunar-payment.paymentDetails.notifications.paymentMissingError');
                }

                this.createNotificationError({
                    title: this.$tc('lunar-payment.paymentDetails.notifications.shipErrorTitle'),
                    message: message
                });

                this.isLoading = false;
            });
        },

        formatAmount(cents, decimalPrecision) {
            return cents / (10 ** Math.min(this.lunarMaxDigits, decimalPrecision));
        }
    }
});
