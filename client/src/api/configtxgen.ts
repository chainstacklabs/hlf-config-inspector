import axios from "axios";

import { SERVER_URI } from "@/constants/server";
import Organization from "@/types/Organization";

export async function getOrgConfig(
  org: Organization,
  policies: Record<string, any>
): Promise<{
  orgConfig: any;
}> {
  const data = {
    org: {
      name: org.name,
      msp: org.msp,
      policies
    }
  };

  const res = await axios.post(`${SERVER_URI}/configtxgen/print-org`, data);

  if (res.status !== 200) {
    throw new Error("Could not get org config");
  }
  return res.data;
}
