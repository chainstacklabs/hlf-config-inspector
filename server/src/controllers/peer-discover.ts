import util from "util";
import child_process from "child_process";
import path from "path";

import DiscoveryExecHelper from "../utils/discoveryExecHelper";
import { Node, DiscoveryUser as User } from "../types";
import { FABRIC_BIN_PATH } from "../config/constants";

const execFile = util.promisify(child_process.execFile);

export default class PeerDiscoverController {
  async discoverPeers({ peer, user }: { peer: Node; user: User }) {
    const discoverExecHelper = await DiscoveryExecHelper.newHelper();

    try {
      await discoverExecHelper.addPeerEndpoint(peer, { enableTLS: true });
      await discoverExecHelper.addUser(user);
      await discoverExecHelper.generateConfigFile();

      const discoverBinPath = path.join(FABRIC_BIN_PATH, "discover");

      const args = ["peers", ...discoverExecHelper.args];

      const { stdout } = await execFile(discoverBinPath, args, { maxBuffer: 1024 * 1024 });

      const peers = JSON.parse(stdout.trim());

      return { peers };
    } finally {
      await discoverExecHelper.cleanup();
    }
  }

  async discoverChannelConfig({
    peer,
    user,
    channel
  }: {
    peer: Node;
    user: User;
    channel: string;
  }) {
    const discoverExecHelper = await DiscoveryExecHelper.newHelper();

    try {
      await discoverExecHelper.addPeerEndpoint(peer, { enableTLS: true });
      await discoverExecHelper.addUser(user);
      await discoverExecHelper.generateConfigFile();
      await discoverExecHelper.addChannel(channel);

      const discoverBinPath = path.join(FABRIC_BIN_PATH, "discover");

      const args = ["config", ...discoverExecHelper.args];

      const { stdout } = await execFile(discoverBinPath, args, { maxBuffer: 1024 * 1024 });

      return JSON.parse(stdout.trim());
    } finally {
      await discoverExecHelper.cleanup();
    }
  }
}
