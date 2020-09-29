import { promises as fs } from "fs";
import path from "path";
import os from "os";
import util from "util";
import rimraf from "rimraf";

import { Node, User } from "../types";

import ExecHelper from "./execHelper";
import { writeBase64File } from "./file";

export default class PeerExecHelper extends ExecHelper {
  private _envVars: Record<string, string> = {
    FABRIC_LOGGING_SPEC: "error"
  };
  private _args: string[] = [];

  constructor(workingDirectory: string) {
    super(workingDirectory);
  }

  static async newHelper() {
    const helper = new PeerExecHelper(
      await ExecHelper.getNewWorkingDirectory()
    );

    // All execs need at least a peer config file
    await helper.addPeerConfigFile();

    return helper;
  }

  get envVars() {
    return this._envVars;
  }

  get args() {
    return this._args;
  }

  private async addPeerConfigFile() {
    const peerConfigDir = path.join(this._workingDirectory, "peer/config");
    await fs.mkdir(peerConfigDir, { recursive: true });

    const coreConfigFilePath = path.join(peerConfigDir, "core.yaml");

    // Write empty config file for peer CLI
    await fs.writeFile(coreConfigFilePath, "");

    this._envVars = {
      ...this._envVars,
      FABRIC_CFG_PATH: peerConfigDir
    };
  }

  async addUser(user: User) {
    const userMSPDir = path.join(this._workingDirectory, "user/msp");
    await fs.mkdir(userMSPDir, { recursive: true });

    const filePaths = {
      caCert: path.join(userMSPDir, user.msp.caCert.filepath),
      signCert: path.join(userMSPDir, user.msp.signCert.filepath),
      keyStore: path.join(userMSPDir, user.msp.keyStore.filepath),
      adminCert: user.msp.adminCert
        ? path.join(userMSPDir, user.msp.adminCert.filepath)
        : null,
      configFile: user.msp.configFile
        ? path.join(userMSPDir, user.msp.configFile.filepath)
        : null
    };

    await Promise.all([
      writeBase64File(filePaths.caCert, user.msp.caCert.content),
      writeBase64File(filePaths.signCert, user.msp.signCert.content),
      writeBase64File(filePaths.keyStore, user.msp.keyStore.content)
    ]);

    if (user.msp.adminCert && filePaths.adminCert) {
      await writeBase64File(filePaths.adminCert, user.msp.adminCert.content);
    }
    if (user.msp.configFile && filePaths.configFile) {
      await writeBase64File(filePaths.configFile, user.msp.configFile.content);
    }

    this._envVars = {
      ...this._envVars,
      CORE_PEER_LOCALMSPID: user.msp.id,
      CORE_PEER_MSPCONFIGPATH: userMSPDir
    };
  }

  async addPeerEndpoint(peer: Node, { enableTLS } = { enableTLS: false }) {
    const peerMSPDir = path.join(this._workingDirectory, "peer/msp");
    await fs.mkdir(peerMSPDir, { recursive: true });

    const filePaths = {
      tlsCaCert: peer.msp.tlsCaCert
        ? path.join(peerMSPDir, peer.msp.tlsCaCert.filepath)
        : null
    };

    if (enableTLS && peer.msp.tlsCaCert && filePaths.tlsCaCert) {
      await writeBase64File(filePaths.tlsCaCert, peer.msp.tlsCaCert.content);

      this._envVars = {
        ...this._envVars,
        CORE_PEER_TLS_ENABLED: "true",
        CORE_PEER_TLS_ROOTCERT_FILE: filePaths.tlsCaCert
      };
    }

    this._envVars = {
      ...this._envVars,
      CORE_PEER_ADDRESS: `${peer.address}`
    };
  }

  async addOrdererEndpoint(ord: Node, { enableTLS } = { enableTLS: false }) {
    const ordererMSPDir = path.join(this._workingDirectory, "orderer/msp");
    await fs.mkdir(ordererMSPDir, { recursive: true });

    this._args = [...this._args, "--orderer", ord.address];

    if (enableTLS && ord.msp.tlsCaCert) {
      const tlsCaCertPath = path.join(
        ordererMSPDir,
        ord.msp.tlsCaCert.filepath
      );
      await writeBase64File(tlsCaCertPath, ord.msp.tlsCaCert.content);

      this._args = [...this._args, "--tls", "--cafile", tlsCaCertPath];
    }
  }

  async addChannelID(channelID: string) {
    this._args = [...this._args, "--channelID", `${channelID}`];
  }
}
