import template from './lunar-payment-metadata.html.twig';

const { Component } = Shopware;

Component.register('lunar-payment-metadata', {
    template,

    props: {
        paymentResource: {
            type: Object,
            required: true
        }
    },

    computed: {
        data: function () {
            const data = [];

            this.paymentResource.metadata.forEach((meta) => {
                data.push({
                    key: meta.key,
                    value: meta.value
                });
            });

            return data;
        },

        columns: function () {
            return [
                {
                    property: 'key',
                    label: this.$tc('lunar-payment.paymentDetails.metadata.column.key'),
                    rawData: true
                },
                {
                    property: 'value',
                    label: this.$tc('lunar-payment.paymentDetails.metadata.column.value'),
                    rawData: true
                }
            ];
        }
    }
});
