import File, { UploadedFile } from "@/types/File";

export function stringToBase64(str: string) {
  const buf = Buffer.from(str);
  return buf.toString("base64");
}

export function base64ToString(b64: string) {
  const buf = Buffer.from(b64, "base64");
  return buf.toString();
}

export async function fileToBase64(file: Blob) {
  const fr = new FileReader();
  fr.readAsText(file);
  const fileContent: string = await new Promise((resolve, reject) => {
    fr.onload = evt => {
      if (evt.target !== null && evt.target.result !== null) {
        resolve(evt.target.result.toString());
      } else {
        reject();
      }
    };
    fr.onerror = reject;
  });

  return stringToBase64(fileContent);
}

export async function uploadedFileToFile(
  uploadedFile: UploadedFile,
  prefixToRemove: RegExp = new RegExp("")
): Promise<File> {
  return {
    filepath: uploadedFile.webkitRelativePath.replace(prefixToRemove, ""),
    content: await fileToBase64(uploadedFile)
  };
}

export async function readFile(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");
    reader.onload = evt => {
      if (evt.target && evt.target.result) {
        resolve(evt.target.result.toString());
      } else {
        reject(new Error("Couldn't read file"));
      }
    };
    reader.onerror = reject;
  });
}
