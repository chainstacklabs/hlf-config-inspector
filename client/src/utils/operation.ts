import Operation, {
  OperationType,
  UpdateConfigMetadata
} from "@/types/Operation";

import { channels } from "@/store";

export function getIcon(op: Operation) {
  if (op.type === OperationType.UpdateConfig) {
    return "mdi-file-document-edit";
  }

  return "";
}

export function getTitle(op: Operation) {
  if (op.type === OperationType.UpdateConfig && op.metadata) {
    return "Update channel config";
  }

  return "";
}

export function getSubtitle(op: Operation) {
  if (op.type === OperationType.UpdateConfig && op.metadata) {
    const metadata: UpdateConfigMetadata = op.metadata;
    const channel = channels.byId(metadata.channelID);
    return `Channel: ${channel ? channel.name : "unknown"}`;
  }

  return "";
}
