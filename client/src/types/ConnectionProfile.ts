export interface Channel {
  orderers: string[];
  peers: Record<string, Object>;
}

export interface Organization {
  mspid: string;
  peers: string[];
}

export interface Node {
  url: string;
  tlsCACerts?: {
    pem: string;
  };
  grpcOptions: {
    "ssl-target-name-override": string;
  };
}

export default interface ConnectionProfile {
  name: string;
  description: string;
  version: string;
  channels: Record<string, Channel>;
  organizations: Record<string, Organization>;
  orderers: Record<string, Node>;
  peers: Record<string, Node>;
}
