import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;

import { DriveUtils } from './DriveUtils';
import { API } from './API';

export class JobManager {
  private static IKSM_SESSION_FILE_NAME = 'iksm_session';
  private static LOCK_FILE_NAME = 'lock.txt';

  private root: Folder;
  private lockFile: File;
  private api: API;

  constructor() {
    this.root = DriveUtils.getScriptFolder();
    this.api = this.initApi();
  }

  private initApi() {
    const iksmSessionFile = DriveUtils.getFile(this.root, JobManager.IKSM_SESSION_FILE_NAME);
    const iksmSession = DriveUtils.getFileContentText(iksmSessionFile);
    return new API(iksmSession);
  }

  private lock(): File {
    var lockFile = DriveUtils.getFile(this.root, JobManager.LOCK_FILE_NAME);
    if (lockFile != null) return null;
    lockFile = this.root.createFile(JobManager.LOCK_FILE_NAME, '');
    return lockFile != null ? lockFile : null;
  }

  private unlock() {
    this.root.removeFile(this.lockFile);
  }

  public run(): void {
    this.lockFile = this.lock();
    if (this.lockFile == null) return;
    const result = this.api.callResults();
    Logger.log(result);
    this.unlock();
  }
}
