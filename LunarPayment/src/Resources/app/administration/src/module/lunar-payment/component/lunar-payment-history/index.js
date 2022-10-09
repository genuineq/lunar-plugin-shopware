import template from './lunar-payment-history.html.twig';

const { Component, Module } = Shopware;

Component.register('lunar-payment-history', {
    template,

    inject: ['repositoryFactory'],

    data() {
        return {
            isLoading: false,
            isSuccessful: false,
            transactionAmount: 0,
            lunarTransactionId: '',
            transactionCurrency: '',
            lastTransactionType: '',
        };
    },

    props: {
        lunarTransactions: {
            type: Array,
            required: true
        },
    },

    computed: {
        data() {
            const data = [];

            this.lunarTransactions.forEach((lunarTransaction, index) => {

                Object.entries(lunarTransaction).forEach(([key, object]) => {
                    lunarTransaction = object;
                });

                /** Set last transaction type & amount. */
                if (index == (this.lunarTransactions.length - 1)) {
                    this.lastTransactionType = lunarTransaction.transactionType;
                    this.transactionAmount = lunarTransaction.transactionAmount; // TODO need to be processed
                    this.lunarTransactionId = lunarTransaction.transactionId;
                    this.transactionCurrency = lunarTransaction.transactionCurrency;
                }

                let createdAt = lunarTransaction.createdAt.split(/[T.]/);

                data.push({
                    index: index + 1,
                    type: lunarTransaction.transactionType,
                    transactionId: lunarTransaction.transactionId,
                    currencyCode: lunarTransaction.transactionCurrency,
                    orderAmount: lunarTransaction.orderAmount,
                    transactionAmount: lunarTransaction.transactionAmount,
                    date: createdAt[0] + ' ' + createdAt[1],
                    resource: lunarTransaction
                });
            });

            return data;
        },

        isCapturePossible() {
            return this.lastTransactionType === 'authorize';
        },

        isRefundPossible() {
            return this.lastTransactionType === 'capture';
        },

        isVoidPossible() {
            return this.lastTransactionType === 'authorize';
        },

        columns() {
            return [
                {
                    property: 'index',
                    label: '#',
                    rawData: true
                },
                {
                    property: 'type',
                    label: this.$tc('lunar-payment.paymentDetails.history.column.type'),
                    rawData: true
                },
                {
                    property: 'transactionId',
                    label: this.$tc('lunar-payment.paymentDetails.history.column.transactionId'),
                    rawData: true
                },
                {
                    property: 'currencyCode',
                    label: this.$tc('lunar-payment.paymentDetails.history.column.currencyCode'),
                    rawData: true
                },
                {
                    property: 'orderAmount',
                    label: this.$tc('lunar-payment.paymentDetails.history.column.orderAmount'),
                    rawData: true
                },
                {
                    property: 'transactionAmount',
                    label: this.$tc('lunar-payment.paymentDetails.history.column.transactionAmount'),
                    rawData: true
                },
                {
                    property: 'date',
                    label: this.$tc('lunar-payment.paymentDetails.history.column.date'),
                    rawData: true
                }
            ];
        }
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

        void() {
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

        transactionTypeRenderer(value) {
            switch (value) {
                case 'authorize':
                    return this.$tc('lunar-payment.paymentDetails.history.type.authorize');
                case 'capture':
                    return this.$tc('lunar-payment.paymentDetails.history.type.capture');
                case 'refund':
                    return this.$tc('lunar-payment.paymentDetails.history.type.refund');
                case 'void':
                    return this.$tc('lunar-payment.paymentDetails.history.type.void');
                default:
                    return this.$tc('lunar-payment.paymentDetails.history.type.default');
            }
        },

        reloadPaymentDetails() {
            this.$emit('reload');
        },
    }
});
