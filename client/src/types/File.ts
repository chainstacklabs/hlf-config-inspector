export default interface File {
  filepath: string;
  content: string;
}

export interface UploadedFile extends Blob {
  webkitRelativePath: string;
}
