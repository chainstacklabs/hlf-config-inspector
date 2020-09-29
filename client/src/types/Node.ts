import Organization from "@/types/Organization";

export default interface Node {
  id: string;
  host: string;
  port: number;
  type: NodeType;
}

export interface RichNode extends Node {
  org: Organization;
}

export enum NodeType {
  Peer = "Peer",
  Orderer = "Orderer"
}
