import axios from "axios";

import Node, { RichNode } from "@/types/Node";
import Identity, { RichIdentity } from "@/types/Identity";
import Organization from "@/types/Organization";

import { SERVER_URI } from "@/constants/server";
import { UpdateConfigMetadata, UpdateConfigSignature } from "@/types/Operation";

// TODO: Remove
const HOST_HACK_MAP: Record<string, string> = {
  "peer0.org1.example.com:7051": "localhost:7051",
  "peer0.org2.example.com:7051": "localhost:9051",
  "peer0.org3.example.com:7051": "localhost:11051",
  "orderer.example.com:7050": "localhost:7050"
};

export async function getChannels(
  peer: Node,
  org: Organization,
  user: Identity
): Promise<string[]> {
  let address = `${peer.host}:${peer.port}`;

  const hack = HOST_HACK_MAP[address];
  if (hack) {
    address = hack;
  }

  const data = {
    peer: {
      address,
      msp: {
        tlsCaCert: org.msp.tlsCaCert
      }
    },
    user: {
      msp: {
        id: org.msp.id,
        ...user.msp
      }
    }
  };

  const res = await axios.post(`${SERVER_URI}/peer/channel/list`, data);

  if (res.status !== 200) {
    throw new Error("Could not get channels");
  }
  return res.data.channels;
}

export async function fetchChannel(
  peer: Node,
  org: Organization,
  user: Identity,
  channel: string
): Promise<any> {
  let address = `${peer.host}:${peer.port}`;

  const hack = HOST_HACK_MAP[address];
  if (hack) {
    address = hack;
  }

  const data = {
    channel,
    peer: {
      address,
      msp: {
        tlsCaCert: org.msp.tlsCaCert
      }
    },
    user: {
      msp: {
        id: org.msp.id,
        ...user.msp
      }
    }
  };

  const res = await axios.post(`${SERVER_URI}/peer/channel/fetch/config`, data);

  if (res.status !== 200) {
    throw new Error("Could not get channel config");
  }
  return res.data;
}

export async function joinChannel(
  peer: RichNode,
  orderer: {
    address: string;
    org: Organization;
  },
  user: RichIdentity,
  channel: string
): Promise<{ joined: boolean }> {
  let peerAddress = `${peer.host}:${peer.port}`;
  let ordererAddress = orderer.address;

  const peerHack = HOST_HACK_MAP[peerAddress];
  if (peerHack) {
    peerAddress = peerHack;
  }
  const ordererHack = HOST_HACK_MAP[ordererAddress];
  if (ordererHack) {
    ordererAddress = ordererHack;
  }

  const data = {
    channel,
    peer: {
      address: peerAddress,
      msp: {
        tlsCaCert: peer.org.msp.tlsCaCert
      }
    },

    orderer: {
      address: ordererAddress,
      msp: {
        tlsCaCert: orderer.org.msp.tlsCaCert
      }
    },
    user: {
      msp: {
        id: user.org.msp.id,
        ...user.msp
      }
    }
  };

  try {
    const res = await axios.post(`${SERVER_URI}/peer/channel/join`, data);

    return res.data;
  } catch (e) {
    if (e.response.data && e.response.data.message) {
      throw new Error(e.response.data.message);
    }
    throw new Error("Could not join channel");
  }
}

export async function signChannelUpdateConfig(
  user: Identity,
  org: Organization,
  operationMetadata: UpdateConfigMetadata
): Promise<{
  update: any;
  envelopePB: string;
  signatures: UpdateConfigSignature[];
}> {
  const data = {
    updateInEnvelopePB: operationMetadata.envelopePB,
    user: {
      msp: {
        id: org.msp.id,
        ...user.msp
      }
    }
  };

  const res = await axios.post(`${SERVER_URI}/peer/channel/signconfigtx`, data);

  if (res.status !== 200) {
    throw new Error("Could not get channel config");
  }
  return res.data;
}

export async function updateChannelConfig(
  channel: string,
  operationMetadata: UpdateConfigMetadata,
  user: RichIdentity,
  orderer: {
    address: string;
    org: Organization;
  }
): Promise<void> {
  let address = orderer.address;

  const hack = HOST_HACK_MAP[address];
  if (hack) {
    address = hack;
  }

  const data = {
    channel,
    updateInEnvelopePB: operationMetadata.envelopePB,
    user: {
      msp: {
        id: user.org.msp.id,
        ...user.msp
      }
    },
    orderer: {
      address,
      msp: {
        tlsCaCert: orderer.org.msp.tlsCaCert
      }
    }
  };

  try {
    const res = await axios.post(`${SERVER_URI}/peer/channel/update`, data);

    return res.data;
  } catch (e) {
    if (e.response.data && e.response.data.message) {
      throw new Error(e.response.data.message);
    }
    throw new Error("Could not update channel config");
  }
}
