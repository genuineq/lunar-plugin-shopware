<?php declare(strict_types=1);

namespace LunarPayment\Controller;

use Shopware\Core\Framework\Context;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use LunarPayment\lib\ApiClient;
use LunarPayment\Helpers\PluginHelper;
use LunarPayment\Helpers\ValidationHelper;
use LunarPayment\lib\Exception\ApiException;

/**
 *
 */
class SettingsController extends AbstractController
{
    /** @var ApiClient */
    private $apiClient;

    private array $errors = [];
    private string $transactionMode = '';

    /**
     * @RouteScope(scopes={"api"})
     * @Route("/api/_action/lunar_payment/validate-api-keys", name="api.action.lunar_payment.validate.api.keys", methods={"POST"})
     */
    public function validateApiKeys(Request $request, Context $context): JsonResponse
    {

        /**
         * @TODO move/build code in specific methods
         */

        $dataSaveAllowed = false;

        $pluginName = PluginHelper::PLUGIN_NAME;
        $configPath = PluginHelper::PLUGIN_CONFIG_PATH;

        // $testAppKeyName = $configPath . 'testModeAppKey';
        // $testPublicKeyName = $configPath . 'testModePublicKey';
        // $liveAppKeyName = $configPath . 'liveModeAppKey';
        // $livePublicKeyName = $configPath . 'liveModePublicKey';

        $transactionModeKeyName = 'transactionMode';

        $testAppKeyName = 'testModeAppKey';
        $testPublicKeyName = 'testModePublicKey';
        $liveAppKeyName = 'liveModeAppKey';
        $livePublicKeyName = 'liveModePublicKey';

        $settingsKeys = json_decode($request->getContent())->keys;
        $this->transactionMode = ('test' == $settingsKeys->{$transactionModeKeyName}) ? ('test') : ('live');

        if ('live' == $this->transactionMode) {
            $appKeyValue = $settingsKeys->{$liveAppKeyName} ?? '';
        }
        if ('test' == $this->transactionMode) {
            $appKeyValue = $settingsKeys->{$testAppKeyName} ?? '';
        }

        $this->apiClient = new ApiClient($appKeyValue);


        try {
            $identity = $this->apiClient->apps()->fetch();

        } catch (ApiException $exception) {

            $message = "The app key doesn't seem to be valid.";
            $message = ValidationHelper::handleExceptions($exception, $message);

            $this->errors["{$this->transactionMode}ModeAppKey"] = $message;

            return new JsonResponse([
                'status'  => empty($this->errors),
                'message' => $message,
                'code'    => 0,
                'errors'=> $this->errors,
            ], 400);
        }

        try {
            $merchants = $this->apiClient->merchants()->find($identity['id']);
            if ($merchants) {
                foreach ($merchants as $merchant) {
                    if ($merchant['test']) {
                        $validationKeys[] = $merchant['key'];
                    }
                }
            }
        } catch (ApiException $exception) {
            // handle this bellow
        }

        if (empty($validationKeys)) {
            return new JsonResponse([
                'status'  =>  empty($this->errors),
                'message' => 'The test private key is not valid or set to live mode.',
                'code'    => 0,
                'errors'  => $this->errors,
            ], 400);
        }

        return new JsonResponse([
            'status'  =>  empty($this->errors),
            'message' => 'Success',
            'code'    => 0,
            'errors'  => $this->errors,
        ], 200); // need to adapt this response
    }

    /**
     *
     */
    public function validateAppKey($testAppKeyValue)
    {

    }

    /**
     *
     */
    public function validatePublicKey($testPublicKeyValue)
    {

    }

    // /**
    //  *
    //  */
    // public function validateTestAppKey($testAppKeyValue)
    // {

    // }

    // /**
    //  *
    //  */
    // public function validateTestPublicKey($testPublicKeyValue)
    // {

    // }

    // /**
    //  *
    //  */
    // public function validateLiveAppKey($liveAppKeyValue)
    // {

    // }

    // /**
    //  *
    //  */
    // public function validateLivePublicKey($livePublicKeyValue)
    // {

    // }
}
