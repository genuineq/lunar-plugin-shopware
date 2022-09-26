!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/bundles/lunarpayment/",n(n.s="OgNo")}({"+RLx":function(e,t){e.exports='{% block lunar_payment %}\n<sw-page class="lunar-payment">\n\n    {% block lunar_payment_header %}\n    <template #smart-bar-header>\n        <h2>\n            {{ $tc(\'sw-settings.index.title\') }}\n            <sw-icon name="small-arrow-medium-right" small></sw-icon>\n            {{ $tc(\'lunar-payment.title\') }}\n        </h2>\n    </template>\n    {% endblock %}\n\n    {% block lunar_payment_actions %}\n    <template #smart-bar-actions>\n        {% block lunar_payment_settings_actions_save %}\n        <sw-button-process\n                class="sw-settings-login-registration__save-action"\n                :isLoading="isLoading"\n                :processSuccess="isSaveSuccessful"\n                :disabled="isLoading"\n                variant="primary"\n                @process-finish="saveFinish"\n                @click="onSave">\n            {{ $tc(\'lunar-payment.settings.save\') }}\n        </sw-button-process>\n        {% endblock %}\n    </template>\n    {% endblock %}\n\n    {% block lunar_payment_settings_content %}\n    <template #content>\n        <sw-card-view>\n            <sw-system-config\n                class="lunar-config__wrapper"\n                ref="systemConfig"\n                salesChannelSwitchable\n                inherit\n                @config-changed="onConfigChange"\n                domain="LunarPayment.settings">\n\n                <template #card-element="{element, config, card}">\n                    <div>\n\n                        <sw-form-field-renderer\n                            v-if="!element.name.includes(\'transactionMode\') || !element.name.includes(\'supportedCards\') || !element.name.includes(\'captureMode\')"\n                            v-bind="getElementBind(getBind(element, config))"\n                            v-model="config[element.name]"\n                        />\n\n                        <sw-form-field-renderer\n                            v-else-if="element.name.includes(\'transactionMode\')"\n                            :config="{\n                                componentName: \'sw-single-select\',\n                                label: getInlineSnippet(getElementBind(getBind(element, config)).config.label),\n                                helpText: getInlineSnippet(getElementBind(getBind(element, config)).config.helpText),\n                            }"\n                            v-model="config[element.name]"\n                        />\n\n                        <sw-form-field-renderer\n                            v-else-if="element.name.includes(\'captureMode\')"\n                            :config="{\n                                componentName: \'sw-single-select\',\n                                label: getInlineSnippet(getElementBind(getBind(element, config)).config.label),\n                                helpText: getInlineSnippet(getElementBind(getBind(element, config)).config.helpText),\n                            }"\n                            v-model="config[element.name]"\n                        />\n\n                        <sw-form-field-renderer\n                            v-else-if="element.name.includes(\'supportedCards\')"\n                            :config="{\n                                componentName: \'sw-multi-select\',\n                                label: getInlineSnippet(getElementBind(getBind(element, config)).config.label),\n                                helpText: getInlineSnippet(getElementBind(getBind(element, config)).config.helpText),\n                            }"\n                            v-model="config[element.name]"\n                        />\n\n                    </div>\n                </template>\n            </sw-system-config>\n        </sw-card-view>\n    </template>\n    {% endblock %}\n\n</sw-page>\n{% endblock %}\n'},CrxK:function(e){e.exports=JSON.parse('{"lunar-payment":{"title":"Lunar Payment","general":{"mainMenuItemGeneral":"Lunar Payment","descriptionTextModule":"Settings for Lunar Payment"},"capture":{"buttonTitle":"Capture","successMessage":"Capture was successful.","errorMessage":"Capture action failed.","tooltips":{"impossible":"Capture not possible"}},"refund":{"buttonTitle":"Refund","successMessage":"Refund was successful.","errorMessage":"Refund action failed.","tooltips":{"impossible":"Refund not possible"}},"void":{"buttonTitle":"Void","successMessage":"Void was successful.","errorMessage":"Void action failed.","tooltips":{"impossible":"Void not possible"}},"modal":{"capture":{"title":"Capture","submit":"Capture","fullSubmit":"Full capture","amount":"Capture amount","captured":"Captured amount"},"refund":{"title":"Refund","submit":"Refund","fullSubmit":"Full Refund","amount":"Refund amount","refunded":"Refunded amount"},"orderAmount":"Order amount","remainingAmount":"Remaining amount","shippingCosts":"Shipping costs","descriptionHelpText":"Description help text","close":"Close","labelComment":"Label comment","columns":{"reference":"Reference","product":"Product","quantity":"Quantity","price":"Price"}},"settings":{"save":"Save","titleSuccess":"Success","titleError":"Error","generalSuccess":"All settings were saved.","generalError":"An error occurred. Please verify fields data and try again.","generalSaveError":"An error occurred during save settings. Please verify fields data and try again.","liveAppKeyInvalid":"The App key is invalid","livePublicKeyInvalid":"The Public key is invalid","testAppKeyInvalid":"The test App key is invalid","testPublicKeyInvalid":"The test Public key is invalid"},"messageNotBlank":"This field must not be empty.","transactionId":"transaction ID","orderTransactionState":"Order transaction state","error":{"transaction":{"notFound":"No matching transaction could be found","orderNotFound":"No matching order could be found"}}}}')},HKqZ:function(e,t,n){var i=n("y0UL");i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[e.i,i,""]]),i.locals&&(e.exports=i.locals);(0,n("SZ7m").default)("633a95cc",i,!0,{})},OgNo:function(e,t,n){"use strict";n.r(t);var i=n("CrxK"),r=n("pqxS"),o=n.n(r);n("gSks");Shopware.Component.register("lunar-payment-plugin-icon",{template:o.a});var s=n("VXoL"),a=n.n(s);n("HKqZ");Shopware.Component.override("sw-settings-index",{template:a.a});var l=n("+RLx"),c=n.n(l);function u(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null==n)return;var i,r,o=[],s=!0,a=!1;try{for(n=n.call(e);!(s=(i=n.next()).done)&&(o.push(i.value),!t||o.length!==t);s=!0);}catch(e){a=!0,r=e}finally{try{s||null==n.return||n.return()}finally{if(a)throw r}}return o}(e,t)||function(e,t){if(!e)return;if("string"==typeof e)return p(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return p(e,t)}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function p(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=new Array(t);n<t;n++)i[n]=e[n];return i}var f=Shopware,d=f.Component,g=f.Mixin,h=Shopware.Utils,m=h.object;h.types;d.register("lunar-settings",{template:c.a,mixins:[g.getByName("notification"),g.getByName("sw-inline-snippet")],props:{},inject:["LunarPaymentSettingsService"],data:function(){return{isLoading:!1,isTesting:!1,isSaveSuccessful:!1,isTestSuccessful:!1,config:{},configPath:"LunarPayment.settings.",transactionModeConfigKey:"transactionMode",transactionMode:"",liveAppConfigKey:"liveModeAppKey",livePublicConfigKey:"liveModePublicKey",testAppConfigKey:"testModeAppKey",testPublicConfigKey:"testModePublicKey",liveAppKeyFilled:!1,livePublicKeyFilled:!1,testAppKeyFilled:!1,testPublicKeyFilled:!1,showValidationErrors:!1,showApiErrors:!1,apiResponseErrors:{}}},created:function(){},computed:{credentialsMissing:function(){switch(this.transactionMode){case"live":return!this.liveAppKeyFilled||!this.livePublicKeyFilled;case"test":return!this.testAppKeyFilled||!this.testPublicKeyFilled}}},metaInfo:function(){return{title:this.$createTitle()}},methods:{saveFinish:function(){this.isSaveSuccessful=!1},onConfigChange:function(e){this.config=e,this.checkCredentialsFilled(),this.showValidationErrors=!1,this.showApiErrors=!1},checkCredentialsFilled:function(){this.liveAppKeyFilled=!!this.getConfigValue(this.liveAppConfigKey),this.livePublicKeyFilled=!!this.getConfigValue(this.livePublicConfigKey),this.testAppKeyFilled=!!this.getConfigValue(this.testAppConfigKey),this.testPublicKeyFilled=!!this.getConfigValue(this.testPublicConfigKey)},getConfigValue:function(e){var t=this.$refs.systemConfig.actualConfigData.null;return null===this.$refs.systemConfig.currentSalesChannelId?this.config["".concat(this.configPath).concat(e)]:this.config["".concat(this.configPath).concat(e)]||t["".concat(this.configPath).concat(e)]},onSave:function(){var e=this;this.transactionMode=this.getConfigValue(this.transactionModeConfigKey);var t=this.$tc("lunar-payment.settings.titleError");if(this.credentialsMissing){this.showValidationErrors=!0;var n="";switch(this.transactionMode){case"live":!this.liveAppKeyFilled&&(n+=this.$tc("lunar-payment.settings.liveAppKeyInvalid")+"<br>"),!this.livePublicKeyFilled&&(n+=this.$tc("lunar-payment.settings.livePublicKeyInvalid")+"<br>");break;case"test":!this.testAppKeyFilled&&(n+=this.$tc("lunar-payment.settings.testAppKeyInvalid")+"<br>"),!this.testPublicKeyFilled&&(n+=this.$tc("lunar-payment.settings.testPublicKeyInvalid")+"<br>")}return this.createNotificationError({title:t,message:n}),this.isLoading=!1,void(this.isSaveSuccessful=!1)}this.isSaveSuccessful=!1,this.isLoading=!0;var i={transactionMode:this.getConfigValue(this.transactionModeConfigKey),liveModeAppKey:this.getConfigValue(this.liveAppConfigKey),liveModePublicKey:this.getConfigValue(this.livePublicConfigKey),testModeAppKey:this.getConfigValue(this.testAppConfigKey),testModePublicKey:this.getConfigValue(this.testPublicConfigKey)};this.LunarPaymentSettingsService.validateApiKeys(i).then((function(n){e.$refs.systemConfig.saveAll().then((function(){e.createNotificationSuccess({title:e.$tc("lunar-payment.settings.titleSuccess"),message:e.$tc("lunar-payment.settings.generalSuccess")}),e.isLoading=!1,e.isSaveSuccessful=!0})).catch((function(n){e.createNotificationError({title:t,message:e.$tc("lunar-payment.settings.generalSaveError")}),e.isLoading=!1,e.isSaveSuccessful=!1})),e.isLoading=!1})).catch((function(n){var i=n.response.data.errors;Object.entries(i).forEach((function(n){var i=u(n,2),r=(i[0],i[1]);e.createNotificationError({title:t,message:r})})),e.showApiErrors=!0,e.apiResponseErrors=i,e.isLoading=!1,e.isSaveSuccessful=!1}))},getBind:function(e,t){var n={code:1,detail:this.$tc("lunar-payment.messageNotBlank")};if(t!==this.config&&(this.config=t),this.showValidationErrors)switch(this.transactionMode){case"live":e.name!=="".concat(this.configPath).concat(this.liveAppConfigKey)||this.liveAppKeyFilled||(e.config.error=n),e.name!=="".concat(this.configPath).concat(this.livePublicConfigKey)||this.livePublicKeyFilled||(e.config.error=n);break;case"test":e.name!=="".concat(this.configPath).concat(this.testAppConfigKey)||this.testAppKeyFilled||(e.config.error=n),e.name!=="".concat(this.configPath).concat(this.testPublicConfigKey)||this.testPublicKeyFilled||(e.config.error=n)}return this.showApiErrors&&(e.name==="".concat(this.configPath).concat(this.liveAppConfigKey)&&this.apiResponseErrors.hasOwnProperty(this.liveAppConfigKey)&&(e.config.error={code:1,detail:this.$tc("lunar-payment.settings.liveAppKeyInvalid")}),e.name==="".concat(this.configPath).concat(this.livePublicConfigKey)&&this.apiResponseErrors.hasOwnProperty(this.livePublicConfigKey)&&(e.config.error={code:1,detail:this.$tc("lunar-payment.settings.livePublicKeyInvalid")}),e.name==="".concat(this.configPath).concat(this.testAppConfigKey)&&this.apiResponseErrors.hasOwnProperty(this.testAppConfigKey)&&(e.config.error={code:1,detail:this.$tc("lunar-payment.settings.testAppKeyInvalid")}),e.name==="".concat(this.configPath).concat(this.testPublicConfigKey)&&this.apiResponseErrors.hasOwnProperty(this.testPublicConfigKey)&&(e.config.error={code:1,detail:this.$tc("lunar-payment.settings.testPublicKeyInvalid")})),e},getElementBind:function(e){var t=m.deepCopyObject(e);return["single-select","multi-select"].includes(t.type)&&(t.config.labelProperty="name",t.config.valueProperty="id"),t}}});var y={type:"plugin",name:"LunarPayment",title:"Lunar Payment",description:"Lunar Payment plugin",version:"1.0.0",targetVersion:"1.0.0",icon:"default-action-settings",snippets:{"en-GB":i},routes:{index:{component:"lunar-settings",path:"index",meta:{parentPath:"sw.settings.index"}}},settingsItem:{group:"plugins",to:"lunar.payment.index",iconComponent:"lunar-payment-plugin-icon",backgroundEnabled:!1}};Shopware.Module.register("lunar-payment",y);n("taNh")},SZ7m:function(e,t,n){"use strict";function i(e,t){for(var n=[],i={},r=0;r<t.length;r++){var o=t[r],s=o[0],a={id:e+":"+r,css:o[1],media:o[2],sourceMap:o[3]};i[s]?i[s].parts.push(a):n.push(i[s]={id:s,parts:[a]})}return n}n.r(t),n.d(t,"default",(function(){return g}));var r="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!r)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var o={},s=r&&(document.head||document.getElementsByTagName("head")[0]),a=null,l=0,c=!1,u=function(){},p=null,f="data-vue-ssr-id",d="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function g(e,t,n,r){c=n,p=r||{};var s=i(e,t);return h(s),function(t){for(var n=[],r=0;r<s.length;r++){var a=s[r];(l=o[a.id]).refs--,n.push(l)}t?h(s=i(e,t)):s=[];for(r=0;r<n.length;r++){var l;if(0===(l=n[r]).refs){for(var c=0;c<l.parts.length;c++)l.parts[c]();delete o[l.id]}}}}function h(e){for(var t=0;t<e.length;t++){var n=e[t],i=o[n.id];if(i){i.refs++;for(var r=0;r<i.parts.length;r++)i.parts[r](n.parts[r]);for(;r<n.parts.length;r++)i.parts.push(y(n.parts[r]));i.parts.length>n.parts.length&&(i.parts.length=n.parts.length)}else{var s=[];for(r=0;r<n.parts.length;r++)s.push(y(n.parts[r]));o[n.id]={id:n.id,refs:1,parts:s}}}}function m(){var e=document.createElement("style");return e.type="text/css",s.appendChild(e),e}function y(e){var t,n,i=document.querySelector("style["+f+'~="'+e.id+'"]');if(i){if(c)return u;i.parentNode.removeChild(i)}if(d){var r=l++;i=a||(a=m()),t=C.bind(null,i,r,!1),n=C.bind(null,i,r,!0)}else i=m(),t=S.bind(null,i),n=function(){i.parentNode.removeChild(i)};return t(e),function(i){if(i){if(i.css===e.css&&i.media===e.media&&i.sourceMap===e.sourceMap)return;t(e=i)}else n()}}var v,b=(v=[],function(e,t){return v[e]=t,v.filter(Boolean).join("\n")});function C(e,t,n,i){var r=n?"":i.css;if(e.styleSheet)e.styleSheet.cssText=b(t,r);else{var o=document.createTextNode(r),s=e.childNodes;s[t]&&e.removeChild(s[t]),s.length?e.insertBefore(o,s[t]):e.appendChild(o)}}function S(e,t){var n=t.css,i=t.media,r=t.sourceMap;if(i&&e.setAttribute("media",i),p.ssrId&&e.setAttribute(f,t.id),r&&(n+="\n/*# sourceURL="+r.sources[0]+" */",n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(r))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}},VXoL:function(e,t){e.exports='{% block sw_settings_content_card_slot_plugins %}\n    {% parent %}\n\n    <sw-settings-item\n        :label="$tc(\'lunar-payment.general.mainMenuItemGeneral\')"\n        :to="{ name: \'lunar.payment.index\' }"\n        :backgroundEnabled="false"\n    >\n        <template #icon>\n            <img class="lunar-settings-icon" :src="\'lunarpayment/plugin.png\' | asset">\n        </template>\n    </sw-settings-item>\n{% endblock %}\n'},gSks:function(e,t,n){var i=n("ow9+");i.__esModule&&(i=i.default),"string"==typeof i&&(i=[[e.i,i,""]]),i.locals&&(e.exports=i.locals);(0,n("SZ7m").default)("5c83786c",i,!0,{})},"ow9+":function(e,t,n){},pqxS:function(e,t){e.exports='{% block lunar_payment_plugin_icon %}\n    <img class="lunar-payment-plugin-icon" :src="\'lunarpayment/plugin.png\' | asset">\n{% endblock %}\n'},taNh:function(e,t){function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function o(e,t){return(o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function s(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var n,i=l(e);if(t){var r=l(this).constructor;n=Reflect.construct(i,arguments,r)}else n=i.apply(this,arguments);return a(this,n)}}function a(e,t){if(t&&("object"===n(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e)}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var c=Shopware.Application,u=Shopware.Classes.ApiService,p=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&o(e,t)}(c,e);var t,n,a,l=s(c);function c(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"lunar_payment";return i(this,c),l.call(this,e,t,n)}return t=c,(n=[{key:"validateApiKeys",value:function(e){var t=this.getBasicHeaders();return this.httpClient.post("_action/".concat(this.getApiBasePath(),"/validate-api-keys"),{keys:e},{headers:t}).then((function(e){return u.handleResponse(e)}))}}])&&r(t.prototype,n),a&&r(t,a),Object.defineProperty(t,"prototype",{writable:!1}),c}(u);c.addServiceProvider("LunarPaymentSettingsService",(function(e){var t=c.getContainer("init");return new p(t.httpClient,e.loginService)}))},y0UL:function(e,t,n){}});