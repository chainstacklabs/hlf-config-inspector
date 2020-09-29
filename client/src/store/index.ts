import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import { createProxy } from "vuex-class-component";

import organizationsModule, {
  OrganizationsStore
} from "./modules/organizations";
import identitiesModule, { IdentitiesStore } from "./modules/identities";
import channelsModule, { ChannelsStore } from "./modules/channels";
import operationsModule, { OperationsStore } from "./modules/operations";

import idsModule, { IdentitiesStore as IdsStore } from "./modules/ids";
import appChannelsModule, {
  ApplicationChannelsStore
} from "./modules/appChannels";
import orgsModule, { OrgsStore } from "./modules/orgs";
import nodesModule, { NodesStore } from "./modules/nodes";

import connectionProfilesModule, {
  ConnectionProfilesStore
} from "./modules/connectionProfile";
import channelModule, { ChannelStore } from "./modules/channel";
import settingsModule, { SettingsStore } from "./modules/settings";

Vue.use(Vuex);

const store = new Vuex.Store({
  plugins: [new VuexPersistence().plugin],
  modules: {
    ...organizationsModule,
    ...identitiesModule,
    ...channelsModule,
    ...operationsModule,

    ...idsModule,
    ...appChannelsModule,
    ...orgsModule,
    ...nodesModule,

    ...connectionProfilesModule,
    ...channelModule,
    ...settingsModule
  },
  state: {
    drawer: null
  },
  mutations: {
    SET_DRAWER(state, payload) {
      state.drawer = payload;
    }
  },
  actions: {}
});

export default store;

// Creating proxies.
export const organizations = createProxy(store, OrganizationsStore);
export const identities = createProxy(store, IdentitiesStore);
export const channels = createProxy(store, ChannelsStore);
export const operations = createProxy(store, OperationsStore);

export const orgs: OrgsStore = createProxy(store, OrgsStore);
export const ids: IdsStore = createProxy(store, IdsStore);
export const appChannels: ApplicationChannelsStore = createProxy(
  store,
  ApplicationChannelsStore
);
export const nodes: NodesStore = createProxy(store, NodesStore);

export const connectionProfiles: ConnectionProfilesStore = createProxy(
  store,
  ConnectionProfilesStore
);
export const channel = createProxy(store, ChannelStore);
export const settings = createProxy(store, SettingsStore);
