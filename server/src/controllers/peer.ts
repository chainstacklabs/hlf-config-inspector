import util from "util";
import child_process from "child_process";
import path from "path";

import PeerExecHelper from "../utils/peerExecHelper";
import { Node, User } from "../types";
import { FABRIC_BIN_PATH } from "../config/constants";
import { promises as fs } from "fs";

const execFile = util.promisify(child_process.execFile);

export default class PeerController {
  async peerChannelList({ peer, user }: { peer: Node; user: User }) {
    const peerExecHelper = await PeerExecHelper.newHelper();

    try {
      await peerExecHelper.addPeerEndpoint(peer, { enableTLS: true });
      await peerExecHelper.addUser(user);

      const peerBinPath = path.join(FABRIC_BIN_PATH, "peer");

      const args = ["channel", "list", ...peerExecHelper.args];

      const { stdout } = await execFile(peerBinPath, args, {
        env: peerExecHelper.envVars,
        maxBuffer: 1024 * 1024
      });

      const channels = stdout
        .trim()
        .split("\n")
        .filter(c => {
          return !c.includes("Channels peers has joined:");
        });

      return { channels };
    } finally {
      await peerExecHelper.cleanup();
    }
  }

  async peerChannelFetch({
    peer,
    user,
    channelID,
    target
  }: {
    peer: Node;
    user: User;
    channelID: string;
    target: string;
  }) {
    const peerExecHelper = await PeerExecHelper.newHelper();

    try {
      await peerExecHelper.addPeerEndpoint(peer, { enableTLS: true });
      await peerExecHelper.addUser(user);
      await peerExecHelper.addChannelID(channelID);

      const channelConfigFileBlockPath = path.join(
        peerExecHelper.workingDirectory,
        "channel.block"
      );
      const channelConfigFilePath = path.join(
        peerExecHelper.workingDirectory,
        "config.json"
      );

      const peerBinPath = path.join(FABRIC_BIN_PATH, "peer");
      const configtxlatorBinPath = path.join(FABRIC_BIN_PATH, "configtxlator");

      const peerExecArgs = [
        "channel",
        "fetch",
        target,
        ...peerExecHelper.args,
        channelConfigFileBlockPath
      ];

      await execFile(peerBinPath, peerExecArgs, {
        env: peerExecHelper.envVars,
        maxBuffer: 1024 * 1024
      });

      const configtxlatorExecArgs = [
        "proto_decode",
        "--input",
        channelConfigFileBlockPath,
        "--output",
        channelConfigFilePath,
        "--type",
        "common.Block"
      ];

      await execFile(
        configtxlatorBinPath,
        configtxlatorExecArgs,
        { maxBuffer: 1024 * 1024 }
      );

      const channelConfigFile = await fs.readFile(channelConfigFilePath)

      const config = JSON.parse(channelConfigFile.toString().trim());

      // TODO: perform checks on the json
      return config.data.data[0].payload.data.config;
    } finally {
      await peerExecHelper.cleanup();
    }
  }

  async peerChannelJoin({
    peer,
    orderer,
    user,
    channelID
  }: {
    peer: Node;
    orderer: Node;
    user: User;
    channelID: string;
  }) {
    const peerFetchExecHelper = await PeerExecHelper.newHelper();
    const peerJoinExecHelper = await PeerExecHelper.newHelper();

    try {
      await peerFetchExecHelper.addPeerEndpoint(peer, { enableTLS: true });
      await peerFetchExecHelper.addOrdererEndpoint(orderer, {
        enableTLS: true
      });
      await peerFetchExecHelper.addUser(user);
      await peerFetchExecHelper.addChannelID(channelID);

      const channelZeroBlockPath = path.join(
        peerFetchExecHelper.workingDirectory,
        "channel_0.block"
      );

      const peerBinPath = path.join(FABRIC_BIN_PATH, "peer");

      const peerFetchExecArgs = [
        "channel",
        "fetch",
        "0",
        ...peerFetchExecHelper.args,
        channelZeroBlockPath
      ];

      await execFile(peerBinPath, peerFetchExecArgs, {
        env: peerFetchExecHelper.envVars,
        maxBuffer: 1024 * 1024
      });

      await peerJoinExecHelper.addPeerEndpoint(peer, { enableTLS: true });
      await peerJoinExecHelper.addUser(user);

      const peerJoinExecArgs = [
        "channel",
        "join",
        ...peerJoinExecHelper.args,
        "--blockpath",
        channelZeroBlockPath
      ];

      await execFile(peerBinPath, peerJoinExecArgs, {
        env: peerJoinExecHelper.envVars,
        maxBuffer: 1024 * 1024
      });

      // TODO: Better return
      return {
        joined: true
      };
    } finally {
      await peerFetchExecHelper.cleanup();
      await peerJoinExecHelper.cleanup();
    }
  }

