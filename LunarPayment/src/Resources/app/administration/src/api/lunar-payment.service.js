const { Application } = Shopware;
const ApiService = Shopware.Classes.ApiService;

class LunarPaymentService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'lunar_payment') {
        super(httpClient, loginService, apiEndpoint);
        this.apiRoute = `_action/${this.getApiBasePath()}`;
        this.basicHeaders = this.getBasicHeaders();
    }

    fetchLunarTransactions(orderId) {
        return this.httpClient.post(
            this.apiRoute + `/${orderId}/fetch-transactions`,
            {
                headers: this.basicHeaders
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    capturePayment(params) {
        return this.httpClient.post(
            this.apiRoute + `/capture`,
            {
                params: params,
                headers: this.basicHeaders
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    refundPayment(params) {
        return this.httpClient.post(
            this.apiRoute + `/refund`,
            {
                params: params,
                headers: this.basicHeaders
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    voidPayment(params) {
        return this.httpClient.post(
            this.apiRoute + `/void`,
            {
                params: params,
                headers: this.basicHeaders
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
