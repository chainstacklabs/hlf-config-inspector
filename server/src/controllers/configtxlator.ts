import util from "util";
import child_process from "child_process";
import path from "path";

import ExecHelper from "../utils/execHelper";
import { FABRIC_BIN_PATH } from "../config/constants";
import { promises as fs } from "fs";

const execFile = util.promisify(child_process.execFile);

export default class ConfigtxlatorController {
  async updateChannel({
    channelID,
    currentConfig,
    updatedConfig
  }: {
    channelID: string;
    currentConfig: any;
    updatedConfig: any;
  }) {
    const execHelper = await ExecHelper.newHelper();

    try {
      const wd = execHelper.workingDirectory;

      const currentConfigJson = path.join(wd, "config.json");
      const currentConfigPB = path.join(wd, "config.pb");
      const updatedConfigJson = path.join(wd, "updated_config.json");
      const updatedConfigPB = path.join(wd, "updated_config.pb");
      const updatePB = path.join(wd, "update.pb");
      const updateJson = path.join(wd, "update.json");
      const updateInEnvelopeJson = path.join(wd, "update_in_envelope.json");
      const updateInEnvelopePB = path.join(wd, "update_in_envelope.pb");

      await fs.writeFile(currentConfigJson, JSON.stringify(currentConfig));
      await fs.writeFile(updatedConfigJson, JSON.stringify(updatedConfig));

      const configtxlatorBinPath = path.join(FABRIC_BIN_PATH, "configtxlator");

      const currentConfigToPBExecArgs = [
        "proto_encode",
        "--input",
        currentConfigJson,
        "--output",
        currentConfigPB,
        "--type",
        "common.Config"
      ];
      const updatedConfigToPBExecArgs = [
        "proto_encode",
        "--input",
        updatedConfigJson,
        "--output",
        updatedConfigPB,
        "--type",
        "common.Config"
      ];

      await Promise.all([
        execFile(configtxlatorBinPath, currentConfigToPBExecArgs, { maxBuffer: 1024 * 1024 }),
        execFile(configtxlatorBinPath, updatedConfigToPBExecArgs, { maxBuffer: 1024 * 1024 })
      ]);

      const computeUpdateExecArgs = [
        "compute_update",
        "--channel_id",
        channelID,
        "--original",
        currentConfigPB,
        "--updated",
        updatedConfigPB,
        "--output",
        updatePB
      ];

      await execFile(configtxlatorBinPath, computeUpdateExecArgs, { maxBuffer: 1024 * 1024 });

      const computeUpdateToJsonExecArgs = [
        "proto_decode",
        "--input",
        updatePB,
        "--output",
        updateJson,
        "--type",
        "common.ConfigUpdate"
      ];

      await execFile(
        configtxlatorBinPath,
        computeUpdateToJsonExecArgs,
        { maxBuffer: 1024 * 1024 }
      );

      const updateJsonFile = await fs.readFile(updateJson)

      const update = JSON.parse(updateJsonFile.toString().trim());

      const updateInEnvelope = {
        payload: {
          header: {
            channel_header: {
              channel_id: channelID,
              // See: https://github.com/hyperledger/fabric-protos/blob/release-2.1/common/common.proto#L33
              type: 2
            }
          },
          data: {
            config_update: update
          }
        }
      };

      await fs.writeFile(
        updateInEnvelopeJson,
        JSON.stringify(updateInEnvelope)
      );

      const updateInEnvelopeToPBExecArgs = [
        "proto_encode",
        "--input",
        updateInEnvelopeJson,
        "--output",
        updateInEnvelopePB,
        "--type",
        "common.Envelope"
      ];

      await execFile(configtxlatorBinPath, updateInEnvelopeToPBExecArgs, { maxBuffer: 1024 * 1024 });

      return {
        update,
        envelopePB: await fs.readFile(updateInEnvelopePB, {
          encoding: "base64"
        })
      };
    } finally {
      await execHelper.cleanup();
    }
  }
}
