import File from "./File";
import Node, { NodeType } from "@/types/Node";

export default interface Organization {
  id: string;
  name: string;
  color: string;
  msp: {
    id: string;
    caCert: File;
    tlsCaCert: File;
    configFile?: File;
  };
  nodes: Node[];
}

export interface OrganizationMSP {
  id: string;
  caCert: File;
  tlsCaCert: File;
  configFile?: File;
}
