import {
  createModule,
  mutation,
  action,
  extractVuexModule
} from "vuex-class-component";

import ConnectionProfile from "@/types/ConnectionProfile";

const VuexModule = createModule({
  namespaced: "connectionProfiles"
});

export class ConnectionProfilesStore extends VuexModule {
  private items: ConnectionProfile[] = [];

  get all() {
    return this.items;
  }

  @action async addConnectionProfile(profile: ConnectionProfile) {
    if (
      this.items.find(
        existingConnectionProfile =>
          existingConnectionProfile.name === profile.name
      )
    ) {
      // Already exists
      // TODO: Better error
      throw new Error();
    }

    // TODO: Add schema check
    this.ADD_CONNECTION_PROFILE(profile);
  }

  @mutation private ADD_CONNECTION_PROFILE(profile: ConnectionProfile) {
    this.items.push({ ...profile });
  }
}

export default extractVuexModule(ConnectionProfilesStore);
