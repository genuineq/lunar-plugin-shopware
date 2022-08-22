# Shopware 6 plugin for Lunar

Released under the GPL V3 license: https://opensource.org/licenses/GPL-3.0

## Supported Shopware versions

[![Last succesfull test](https://log.derikon.ro/api/v1/log/read?tag=shopware6&view=svg&label=Shopware&key=ecommerce&background=F26322)](https://log.derikon.ro/api/v1/log/read?tag=shopware6&view=html)

*The plugin has been tested with most versions of Shopware at every iteration. We recommend using the latest version of Shopware, but if that is not possible for some reason, test the plugin with your Shopware version and it would probably function properly.*


## Automatic installation

Once you have installed Shopware, follow these simple steps:
  1. Signup at [lunar.app](https://www.lunar.app) (it’s free);
  1. Create an account;
  1. Create app/public keys pair for your Shopware website;
  1. Upload the plugin archive trough the `/admin#/sw/extension/my-extensions/listing` page (`Upload extension` button) or follow the steps from `Manual installation` section bellow.
  1. The plugin will be active by default;
  1. Insert the app key and your public key in the plugin config for the Lunar plugin (`/admin#/sw/extension/config/LunarPayment`).


## Manual installation

  1. Download the plugin archive from this repository releases;
  1. Login to your Web Hosting site (for details contact your hosting provider);
  1. Open some kind File Manager for listing Hosting files and directories and locate the Shopware root directory where is installed (also can be FTP or Filemanager in CPanel for example);
  1. Unzip the file in a temporary directory;
  1. Upload the content of the unzipped extension without the original folder (only content of unzipped folder) into the Shopware `<SHOPWARE_ROOT_FOLDER>/custom/plugins/` folder (create empty folders "/custom/plugins/LunarPayment" if needed);
  1. Login to your Shopware Hosting site using SSH connection (for details contact our hosting provider);
  1. Run the following commands from the Shopware root directory:

            bin/console plugin:refresh
            bin/console plugin:install LunarPayment
            bin/console cache:clear

  1. Open the Shopware Admin panel;
  1. The plugin should now be auto installed and visible under `/admin#/sw/extension/my-extensions/listing` page;
  1. Insert the app key and your public key in the plugin config for the Lunar plugin.


## Updating settings

Under the Shopware Lunar payment method config, you can:
  * Activate/deactivate the plugin
  * Activate/deactivate the payment method from plugin
  * Update the payment method name & description in the payment methods settings
  * Update the title & description that shows up in the payment popup
  * Add public & app keys
  * Change the capture mode (Instant/Delayed by changing the order status)

#### NOTE: the plugin logs are enabled by default and cannot be changed (for the moment)

 ## How to

  1. Capture
      * In Instant mode, the orders are captured automatically
      * In delayed mode you can capture an order changing the Payment Status of an order to `Paid`
  2. Refund
      * To refund an order you can change the Payment Status of an order to `Refunded`
  3. Void
      * To void an order you can change the Payment Status of an order to `Cancelled`

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
