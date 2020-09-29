import Identity from "@/types/Identity.v2";

export enum NodeType {
  Peer = "Peer",
  Orderer = "Orderer"
}

export default interface Node {
  id: string;
  name?: string;
  type: NodeType;

  /** MSP ID of the node's organisation */
  mspId: string;
  /** Identity used when interacting with the Node */
  associatedIdentity?: Identity;

  url: string;
  tlsCACerts?: {
    pem: string;
  };

  grpcOptions?: {
    sslTargetNameOverride?: string;
    requestTimeout?: number;
  };
}

export interface Peer extends Node {
  type: NodeType.Peer;
}

export interface Orderer extends Node {
  type: NodeType.Orderer;
}
