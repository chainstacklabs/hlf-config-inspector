import { promises as fs } from "fs";
import path from "path";
import os from "os";
import util from "util";
import rimraf from "rimraf";

export default class ExecHelper {
  protected readonly _workingDirectory: string;

  constructor(workingDirectory: string) {
    this._workingDirectory = workingDirectory;
  }

  static async getNewWorkingDirectory() {
    return await fs.mkdtemp(path.join(os.tmpdir(), "hlfm-"));
  }

  static async newHelper() {
    return new ExecHelper(await ExecHelper.getNewWorkingDirectory());
  }

  get workingDirectory() {
    return this._workingDirectory;
  }

  async cleanup() {
    const rmrf = util.promisify(rimraf);

    await rmrf(this._workingDirectory);
  }
}
