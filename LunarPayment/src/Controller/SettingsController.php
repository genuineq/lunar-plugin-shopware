<?php declare(strict_types=1);

namespace LunarPayment\Controller;

use Shopware\Core\Framework\Context;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;

use LunarPayment\lib\ApiClient;
use LunarPayment\Helpers\PluginHelper;
use LunarPayment\Helpers\ValidationHelper;
use LunarPayment\lib\Exception\ApiException;

/**
 *
 */
class SettingsController extends AbstractController
{
    /** @var EntityRepository */
    private $stateMachineTransitionRepository;


    public function __construct(
        EntityRepository $stateMachineTransitionRepository
    ) {
        $this->stateMachineTransitionRepository = $stateMachineTransitionRepository;
    }

    /**
     * @RouteScope(scopes={"api"})
     * @Route("/api/_action/lunar_payment/validate-api-keys", name="api.action.lunar_payment.validate.api.keys", methods={"POST"})
     */
    public function validateApiKeys(Request $request, Context $context): JsonResponse
    {

        /**
         * @TODO move/build code in specific methods
         */

        $dataSaveAllowed = true;

        $pluginName = PluginHelper::PLUGIN_NAME;
        $configPath = PluginHelper::PLUGIN_CONFIG_PATH;

        $testAppKeyName = $configPath . 'testModeAppKey';
        $testPublicKeyName = $configPath . 'testModePublicKey';
        $liveAppKeyName = $configPath . 'liveModeAppKey';
        $livePublicKeyName = $configPath . 'liveModePublicKey';

        if ($pluginName !== $request->key) { // replace key with proper params extraction from request
            return; // @TODO return json
        }

        $apiClient = new ApiClient($testAppKeyValue);

        try {
            $identity = $apiClient->apps()->fetch();
        } catch (ApiException $exception) {
            /** Prevent saving key */
            $dataSaveAllowed = false;

            $message = "The test private key doesn't seem to be valid.";
            $message = ValidationHelper::handleExceptions($exception, $message);

            return new JsonResponse([
                'status'  => false,
                'message' => $message,
                'code'    => 0,
                'errors'=> $errors,
            ], 400);
        }

        try {
            $merchants = $apiClient->merchants()->find($identity['id']);
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
            /** Mark the new value as invalid */
            $dataSaveAllowed = false;

            $message = __("The test private key is not valid or set to live mode.");
            throw new \Exception($message);
        }

        return new JsonResponse([
            'status'  => true,
            'message' => 'Success',
            'code'    => 0,
            'errors'=> [],
        ], 200); // need to adapt this response
    }

    /**
     *
     */
    public function validateTestAppKey($testAppKeyValue)
    {

    }

    /**
     *
     */
    public function validateTestPublicKey($testPublicKeyValue)
    {

    }

    /**
     *
     */
    public function validateLiveAppKey($liveAppKeyValue)
    {

    }

    /**
     *
     */
    public function validateLivePublicKey($livePublicKeyValue)
    {

    }
}
