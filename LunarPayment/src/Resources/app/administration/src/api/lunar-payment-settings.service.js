const { Application } = Shopware;
const ApiService = Shopware.Classes.ApiService;

class LunarPaymentSettingsService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'lunar_payment') {
        super(httpClient, loginService, apiEndpoint);
    }

    validateApiKeys(keys) {
        const headers = this.getBasicHeaders();

        return this.httpClient
            .post(
                `_action/${this.getApiBasePath()}/validate-api-keys`,
                {
                    keys: keys,
                },
                {
                    headers: headers
                }
            )
            .then((response) => {
                return ApiService.handleResponse(response);
            });
    }
}

Application.addServiceProvider('LunarPaymentSettingsService', (container) => {
    const initContainer = Application.getContainer('init');

    return new LunarPaymentSettingsService(initContainer.httpClient, container.loginService);
});
