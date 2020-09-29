import {
  createModule,
  createProxy,
  mutation,
  action,
  extractVuexModule
} from "vuex-class-component";

import Organization from "@/types/Organization";
import Node from "@/types/Node";

import * as uuid from "uuid";

const VuexModule = createModule({
  namespaced: "organizations"
});

export class OrganizationsStore extends VuexModule {
  private items: Organization[] = [];

  get all() {
    return this.items;
  }
  get byId() {
    return (id: string) => {
      return this.items.find(({ id: oid }) => oid === id);
    };
  }
  get byMSPId() {
    return (mspId: string) => {
      return this.items.find(org => org.msp.id === mspId);
    };
  }
  get byCACert() {
    return (certContent: string) => {
      return this.items.find(org => org.msp.caCert.content === certContent);
    };
  }

  @action async addOrg(org: Organization) {
    if (this.items.find(existingOrg => existingOrg.msp.id === org.msp.id)) {
      // Already exists
      // TODO: Better error
      throw new Error();
    }
    this.ADD_ORG({ ...org, id: uuid.v4() });
  }

  @action async addNodeToOrg({
    orgMspId,
    node
  }: {
    orgMspId: string;
    node: Node;
  }) {
    const org = this.items.find(org => org.msp.id === orgMspId);

    if (!org) {
      // TODO: Better error
      throw new Error();
    }

    if (
      org.nodes.find(
        existingNode =>
          existingNode.host === node.host && existingNode.port === node.port
      )
    ) {
      // Already exists
      // TODO: Better error
      throw new Error();
    }

    this.ADD_NODE_TO_ORG({ orgMspId, node: { ...node, id: uuid.v4() } });
  }

  @action async removeNodeFromOrg({
    orgMspId,
    node
  }: {
    orgMspId: string;
    node: Node;
  }) {
    const org = this.items.find(org => org.msp.id === orgMspId);

    if (!org) {
      // TODO: Better error
      throw new Error();
    }

    this.REMOVE_NODE_FROM_ORG({ orgMspId, node });
  }

  @mutation private ADD_ORG(org: Organization) {
    this.items.push({ ...org });
  }
  @mutation private ADD_NODE_TO_ORG({
    orgMspId,
    node
  }: {
    orgMspId: string;
    node: Node;
  }) {
    const org = this.items.find(org => org.msp.id === orgMspId);
    if (org) {
      org.nodes.push({ ...node });
    }
  }

  @mutation private REMOVE_NODE_FROM_ORG({
    orgMspId,
    node
  }: {
    orgMspId: string;
    node: Node;
  }) {
    const org = this.items.find(org => org.msp.id === orgMspId);
    if (org) {
      org.nodes = org.nodes.filter(({ id }) => id !== node.id);
    }
  }
}

export default extractVuexModule(OrganizationsStore);
