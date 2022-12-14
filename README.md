# Shopware 6 plugin for Lunar

Released under the GPL V3 license: https://opensource.org/licenses/GPL-3.0

## Supported Shopware versions

[![Last succesfull test](https://log.derikon.ro/api/v1/log/read?tag=shopware6&view=svg&label=Shopware&key=ecommerce&background=F26322)](https://log.derikon.ro/api/v1/log/read?tag=shopware6&view=html)

*The plugin has been tested with most versions of Shopware at every iteration. We recommend using the latest version of Shopware, but if that is not possible for some reason, test the plugin with your Shopware version and it would probably function properly.*


## Automatic installation

Once you have installed Shopware, follow these simple steps:
  1. Sign up at [lunar.app](https://www.lunar.app) (it’s free);
  1. Create an account;
  1. Create app/public keys pair for your Shopware website;
  1. Upload the plugin archive trough the `/admin#/sw/extension/my-extensions/listing` page (`Upload extension` button) or follow the steps from `Manual installation` section bellow.
  1. Activate the plugin from `/admin#/sw/extension/my-extensions/listing` page;
  1. Insert your app and public keys in the plugin settings (`<DOMAIN_URL>/admin#/lunar/payment/settings/index`).
  1. Change other settings according to your needs.


## Manual installation

  1. Download the plugin archive from this repository releases;
  1. Login to your Web Hosting site (for details contact your hosting provider);
  1. Open some kind File Manager for listing Hosting files and directories and locate the Shopware root directory where is installed (also can be FTP or Filemanager in CPanel for example);
  1. Unzip the file in a temporary directory;
  1. Upload the content of the unzipped extension without the original folder (only content of unzipped folder) into the Shopware `<SHOPWARE_ROOT_FOLDER>/custom/plugins/` folder (create empty folders "/custom/plugins/LunarPayment" if needed);
  1. Login to your Shopware Hosting site using SSH connection (for details contact our hosting provider);
  1. Run the following commands from the Shopware root directory:

            bin/console plugin:refresh
            bin/console plugin:install --activate LunarPayment
            bin/console cache:clear

  1. Open the Shopware Admin panel;
  1. The plugin should now be auto installed and visible under `/admin#/sw/extension/my-extensions/listing` page;
  1. Insert the app key and your public key in the plugin settings (`<DOMAIN_URL>/admin#/lunar/payment/settings/index`).
  1. Change other settings according to your needs.


## Updating settings

Under the Shopware Lunar payment method config (`/admin#/sw/extension/my-extensions/listing`), you can:
  * Activate/deactivate the plugin
  * Uninstall the plugin

Under the Shopware Lunar payment method settings (`/admin#/lunar/payment/settings/index`), you can:
  * Activate/deactivate the payment method from plugin
  * Update the payment method name & description in the payment methods settings
  * Update the title & description that shows up in the payment popup
  * Add public & app keys
  * Change the capture mode (Instant/Delayed by changing the order status)

#### NOTE: the plugin logs are enabled by default and cannot be changed (for the moment)

 ## How to

  1. Capture
      * In Instant mode, the orders are captured automatically
      * In delayed mode you can press `Capture` button from Order details page, Lunar Payment tab.
  2. Refund
      * To refund an order you can press `Refund` button from Order details page, Lunar Payment tab
  3. Void
      * To void an order you can press `Void (cancel)` button from Order details page, Lunar Payment tab

  ## Available features

  1. Capture
      * Shopware admin panel: full capture
      * Lunar admin panel: full/partial capture
  2. Refund
      * Shopware admin panel: full refund
      * Lunar admin panel: full/partial refund
  3. Void
      * Shopware admin panel: full void
      * Lunar admin panel: full/partial void
