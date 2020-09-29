import { Peer, Orderer } from "@/types/Node.v2";
import Identity from "@/types/Identity.v2";

export interface ApplicationChannel {
  id: string;
  name: string;

  /** List of known peers of this Channel */
  peers: Peer[];
  /** List of known orderers of this Channel */
  orderers: Orderer[];

  /** Identity used when interacting with the Channel */
  associatedIdentity: Identity;

  /**
   * The orderer to use when interacting with the channel,
   * must be part of {@link orderers}
   */
  defaultOrderer: Orderer;

  /** MSP ID of the organizations part of the channel's Application group */
  applicationOrgsMspId: string[];
  /** MSP ID of the organizations part of the channel's Orderer group */
  ordererOrgsMspId: string[];
}
