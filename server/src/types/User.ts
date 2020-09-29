import File from "./File";

export default interface User {
  msp: {
    id: string;
    adminCert: File;
    caCert: File;
    signCert: File;
    keyStore: File;
    configFile?: File;
  };
}

export interface DiscoveryUser {
  msp: {
    id: string;
    signCert: File;
    keyStore: File;
  };
}
