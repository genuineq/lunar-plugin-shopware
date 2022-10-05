const { Application } = Shopware;
const ApiService = Shopware.Classes.ApiService;

class LunarPaymentService extends ApiService {
    constructor(httpClient, loginService, apiEndpoint = 'lunar_payment') {
        super(httpClient, loginService, apiEndpoint);
        this.apiRoute = `_action/${this.getApiBasePath()}`;
    }

    fetchPaymentDetails(orderTransactionId) {
        return this.httpClient.post(
            this.apiRoute + '/fetch-transaction/' + orderTransactionId,
            {
                headers: this.getBasicHeaders()
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    capturePayment(lunarTransactionId) {
        return this.httpClient.post(
            this.apiRoute + '/capture/' + lunarTransactionId,
            {
                headers: this.getBasicHeaders()
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    refundPayment(lunarTransactionId) {
        return this.httpClient.post(
            this.apiRoute + '/refund/' + lunarTransactionId,
            {
                headers: this.getBasicHeaders()
            }
        ).then((response) => {
            return ApiService.handleResponse(response);
        });
    }

    voidPayment(lunarTransactionId) {
        return this.httpClient.post(
            this.apiRoute + '/void/' + lunarTransactionId,
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
