/**
 * component
 */
import './component/lunar-payment-plugin-icon';

/**
 * extension
 */
import './extension/sw-settings-index';

/**
 * page
 */
import './page/lunar-settings';


/**
 * REGISTER
 */
Shopware.Module.register('lunar-payment', {
    type: 'plugin',
    name: 'LunarPayment',
    title: 'Lunar Payment',
    description: 'Lunar Payment plugin',
    version: '1.0.0',
    targetVersion: '1.0.0',
    icon: 'default-action-settings',

    routes: {
        index: {
            component: 'lunar-settings',
            path: 'index',
            meta: {
                parentPath: 'sw.settings.index',
            },
        },
    },

    settingsItem: {
        group: 'plugins',
        to: 'lunar.payment.index',
        iconComponent: 'lunar-payment-plugin-icon',
        backgroundEnabled: true,
    },
});
