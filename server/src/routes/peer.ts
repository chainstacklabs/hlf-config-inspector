import express, { Request, Response } from "express";

import { peerController } from "../controllers";

export const router = express.Router({
  strict: true
});

router.post("/channel/list", async (req: Request, res: Response) => {
  const peerChannelsListRequest = {
    peer: req.body.peer,
    user: req.body.user
  };

  try {
    res.send(await peerController.peerChannelList(peerChannelsListRequest));
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
});

router.post("/channel/fetch/config", async (req: Request, res: Response) => {
  const peerChannelFetchRequest = {
    channelID: req.body.channel,
    peer: req.body.peer,
    user: req.body.user,
    target: "config"
  };

  try {
    res.send(await peerController.peerChannelFetch(peerChannelFetchRequest));
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
});

router.post("/channel/join", async (req: Request, res: Response) => {
  const peerChannelJoinRequest = {
    channelID: req.body.channel,
    peer: req.body.peer,
    orderer: req.body.orderer,
    user: req.body.user
  };

  try {
    res.send(await peerController.peerChannelJoin(peerChannelJoinRequest));
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

router.post("/channel/update", async (req: Request, res: Response) => {
  const peerChannelUpdateRequest = {
    channelID: req.body.channel,
    updateInEnvelopePB: req.body.updateInEnvelopePB,
    orderer: req.body.orderer,
    user: req.body.user
  };

  try {
    await peerController.peerChannelUpdate(peerChannelUpdateRequest);
    res.send();
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

router.post("/channel/signconfigtx", async (req: Request, res: Response) => {
  const peerChannelSignconfigtxRequest = {
    updateInEnvelopePB: req.body.updateInEnvelopePB,
    user: req.body.user
  };

  try {
    res.send(
      await peerController.peerChannelSignconfigtx(
        peerChannelSignconfigtxRequest
      )
    );
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
});
