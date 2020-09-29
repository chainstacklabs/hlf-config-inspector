import axios from "axios";

import { Node } from "@/types/ConnectionProfile";
import Identity from "@/types/Identity.v2";

import { stringToBase64 } from "@/utils/file";

import { SERVER_URI } from "@/constants/server";

export async function dicoverChannelConfig(
  peer: Node,
  user: Identity,
  channel: string
): Promise<{ msps: Record<string, { root_certs: string[] }> }> {
  const address = peer.url.replace(/grpcs?:\/\//, "");

  let tlsCaCert = {};
  if (peer.tlsCACerts) {
    tlsCaCert = {
      filepath: "tlscacerts/tlsca.pem",
      content: stringToBase64(peer.tlsCACerts!.pem)
    };
  }

  const data = {
    channel,
    peer: {
      address,
      msp: {
        tlsCaCert
      }
    },
    user: {
      msp: {
        id: user.mspId,
        signCert: {
          filepath: "signcerts/user-cert.pem",
          content: user.signCert
        },
        keyStore: {
          filepath: "keyStore/priv_sk",
          content: user.privateKey
        }
      }
    }
  };

  const res = await axios.post(
    `${SERVER_URI}/peer/discover/channel-config`,
    data
  );

  if (res.status !== 200) {
    throw new Error("Could not get channel config");
  }
  return res.data;
}

export async function fetchChannelConfig(
  peer: Node,
  user: Identity,
  orgCACerts: string[],
  channel: string
): Promise<any> {
  const address = peer.url.replace(/grpcs?:\/\//, "");

  let tlsCaCert = {};
  if (peer.tlsCACerts) {
    tlsCaCert = {
      filepath: "tlscacerts/tlsca.pem",
      content: stringToBase64(peer.tlsCACerts!.pem)
    };
  }

  const caCert = orgCACerts[0];

  const data = {
    channel,
    peer: {
      address,
      msp: {
        tlsCaCert
      }
    },
    user: {
      msp: {
        id: user.mspId,
        caCert: {
          filepath: "cacerts/ca-cert.pem",
          content: caCert
        },
        adminCert: {
          filepath: "admincerts/admin-cert.pem",
          content: user.signCert
        },
        signCert: {
          filepath: "signcerts/user-cert.pem",
          content: user.signCert
        },
        keyStore: {
          filepath: "keystore/priv_sk",
          content: user.privateKey
        }
      }
    }
  };

  const res = await axios.post(`${SERVER_URI}/peer/channel/fetch/config`, data);

  if (res.status !== 200) {
    throw new Error("Could not get channel config");
  }
  return res.data;
}
