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
        };
    },

    props: {
        transactionAmount:{
            type: Number,
            required: true
        },
        lunarTransactionId: {
            type: String,
            required: true
        },
        transactionCurrency: {
            type: String,
            required: true
        },
        lastTransactionType: {
            type: String,
            required: true
        }
    },

    computed: {
        isCapturePossible() {
            return 'authorize' === this.lastTransactionType;
        },

        isRefundPossible() {
            return 'capture' === this.lastTransactionType;
        },

        isVoidPossible() {
            return 'authorize' === this.lastTransactionType;
        },
    },

    methods: {
        capture() {
            this.isLoading = true;

            this.LunarPaymentService.capturePayment(
                this.lunarTransactionId,
                this.transactionAmount,
                this.transactionCurrency,
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
                this.lunarTransactionId,
                this.transactionAmount,
                this.transactionCurrency,
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
        // simple name "void" just not work
        voidPayment() {
            this.isLoading = true;

            this.LunarPaymentService.voidPayment(
                this.lunarTransactionId,
                this.transactionAmount,
                this.transactionCurrency,
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
    
        reloadPaymentDetails() {
            this.$emit('reload');
        },
    },
});
