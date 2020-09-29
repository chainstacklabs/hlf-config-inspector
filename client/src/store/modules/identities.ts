import {
  action,
  createModule,
  createProxy,
  extractVuexModule,
  mutation
} from "vuex-class-component";
import * as uuid from "uuid";

import Identity, { RichIdentity } from "@/types/Identity";

import { OrganizationsStore } from "./organizations";

import { subjectsFromCertBase64 } from "@/utils/x509";

const VuexModule = createModule({
  namespaced: "identities"
});

export class IdentitiesStore extends VuexModule {
  private items: Identity[] = [];

  get all() {
    return this.items;
  }

  get allFormatted(): RichIdentity[] {
    const orgsProxy = createProxy(this.$store, OrganizationsStore);
    return this.items.map((identity: Identity) => {
      const org = orgsProxy.byId(identity.orgId);
      if (!org) {
        // Better error handling
        throw new Error();
      }

      return {
        ...identity,
        subjects: subjectsFromCertBase64(identity.msp.signCert.content),
        org
      };
    });
  }

  @action async addIdentity(identity: Identity) {
    if (
      this.items.find(
        existingIdentity =>
          existingIdentity.msp.signCert.content ===
          identity.msp.signCert.content
      )
    ) {
      throw new Error("Identity already exists");
    }

    const orgsProxy = createProxy(this.$store, OrganizationsStore);
    const org = orgsProxy.byCACert(identity.msp.caCert.content);

    if (!org) {
      // Org not available
      // TODO: Better error
      throw new Error();
    }

    this.ADD_IDENTITY({
      ...identity,
      id: uuid.v4(),
      orgId: org.id
    });
  }

  @action async deleteIdentity(identity: Identity) {
    this.DELETE_IDENTITY(identity.id);
  }

  @mutation private ADD_IDENTITY(identity: Identity) {
    this.items.push({ ...identity });
  }

  @mutation private DELETE_IDENTITY(identityId: string) {
    this.items = this.items.filter(
      ({ id }: { id: string }) => id !== identityId
    );
  }
}

export default extractVuexModule(IdentitiesStore);
