import template from './sw-order-create-details-footer.html.twig';

const { Criteria } = Shopware.Data;

const lunarPaymentId = '1a9bc76a3c244278a51a2e90c1e6f040';

Shopware.Component.override('sw-order-create-details-footer', {
    template,

    computed: {
        paymentMethodCriteria() {
            /** @var {Criteria} paymentCriteria */
            const criteria = new Criteria();

            if (this.salesChannelId) {
                criteria.addFilter(Criteria.equals('salesChannels.id', this.salesChannelId));
            }

            criteria.addFilter(Criteria.equals('id', lunarPaymentId));

            return criteria;
        }
    }
});
