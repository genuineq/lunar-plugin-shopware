/**
 * snippet
 */
import enGB from '../../snippet/en_GB.json';

/**
 * component
 */
import './component/lunar-payment-actions';
import './component/lunar-payment-history';

/**
 * extension
 */
import './extension/sw-order-detail';
import './extension/sw-order-list';

/**
 * page
 */
import './page/lunar-payment-tab';



Shopware.Module.register('lunar-payment', {
    type: 'plugin',
    name: 'LunarPayment',
    title: 'lunar-payment.general.title',
    description: 'lunar-payment.general.descriptionTextModule',
    version: '1.0.0',
    targetVersion: '1.0.0',

    snippets: {
        'en-GB': enGB
    },

    routeMiddleware(next, currentRoute) {
        if (currentRoute.name === 'sw.order.detail') {
            currentRoute.children.push({
                component: 'lunar-payment-tab',
                name: 'lunar-payment.payment-history',
                path: '/sw/order/detail/:id/lunar-payment',
                isChildren: true,
                meta: {
                    parentPath: 'sw.order.index'
                }
            });
        }

        next(currentRoute);
    }
});
