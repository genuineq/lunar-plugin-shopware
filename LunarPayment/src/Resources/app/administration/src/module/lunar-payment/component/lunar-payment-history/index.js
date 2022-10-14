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
            transactionAmount: 0,
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
    },

    computed: {
        data() {
            var self = this;
            const data = [];

            this.lunarTransactions.forEach((lunarTransaction, index) => {

                Object.entries(lunarTransaction).forEach(([key, object]) => {
                    lunarTransaction = object;
                });

                /** Set last transaction type & amount. */
                if (index == (self.lunarTransactions.length - 1)) {
                    self.lastTransactionType = lunarTransaction.transactionType;
                    self.transactionAmount = lunarTransaction.transactionAmount; // TODO need to be processed
                    self.lunarTransactionId = lunarTransaction.transactionId;
                    self.transactionCurrency = lunarTransaction.transactionCurrency;
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
