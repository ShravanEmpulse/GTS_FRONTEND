// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'expose-loader?jQuery!jquery' // eslint-disable-line
import 'expose-loader?$!jquery' // eslint-disable-line
import 'babel-polyfill'
import 'url-search-params-polyfill'

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VCalendar from 'v-calendar';
import * as VueGoogleMaps from 'vue2-google-maps';
import VueTextareaAutosize from 'vue-textarea-autosize';
import trumbowyg from 'vue-trumbowyg';
import mavonEditor from 'mavon-editor';
import { VueMaskDirective } from 'v-mask';
import VueSlider from 'vue-slider-component';
import VeeValidate from 'vee-validate';
import VueFormWizard from 'vue-form-wizard';
import { ServerTable, ClientTable, Event } from 'vue-tables-2';
import Trend from 'vuetrend';

import $ from 'jquery';
import moment from 'moment';
window.moment = require('moment');

import 'daterangepicker/daterangepicker.js';
import 'daterangepicker/daterangepicker.css';

//
import VueMomentJS from "vue-momentjs";
import VueJWT from 'vuejs-jwt';
import axios from "axios";
import ES6Promise from 'es6-promise';
import JsonExcel from 'vue-json-excel';
import VueSweetalert2 from 'vue-sweetalert2';
import loading from 'vue-full-loading';
import VueApexCharts from 'vue-apexcharts';
//

import store from './store';
import router from './Routes';
import App from './App';

Vue.use(BootstrapVue);

Vue.use(VueGoogleMaps, {
    load: {
        // real
        key: 'AIzaSyAauVHG8HoC4meNjIbklXIT4DG0lTlF20w',
        // local
        // key: 'AIzaSyB7OXmzfQYua_1LEhRdqsoYzyJOPh9hGLg',
        //selfsigned
        // key:'AIzaSyBsX789VROph3aBUcKDTu85QWjORappU-s'
    },
});

Vue.use(VCalendar, {
    firstDayOfWeek: 2, // Monday
    datePickerTintColor: "#4e85bd"
});

Vue.use(VueTextareaAutosize);
Vue.use(trumbowyg);
Vue.use(mavonEditor);
Vue.directive('mask', VueMaskDirective);
Vue.component('VueSlider', VueSlider);
Vue.component('downloadExcel', JsonExcel);
Vue.use(VeeValidate, { fieldsBagName: 'fieldsbag' });
Vue.use(VueFormWizard);

Vue.use(ClientTable, { theme: 'bootstrap4' });
Vue.use(ServerTable, { theme: 'bootstrap4' });
Vue.use(Event);
Vue.use(Trend);

//
Vue.use(VueMomentJS, moment);
Vue.use(VueJWT);
Vue.use(VueSweetalert2);
Vue.use(loading);
Vue.use(VueApexCharts);

Vue.component('loading', loading);
Vue.component('apexchart', VueApexCharts);

axios.defaults.baseURL = '/v1'
axios.defaults.headers.common.Accept = 'application/json;charset=UTF-8'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

axios.interceptors.request.use(
    config => {
        if (window.sessionStorage.getItem('Dorothy-Auth-Token')) {
            config.headers.common['Dorothy-Auth-Token'] = window.sessionStorage.getItem('Dorothy-Auth-Token');
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)

axios.interceptors.response.use(
    response => {
        if (response.data.resultCode == "1006") {
            const errorMessage = "Your login information has wrong. Please sign in again.";
            Vue.swal({
                title: 'Warning',
                text: errorMessage,
                confirmButtonText: 'GO TO LOGIN'
            }).then(() => {
                window.sessionStorage.clear();
                router.push('/login');
            });
        } else {
            if (response.headers['dorothy-auth-token']) {
                window.sessionStorage.setItem('Dorothy-Auth-Token', response.headers['dorothy-auth-token']);
            }
        }

        return response
    },
    (error) => {
        return Promise.reject(error)
    }
)

Vue.prototype.$axios = axios;

ES6Promise.polyfill()

//


Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App),
});