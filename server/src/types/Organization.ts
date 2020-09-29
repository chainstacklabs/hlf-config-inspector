import File from "./File";

export default interface Organization {
  name: string;
  msp: {
    id: string;
    caCert: File;
    tlsCaCert?: File;
    configFile?: File;
  };
  policies: Record<string, any>;
  ordererEndpoints?: string[];
}
