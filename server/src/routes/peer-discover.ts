import express, { Request, Response } from "express";

import { peerDiscoverController } from "../controllers";

export const router = express.Router({
  strict: true
});

router.post("/", async (req: Request, res: Response) => {
  const peerDiscoverRequest = {
    peer: req.body.peer,
    user: req.body.user
  };

  try {
    res.send(await peerDiscoverController.discoverPeers(peerDiscoverRequest));
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
});

router.post("/channel-config", async (req: Request, res: Response) => {
  const peerDiscoverChannelRequest = {
    channel: req.body.channel,
    peer: req.body.peer,
    user: req.body.user
  };

  try {
    res.send(
      await peerDiscoverController.discoverChannelConfig(
        peerDiscoverChannelRequest
      )
    );
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
});
