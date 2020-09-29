import express, { Request, Response } from "express";

import { configtxlatorController } from "../controllers";

export const router = express.Router({
  strict: true
});

router.post("/update-channel", async (req: Request, res: Response) => {
  const updateChannelRequest = {
    channelID: req.body.channel,
    currentConfig: req.body.currentConfig,
    updatedConfig: req.body.updatedConfig
  };

  try {
    res.send(await configtxlatorController.updateChannel(updateChannelRequest));
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
});
