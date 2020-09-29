import { promises as fs } from "fs";
import path from "path";

import { Organization } from "../types";

import ExecHelper from "./execHelper";
import { writeBase64File } from "./file";

export default class ConfigtxgenExecHelper extends ExecHelper {
  private _configTxDir: string = "./configtx";
  private _configTxContent: any = {
    Organizations: []
  };
  private _args: string[] = [];

  constructor(workingDirectory: string) {
    super(workingDirectory);
  }

  static async newHelper() {
    const helper = new ConfigtxgenExecHelper(
      await ExecHelper.getNewWorkingDirectory()
    );

    await helper.createConfigTxDir();

    return helper;
  }

  get args() {
    return this._args;
  }

  private async createConfigTxDir() {
    this._configTxDir = path.join(this._workingDirectory, `configtx`);
    await fs.mkdir(this._configTxDir, { recursive: true });

    this._args = [...this._args, "-configPath", this._configTxDir];
  }

  async addOrganisation(org: Organization) {
    const orgMSPDir = path.join(this._workingDirectory, `orgs/${org.name}/msp`);
    await fs.mkdir(orgMSPDir, { recursive: true });

    const filePaths = {
      caCert: path.join(orgMSPDir, org.msp.caCert.filepath),
      tlsCaCert: org.msp.tlsCaCert
        ? path.join(orgMSPDir, org.msp.tlsCaCert.filepath)
        : null,
      configFile: org.msp.configFile
        ? path.join(orgMSPDir, org.msp.configFile.filepath)
        : null
    };

    await writeBase64File(filePaths.caCert, org.msp.caCert.content);

    if (org.msp.tlsCaCert && filePaths.tlsCaCert) {
      await writeBase64File(filePaths.tlsCaCert, org.msp.tlsCaCert.content);
    }
    if (org.msp.configFile && filePaths.configFile) {
      await writeBase64File(filePaths.configFile, org.msp.configFile.content);
    }

    this._configTxContent.Organizations.push({
      Name: org.name,
      ID: org.msp.id,
      MSPDir: orgMSPDir,
      Policies: org.policies,
      OrdererEndpoints: org.ordererEndpoints
    });
  }

  async writeConfigTxFile() {
    const configTxFilePath = path.join(this._configTxDir, "configtx.json");

    await fs.writeFile(
      configTxFilePath,
      JSON.stringify(this._configTxContent, null, 2)
    );
  }
}