  async peerChannelUpdate({
    orderer,
    user,
    channelID,
    updateInEnvelopePB
  }: {
    orderer: Node;
    user: User;
    channelID: string;
    updateInEnvelopePB: string;
  }) {
    const peerExecHelper = await PeerExecHelper.newHelper();

    try {
      await peerExecHelper.addOrdererEndpoint(orderer, { enableTLS: true });
      await peerExecHelper.addUser(user);
      await peerExecHelper.addChannelID(channelID);

      const wd = peerExecHelper.workingDirectory;
      const updateInEnvelopePBFilePath = path.join(
        wd,
        "config_update_in_envelope.pb"
      );

      await fs.writeFile(updateInEnvelopePBFilePath, updateInEnvelopePB, {
        encoding: "base64"
      });

      const peerBinPath = path.join(FABRIC_BIN_PATH, "peer");

      const args = [
        "channel",
        "update",
        "--file",
        updateInEnvelopePBFilePath,
        ...peerExecHelper.args
      ];

      try {
        await execFile(peerBinPath, args, {
          env: peerExecHelper.envVars,
          maxBuffer: 1024 * 1024
        });
      } catch (e) {
        throw new Error(e.stderr.trim());
      }
    } finally {
      await peerExecHelper.cleanup();
    }
  }

  async peerChannelSignconfigtx({
    updateInEnvelopePB,
    user
  }: {
    updateInEnvelopePB: string;
    user: User;
  }) {
    const peerExecHelper = await PeerExecHelper.newHelper();

    try {
      await peerExecHelper.addUser(user);

      const wd = peerExecHelper.workingDirectory;
      const updateInEnvelopePBFilePath = path.join(
        wd,
        "config_update_in_envelope.pb"
      );

      await fs.writeFile(updateInEnvelopePBFilePath, updateInEnvelopePB, {
        encoding: "base64"
      });

      const peerBinPath = path.join(FABRIC_BIN_PATH, "peer");
      const configtxlatorBinPath = path.join(FABRIC_BIN_PATH, "configtxlator");

      const signconfigtxExecArgs = [
        "channel",
        "signconfigtx",
        "--file",
        updateInEnvelopePBFilePath,
        ...peerExecHelper.args
      ];

      await execFile(peerBinPath, signconfigtxExecArgs, {
        env: peerExecHelper.envVars,
        maxBuffer: 1024 * 1024
      });

      const computeUpdateToJsonExecArgs = [
        "proto_decode",
        "--input",
        updateInEnvelopePBFilePath,
        "--type",
        "common.Envelope"
      ];

      const { stdout } = await execFile(
        configtxlatorBinPath,
        computeUpdateToJsonExecArgs,
        { maxBuffer: 1024 * 1024 }
      );

      const update = JSON.parse(stdout.trim());

      return {
        update: update.payload.data.config_update,
        signatures: update.payload.data.signatures,
        envelopePB: await fs.readFile(updateInEnvelopePBFilePath, {
          encoding: "base64"
        })
      };
    } finally {
      await peerExecHelper.cleanup();
    }
  }
}
