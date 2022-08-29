const { Application } = Shopware;
const ApiService = Shopware.Classes.ApiService;

class LunarPaymentService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'lunar') {
        super(httpClient, loginService, apiEndpoint);
        this.apiRoute = `_action/${this.getApiBasePath()}/capture-payment`;
    }

    capturePayment(requestBody) {
        return this.httpClient.post(
            this.apiRoute,
            requestBody,
            {
                headers: this.getBasicHeaders()
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    refundPayment(requestBody) {
        return this.httpClient.post(
            this.apiRoute,
            requestBody,
            {
                headers: this.getBasicHeaders()
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    voidPayment(requestBody) {
        return this.httpClient.post(
            this.apiRoute,
            requestBody,
            {
                headers: this.getBasicHeaders()
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }
}

Application.addServiceProvider('LunarPaymentService', (container) => {
    const initContainer = Application.getContainer('init');

    return new LunarPaymentService(initContainer.httpClient, container.loginService);
});
