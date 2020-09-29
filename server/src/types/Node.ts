import File from "./File";

export default interface Node {
  address: string;
  msp: {
    tlsCaCert?: File;
  };
}
