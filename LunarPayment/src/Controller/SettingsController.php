<?php declare(strict_types=1);

namespace LunarPayment\Controller;

use Shopware\Core\Framework\Context;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Shopware\Core\Framework\Routing\Annotation\RouteScope;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use LunarPayment\lib\ApiClient;
use LunarPayment\Helpers\ValidationHelper;
use LunarPayment\lib\Exception\ApiException;

/**
 *
 */
class SettingsController extends AbstractController
{
    private array $errors = [];
    private array $livePublicKeys = [];
    private array $testPublicKeys = [];

    /**
     * @RouteScope(scopes={"api"})
     * @Route("/api/_action/lunar_payment/validate-api-keys", name="api.action.lunar_payment.validate.api.keys", methods={"POST"})
     */
    public function validateApiKeys(Request $request, Context $context): JsonResponse
    {
        $liveAppKeyName = 'liveModeAppKey';
        $livePublicKeyName = 'liveModePublicKey';
        $testAppKeyName = 'testModeAppKey';
        $testPublicKeyName = 'testModePublicKey';

        $settingsKeys = json_decode($request->getContent())->keys;

        $this->validateLiveAppKey($settingsKeys->{$liveAppKeyName} ?? '');
        $this->validateLivePublicKey($settingsKeys->{$livePublicKeyName} ?? '');
        $this->validateTestAppKey($settingsKeys->{$testAppKeyName} ?? '');
        $this->validateTestPublicKey($settingsKeys->{$testPublicKeyName} ?? '');

        if (!empty($this->errors)) {
            return new JsonResponse([
                'status'  => empty($this->errors),
                'message' => 'Error',
                'code'    => 0,
                'errors'=> $this->errors,
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
     * LIVE KEYS VALIDATION
     */
    private function validateLiveAppKey($liveAppKeyValue)
    {
        if ($liveAppKeyValue) {

            $apiClient = new ApiClient($liveAppKeyValue);

            try {
                $identity = $apiClient->apps()->fetch();

            } catch (ApiException $exception) {
                $message = "The app key doesn't seem to be valid. <br>";
                $message = ValidationHelper::handleExceptions($exception, $message);

                $this->errors['liveModeAppKey'] = $message;
            }

            try {
                $merchants = $apiClient->merchants()->find($identity['id'] ?? '');
                if ($merchants) {
                    foreach ($merchants as $merchant) {
                        if ( ! $merchant['test']) {
                            $this->livePublicKeys[] = $merchant['key'];
                        }
                    }
                }
            } catch (ApiException $exception) {
                // handle this bellow
            }

            if (empty($this->livePublicKeys)) {
                $this->errors['liveModeAppKey'] = 'The private key is not valid or set to test mode.';
            }
        }
    }

    /**
     *
     */
    private function validateLivePublicKey($livePublicKeyValue)
    {
        if ($livePublicKeyValue && !empty($this->livePublicKeys)) {
            /** Check if the public key exists among the saved ones. */
            if (!in_array($livePublicKeyValue, $this->livePublicKeys)) {
                $this->errors['liveModePublicKey'] = 'The public key doesn\'t seem to be valid.';
            }
        }
    }

    /**
     * TEST KEYS VALIDATION
     */
    private function validateTestAppKey($testAppKeyValue)
    {
        if ($testAppKeyValue) {

            $apiClient = new ApiClient($testAppKeyValue);

            try {
                $identity = $apiClient->apps()->fetch();

            } catch (ApiException $exception) {
                $message = "The test app key doesn't seem to be valid. <br>";
                $message = ValidationHelper::handleExceptions($exception, $message);

                $this->errors['testModeAppKey'] = $message;
            }


            try {
                $merchants = $apiClient->merchants()->find($identity['id'] ?? '');
                if ($merchants) {
                    foreach ($merchants as $merchant) {
                        if ($merchant['test']) {
                            $this->testPublicKeys[] = $merchant['key'];
                        }
                    }
                }
            } catch (ApiException $exception) {
                // handle this bellow
            }

            if (empty($this->testPublicKeys)) {
                $this->errors['testModeAppKey'] = 'The test private key is not valid or set to live mode.';
            }
        }
    }

    /**
     *
     */
    private function validateTestPublicKey($testPublicKeyValue)
    {
        if ($testPublicKeyValue && !empty($this->testPublicKeys)) {
            /** Check if the public key exists among the saved ones. */
            if (!in_array($testPublicKeyValue, $this->testPublicKeys)) {
                $this->errors['testModePublicKey'] = 'The test public key doesn\'t seem to be valid.';
            }
        }
    }
}
