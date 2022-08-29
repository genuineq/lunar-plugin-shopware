import template from './lunar-settings.html.twig';

const { Component, Mixin } = Shopware;
const { object, types } = Shopware.Utils;

Component.register('lunar-settings', {
    template,

    mixins: [
        Mixin.getByName('notification'),
        Mixin.getByName('sw-inline-snippet')
    ],

    props: {
    },

    inject: [
        'LunarPaymentSettingsService',
    ],

    data() {
        return {
            isLoading: false,
            isTesting: false,
            isSaveSuccessful: false,
            isTestSuccessful: false,
            config: {},
            configPath: 'LunarPayment.settings.',
            liveAppConfigKey: 'liveModeAppKey',
            livePublicConfigKey: 'liveModePublicKey',
            testAppConfigKey: 'testModeAppKey',
            testPublicConfigKey: 'testModePublicKey',
            liveAppKeyFilled: false,
            livePublicKeyFilled: false,
            testAppKeyFilled: false,
            testPublicKeyFilled: false,
            showValidationErrors: false,
            transactionMode: [],
            captureMode: [],
            acceptedCards: [],
        };
    },

    created() {
        this.generateFieldsOptions();
    },

    computed: {
        credentialsMissing: function() {
            return !this.testAppKeyFilled
            || !this.testPublicKeyFilled
            // || !this.liveAppKeyFilled
            // || !this.livePublicKeyFilled;
        }
    },

    metaInfo() {
        return {
            title: this.$createTitle()
        };
    },

    methods: {
        saveFinish() {
            this.isSaveSuccessful = false;
        },

        onConfigChange(config) {
            this.config = config;
            this.checkCredentialsFilled();
            this.showValidationErrors = false;
        },

        checkCredentialsFilled() {
            // this.liveAppKeyFilled = !!this.getConfigValue(this.liveAppConfigKey);
            // this.livePublicKeyFilled = !!this.getConfigValue(this.livePublicConfigKey);
            this.testAppKeyFilled = !!this.getConfigValue(this.testAppConfigKey);
            this.testPublicKeyFilled = !!this.getConfigValue(this.testPublicConfigKey);
        },

        getConfigValue(field) {
            const defaultConfig = this.$refs.systemConfig.actualConfigData.null;
            const salesChannelId = this.$refs.systemConfig.currentSalesChannelId;

            if (salesChannelId === null) {
                return this.config[`${this.configPath}${field}`];
            }
            return this.config[`${this.configPath}${field}`]
                    || defaultConfig[`${this.configPath}${field}`];
        },

        onSave() {
            if (this.credentialsMissing) {
                this.showValidationErrors = true;
                return;
            }

            this.isSaveSuccessful = false;
            this.isLoading = true;

            let credentials = {
                // liveModeAppKey: this.getConfigValue(this.liveAppConfigKey),
                // liveModePublicKey: this.getConfigValue(this.livePublicConfigKey),
                testModeAppKey: this.getConfigValue(this.testAppConfigKey),
                testModePublicKey: this.getConfigValue(this.testPublicConfigKey),
            }

            /** Validate API keys */
            this.LunarPaymentSettingsService.validateApiKeys(credentials).then((response) => {
                const credentialsValid = response.credentialsValid;
                const errors = response.errors;

                if (credentialsValid) {
                    this.createNotificationSuccess({
                        title: 'success title',
                        message: 'valid success message',
                    });

                    /** Save configuration. */
                    this.$refs.systemConfig.saveAll().then(() => {
                        this.isLoading = false;
                        this.isSaveSuccessful = true;
                    }).catch((errorResponse) => {
                        this.createNotificationError({
                            title: 'config save error title',
                            message: 'config save error general message',
                        });
                        this.isLoading = false;
                        this.isSaveSuccessful = false;
                    });

                } else {
                    for(let key in errors) {
                        if(errors.hasOwnProperty(key)) {
                            this.createNotificationError({
                                title: 'error title',
                                message: 'error validation message',
                            });
                        }
                    }
                }
                this.isLoading = false;

            }).catch((errorResponse) => {
                this.createNotificationError({
                    title: 'general error title',
                    message: 'error general message',
                });
                this.isLoading = false;
                this.isSaveSuccessful = false;
            });
        },

        generateFieldsOptions() {
            this.transactionMode.push(
                {'label':'Live', 'value':'live',},
                {'label':'Test', 'value':'test',},
            );

            this.captureMode.push(
                {'label':'Delayed', 'value':'delayed',},
                {'label':'Instant', 'value':'instant',},
            );

            this.acceptedCards.push(
                {'label':'Visa',         'value':'visa',},
                {'label':'Visaelectron', 'value':'visaelectron',},
                {'label':'Mastercard',   'value':'mastercard',},
                {'label':'Maestro',      'value':'maestro',},
            );
        },

        getBind(element, config) {
            let originalElement;

            if (config !== this.config) {
                this.config = config;
            }

            // if (this.showValidationErrors) {
            //     if (element.name === `${this.configPath}${this.liveAppConfigKey}` && !this.liveAppKeyFilled) {
            //         element.config.error = {
            //             code: 1,
            //             detail: 'The App Key must not be empty'
            //         };
            //     }
            //     if (element.name === `${this.configPath}${this.livePublicConfigKey}` && !this.livePublicKeyFilled) {
            //         element.config.error = {
            //             code: 1,
            //             detail: 'The Public Key must not be empty'
            //         };
            //     }
            // }

            if (this.showValidationErrors) {
                if (element.name === `${this.configPath}${this.testAppConfigKey}` && !this.testAppKeyFilled) {
                    element.config.error = {
                        code: 1,
                        detail: 'The App Key must not be empty'
                    };
                }
                if (element.name === `${this.configPath}${this.testPublicConfigKey}` && !this.testPublicKeyFilled) {
                    element.config.error = {
                        code: 1,
                        detail: 'The Public Key must not be empty'
                    };
                }
            }

            this.$refs.systemConfig.config.forEach((configElement) => {
                configElement.elements.forEach((child) => {
                    if (child.name === element.name) {
                        originalElement = child;
                        return;
                    }
                });
            });

            return originalElement || element;
        },

        getElementBind(element) {
            const bind = object.deepCopyObject(element);

            if (['single-select', 'multi-select'].includes(bind.type)) {
                bind.config.labelProperty = 'name';
                bind.config.valueProperty = 'id';
            }

            return bind;
        },
    }
});
