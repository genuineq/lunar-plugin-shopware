import template from './lunar-payment-basket.html.twig';

const { Component } = Shopware;

Component.register('lunar-payment-basket', {
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

            this.paymentResource.basket.basketItems.forEach((basketItem) => {
                let amountGross = this.$options.filters.currency(
                    parseFloat(basketItem.amountGross),
                    this.paymentResource.currency
                );
                let amountNet = this.$options.filters.currency(
                    parseFloat(basketItem.amountNet),
                    this.paymentResource.currency
                );

                if (basketItem.amountDiscount > 0) {
                    amountGross = this.$options.filters.currency(
                        parseFloat(basketItem.amountDiscount) * -1,
                        this.paymentResource.currency
                    );

                    amountNet = this.$options.filters.currency(
                        parseFloat(basketItem.amountDiscount - basketItem.amountVat) * -1,
                        this.paymentResource.currency
                    );
                }

                data.push({
                    quantity: basketItem.quantity,
                    title: basketItem.title,
                    amountGross: amountGross,
                    amountNet: amountNet
                });
            });

            return data;
        },

        columns: function () {
            return [
                {
                    property: 'quantity',
                    label: this.$tc('lunar-payment.paymentDetails.basket.column.quantity'),
                    rawData: true
                },
                {
                    property: 'title',
                    label: this.$tc('lunar-payment.paymentDetails.basket.column.title'),
                    rawData: true
                },
                {
                    property: 'amountGross',
                    label: this.$tc('lunar-payment.paymentDetails.basket.column.amountGross'),
                    rawData: true
                },
                {
                    property: 'amountNet',
                    label: this.$tc('lunar-payment.paymentDetails.basket.column.amountNet'),
                    rawData: true
                }
            ];
        }
    }
});
