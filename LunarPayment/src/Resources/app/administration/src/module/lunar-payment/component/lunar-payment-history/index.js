import template from './lunar-payment-history.html.twig';
import "./lunar-payment-history.scss";

const { Component, Module } = Shopware;

Component.register('lunar-payment-history', {
    template,

    inject: ['repositoryFactory'],

    data() {
        return {
            isLoading: false,
            isSuccessful: false,
            amountInMinor: 0,
            lunarTransactionId: '',
            transactionCurrency: '',
            lastTransactionType: ''
        };
    },

    props: {
        lunarTransactions: {
            type: Array,
            required: true
        },
        orderId: {
            type: String,
            required: true
        },
    },

    computed: {
        data() {
            var itself = this;

            const data = [];
            const lunarTransactions = itself.lunarTransactions[0];

            if (lunarTransactions) {

                var index = Object.keys(lunarTransactions).length;

                Object.entries(lunarTransactions).forEach(([key, lunarTransaction]) => {

                    /** Get last transaction id (will be first in the array). */
                    const lastTransactionId = Object.keys(lunarTransactions)[0];

                    /** Set last transaction details to be available into actions component. */
                    if (key == lastTransactionId) {
                        itself.lastTransactionType = lunarTransaction.transactionType;
                        itself.amountInMinor = lunarTransaction.amountInMinor;
                        itself.lunarTransactionId = lunarTransaction.transactionId;
                        itself.transactionCurrency = lunarTransaction.transactionCurrency;
                    }

                    let createdAt = lunarTransaction.createdAt.split(/[T.]/);

                    data.push({
                        id: index--,
                        type: lunarTransaction.transactionType,
                        transactionId: lunarTransaction.transactionId,
                        currencyCode: lunarTransaction.transactionCurrency,
                        orderAmount: lunarTransaction.orderAmount,
                        transactionAmount: lunarTransaction.transactionAmount,
                        date: createdAt[0] + ' ' + createdAt[1]
                    });
                });
            }

            return data;
        },

        columns() {
            return [
                {
                    property: 'id',
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
