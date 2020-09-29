import express, { Request, Response } from "express";

import { configtxgenController } from "../controllers";

export const router = express.Router({
  strict: true
});

router.post("/print-org", async (req: Request, res: Response) => {
  const printOrgRequest = {
    org: req.body.org
  };

  try {
    res.send(await configtxgenController.printOrg(printOrgRequest));
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
});
