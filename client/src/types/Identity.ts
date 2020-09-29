import File from "./File";
import Organization from "@/types/Organization";

export interface IdentityMSP {
  caCert: File;
  tlsCaCert: File;
  signCert: File;
  keyStore: File;
  configFile?: File;
}

export default interface Identity {
  id: string;
  orgId: string;
  msp: IdentityMSP;
}

export interface RichIdentity extends Identity {
  subjects: Record<string, string>;
  org: Organization;
}
