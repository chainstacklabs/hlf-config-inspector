export enum OperationStatus {
  Active = "Active",
  Success = "Success",
  Fail = "Fail",
  Aborted = "Aborted"
}

export enum OperationType {
  UpdateConfig = "UpdateConfig"
}

export interface UpdateConfigSignature {
  signature: string;
  signature_header: {
    creator: {
      id_bytes: string;
      mspid: string;
    };
    nonce: string;
  };
}

export interface UpdateConfigMetadata {
  channelID: string;
  update: any;
  envelopePB: string;
  signatures: UpdateConfigSignature[];
}

export default interface Operation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  metadata: UpdateConfigMetadata | null;
}
