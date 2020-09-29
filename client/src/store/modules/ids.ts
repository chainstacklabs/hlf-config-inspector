import {
  action,
  createModule,
  createProxy,
  extractVuexModule,
  mutation
} from "vuex-class-component";
import * as uuid from "uuid";

import Identity from "@/types/Identity.v2";

import { OrgsStore } from "./orgs";

const VuexModule = createModule({
  namespaced: "ids"
});

export class IdentitiesStore extends VuexModule {
  private items: Identity[] = [];

  get all() {
    return this.items;
  }

  @action
  async addIdentity(identity: Identity) {
    if (
      this.items.find(
        existingIdentity => existingIdentity.privateKey === identity.privateKey
      )
    ) {
      throw new Error("Identity already exists");
    }

    const orgsProxy = createProxy(this.$store, OrgsStore);
    const org = orgsProxy.byMSPId(identity.mspId);

    // if (!org) {
    //   // Unknown Org
    //   // TODO: Better error
    //   throw new Error();
    // }

    this.ADD_IDENTITY({
      ...identity,
      id: uuid.v4()
    });
  }

  @action
  async deleteIdentity(identity: Identity) {
    this.DELETE_IDENTITY(identity.id);
  }

  @mutation
  private ADD_IDENTITY(identity: Identity) {
    this.items.push({ ...identity });
  }

  @mutation
  private DELETE_IDENTITY(identityId: string) {
    this.items = this.items.filter(
      ({ id }: { id: string }) => id !== identityId
    );
  }
}

export default extractVuexModule(IdentitiesStore);
