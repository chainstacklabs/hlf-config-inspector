import { promises as fs } from "fs";
import path from "path";

import { Node, DiscoveryUser as User } from "../types";
import ExecHelper from "./execHelper";

async function _writeBase64File(filePath: string, content: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, { encoding: "base64" });
}

interface ConfigFile {
  version: Number;
  tlsconfig: {
    certpath: string;
    keypath: string;
    peercacertpath: string;
    timeout: string;
  };
  signerconfig: {
    mspid: string;
    identitypath: string;
    keypath: string;
  };
}

export default class DiscoveryExecHelper extends ExecHelper {
  private _args: string[] = [];
  private readonly _configFile: ConfigFile;

  constructor(workingDirectory: string) {
    super(workingDirectory);

    this._configFile = {
      version: 0,
      tlsconfig: {
        certpath: "",
        keypath: "",
        peercacertpath: "",
        timeout: "0s"
      },
      signerconfig: {
        mspid: "",
        identitypath: "",
        keypath: ""
      }
    };
  }

  static async newHelper() {
    return new DiscoveryExecHelper(await ExecHelper.getNewWorkingDirectory());
  }

  get args() {
    return this._args;
  }

  async generateConfigFile() {
    const userMSPDir = path.join(this._workingDirectory, "discovery");
    await fs.mkdir(userMSPDir);

    const configFilePath = path.join(userMSPDir, "config.json");

    await fs.writeFile(
      configFilePath,
      JSON.stringify(this._configFile, null, 2)
    );

    this._args = [...this._args, "--configFile", `${configFilePath}`];
  }

  async addUser(user: User) {
    const userMSPDir = path.join(this._workingDirectory, "user/msp");
    await fs.mkdir(userMSPDir, { recursive: true });

    const filePaths = {
      signCert: path.join(userMSPDir, user.msp.signCert.filepath),
      keyStore: path.join(userMSPDir, user.msp.keyStore.filepath)
    };

    await Promise.all([
      _writeBase64File(filePaths.signCert, user.msp.signCert.content),
      _writeBase64File(filePaths.keyStore, user.msp.keyStore.content)
    ]);

    this._configFile.signerconfig = {
      mspid: user.msp.id,
      identitypath: filePaths.signCert,
      keypath: filePaths.keyStore
    };
  }

  async addPeerEndpoint(peer: Node, { enableTLS } = { enableTLS: false }) {
    const peerMSPDir = path.join(this._workingDirectory, "peer/msp");
    await fs.mkdir(peerMSPDir, { recursive: true });

    const tlsCaCertPath = peer.msp.tlsCaCert
      ? path.join(peerMSPDir, peer.msp.tlsCaCert.filepath)
      : null;

    if (enableTLS && peer.msp.tlsCaCert && tlsCaCertPath) {
      await _writeBase64File(tlsCaCertPath, peer.msp.tlsCaCert.content);

      this._configFile.tlsconfig.peercacertpath = tlsCaCertPath;
    }

    this._args = [...this._args, "--server", peer.address];
  }

  async addChannel(channel: string) {
    this._args = [...this._args, "--channel", `${channel}`];
  }
}
