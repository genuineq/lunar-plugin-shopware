import template from "./lunar-payment-actions.html.twig";
import "./lunar-payment-actions.scss";

const { Component, Mixin } = Shopware;

Component.register("lunar-payment-actions", {
    template,

    inject: ["LunarPaymentService"],

    mixins: [Mixin.getByName("notification")],

    data() {
        return {
            isLoading: false,
            isSuccessful: false,
            transactionAmount: 0.0,
        };
    },

    props: {
        lunarTransaction: {
            type: Object,
            required: true
        },

        maxDigits: {
            type: Number,
            required: false,
            default: 2
        }
    },

    computed: {
        isCapturePossible: function () {
            return true;
            // return this.lunarTransaction.transactionType === 'authorize';
        },

        isRefundPossible: function () {
            return true;
            // return this.lunarTransaction.transactionType === 'capture';
        },

        isVoidPossible: function () {
            return true;
            // return this.lunarTransaction.transactionType === 'authorize';
        },

        maxTransactionAmount() {
            let amount = 0;

            if (this.isRefundPossible) {
                amount = this.lunarTransaction.orderAmount;
            }

            if (this.isCapturePossible) {
                amount = this.paymentResource.amount.remaining;
            }


            return amount / (10 ** this.paymentResource.amount.decimalPrecision);

            return 12000;
        },
    },

    created() {
        this.transactionAmount = this.maxTransactionAmount;
    },

    methods: {
        capture() {
            this.isLoading = true;

            this.LunarPaymentService.capturePayment(
                this.lunarTransaction.orderId,
                this.transactionAmount
            )
                .then(() => {
                    this.createNotificationSuccess({
                        title: this.$tc("lunar-payment.paymentDetails.notifications.captureSuccessTitle"),
                        message: this.$tc("lunar-payment.paymentDetails.notifications.captureSuccessMessage"),
                    });

                    this.isSuccessful = true;

                    this.$emit("reload");
                })
                .catch((errorResponse) => {
                    let message = errorResponse.response.data.message;

                    if (message === "generic-error") {
                        message = this.$tc("lunar-payment.paymentDetails.notifications.genericErrorMessage");
                    }

                    this.createNotificationError({
                        title: this.$tc("lunar-payment.paymentDetails.notifications.captureErrorTitle"),
                        message: message,
                    });

                    this.isLoading = false;
                });
        },

        refund() {
            this.isLoading = true;

            this.LunarPaymentService.refundPayment(
                this.lunarTransaction.orderId,
                this.transactionAmount
            )
                .then(() => {
                    this.createNotificationSuccess({
                        title: this.$tc("lunar-payment.paymentDetails.notifications.refundSuccessTitle"),
                        message: this.$tc("lunar-payment.paymentDetails.notifications.refundSuccessMessage"),
                    });

                    this.isSuccessful = true;

                    this.$emit("reload");
                })
                .catch((errorResponse) => {
                    let message = errorResponse.response.data.message;

                    if (message === "generic-error") {
                        message = this.$tc("lunar-payment.paymentDetails.notifications.genericErrorMessage");
                    }

                    this.createNotificationError({
                        title: this.$tc("lunar-payment.paymentDetails.notifications.refundErrorTitle"),
                        message: message,
                    });

                    this.isLoading = false;
                });
        },

        void() {
            this.isLoading = true;

            this.LunarPaymentService.voidPayment(
                this.lunarTransaction.orderId,
                this.transactionAmount
            )
                .then(() => {
                    this.createNotificationSuccess({
                        title: this.$tc("lunar-payment.paymentDetails.notifications.voidSuccessTitle"),
                        message: this.$tc("lunar-payment.paymentDetails.notifications.voidSuccessMessage"),
                    });

                    this.isSuccessful = true;

                    this.$emit("reload");
                })
                .catch((errorResponse) => {
                    let message = errorResponse.response.data.message;

                    if (message === "generic-error") {
                        message = this.$tc("lunar-payment.paymentDetails.notifications.genericErrorMessage");
                    }

                    this.createNotificationError({
                        title: this.$tc("lunar-payment.paymentDetails.notifications.voidErrorTitle"),
                        message: message,
                    });

                    this.isLoading = false;
                });
        },
    },
});
