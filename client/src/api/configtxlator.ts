import axios from "axios";

import { SERVER_URI } from "@/constants/server";

export async function getConfigUpdateEnvelope(
  channel: string,
  currentConfig: any,
  updatedConfig: any
): Promise<{
  update: any;
  envelopePB: string;
}> {
  const data = {
    channel,
    currentConfig,
    updatedConfig
  };

  const res = await axios.post(
    `${SERVER_URI}/configtxlator/update-channel`,
    data
  );

  if (res.status !== 200) {
    throw new Error("Could not get channel config");
  }
  return res.data;
}
