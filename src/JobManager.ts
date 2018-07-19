import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import { DriveUtils } from './DriveUtils';

export class JobManager {
  private static LOCK_FILE_NAME = 'lock.txt';

  private projectRoot: Folder;
  private lockFile: File;
  constructor() {
    this.projectRoot = DriveUtils.getScriptFolder();
  }

  private lock(): File {
    var lockFile = DriveUtils.getFile(this.projectRoot, JobManager.LOCK_FILE_NAME);
    if (lockFile != null) return null;
    lockFile = this.projectRoot.createFile(JobManager.LOCK_FILE_NAME, '');
    return lockFile != null ? lockFile : null;
  }

  private unlock() {
    this.projectRoot.removeFile(this.lockFile);
  }

  public run(): void {
    this.lockFile = this.lock();
    if (this.lockFile == null) return;

    this.unlock();
  }
}
