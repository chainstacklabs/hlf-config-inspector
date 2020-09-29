import {
  action,
  createModule,
  extractVuexModule,
  mutation
} from "vuex-class-component";

import Node, { Peer, Orderer, NodeType } from "@/types/Node.v2";

const VuexModule = createModule({
  namespaced: "nodes"
});

export class NodesStore extends VuexModule {
  private items: Node[] = [];

  get all() {
    return this.items;
  }
  get peers() {
    const peers = this.items.filter(node => node.type === NodeType.Peer);
    return <Peer[]>peers;
  }
  get peersOfOrg() {
    return (mspId: string) => {
      const peers = this.items.filter(
        node => node.type === NodeType.Peer && node.mspId === mspId
      );
      return <Peer[]>peers;
    };
  }
  get orderers() {
    const orderers = this.items.filter(node => node.type === NodeType.Orderer);
    return <Orderer[]>orderers;
  }
  get orderersOfOrg() {
    return (mspId: string) => {
      const orderers = this.items.filter(
        node => node.type === NodeType.Orderer && node.mspId === mspId
      );
      return <Orderer[]>orderers;
    };
  }

  @action async addPeer(node: Peer) {
    if (this.items.find(existingNode => existingNode.url === node.url)) {
      // Already exists
      // TODO: Better error
      throw new Error();
    }
    this.ADD_NODE(node);
  }
  @action async addOrderer(node: Orderer) {
    if (this.items.find(existingNode => existingNode.url === node.url)) {
      // Already exists
      // TODO: Better error
      throw new Error();
    }
    this.ADD_NODE(node);
  }

  @mutation private ADD_NODE(node: Node) {
    this.items.push({ ...node });
  }
}

export default extractVuexModule(NodesStore);
