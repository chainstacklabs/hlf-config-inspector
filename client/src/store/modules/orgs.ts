import {
  createModule,
  mutation,
  action,
  extractVuexModule
} from "vuex-class-component";

import Organization from "@/types/Organization.v2";

const VuexModule = createModule({
  namespaced: "orgs"
});

export class OrgsStore extends VuexModule {
  private items: Organization[] = [];

  get all() {
    return this.items;
  }
  get byMSPId() {
    return (mspId: string) => {
      return this.items.find(org => org.msp.msp_id === mspId);
    };
  }

  @action async addOrg(org: Organization) {
    if (
      this.items.find(existingOrg => existingOrg.msp.msp_id === org.msp.msp_id)
    ) {
      // Already exists
      // TODO: Better error
      throw new Error();
    }
    this.ADD_ORG(org);
  }

  @mutation private ADD_ORG(org: Organization) {
    this.items.push({ ...org });
  }
}

export default extractVuexModule(OrgsStore);
