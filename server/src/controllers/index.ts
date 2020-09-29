import PeerController from "./peer";
import PeerDiscoverController from "./peer-discover";
import ConfigtxlatorController from "./configtxlator";
import ConfigtxgenController from "./configtxgen";

const peerController = new PeerController();
const peerDiscoverController = new PeerDiscoverController();
const configtxlatorController = new ConfigtxlatorController();
const configtxgenController = new ConfigtxgenController();

export {
  peerController,
  peerDiscoverController,
  configtxlatorController,
  configtxgenController
};
