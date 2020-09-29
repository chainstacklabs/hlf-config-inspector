import express from "express";
import cors from "cors";
import { PORT } from "./config/constants";
import {
  peerRouter,
  peerDiscoverRouter,
  configtxlatorRouter,
  configtxgenRouter
} from "./routes";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.use(cors());

app.use("/peer", peerRouter);
app.use("/peer/discover", peerDiscoverRouter);
app.use("/configtxlator", configtxlatorRouter);
app.use("/configtxgen", configtxgenRouter);

app.use(express.static("client"));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
