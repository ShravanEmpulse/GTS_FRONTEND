import Vue from 'vue';
import Vuex from 'vuex';

import layout from './layout';

Vue.use(Vuex);

const store = new Vuex.Store({
    layout,

})

export default store;