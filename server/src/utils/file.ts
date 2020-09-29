import { promises as fs } from "fs";
import path from "path";

export async function writeBase64File(filePath: string, content: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, { encoding: "base64" });
}
