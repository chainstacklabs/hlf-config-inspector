import util from "util";
import child_process from "child_process";
import path from "path";

import ConfigtxgenExecHelper from "../utils/configtxgenExecHelper";

import { Organization } from "../types";
import { FABRIC_BIN_PATH } from "../config/constants";

const execFile = util.promisify(child_process.execFile);

export default class ConfigtxgenController {
  async printOrg({ org }: { org: Organization }) {
    const configtxgenExecHelper = await ConfigtxgenExecHelper.newHelper();

    try {
      await configtxgenExecHelper.addOrganisation(org);
      await configtxgenExecHelper.writeConfigTxFile();

      const configtxgenBinPath = path.join(FABRIC_BIN_PATH, "configtxgen");

      const configtxgenExecArgs = [
        ...configtxgenExecHelper.args,
        "-printOrg",
        org.name
      ];

      const { stdout } = await execFile(
        configtxgenBinPath,
        configtxgenExecArgs,
        { maxBuffer: 1024 * 1024 }
      );

      return JSON.parse(stdout.trim());
    } finally {
      await configtxgenExecHelper.cleanup();
    }
  }
}
