import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;

import { DriveUtils } from './DriveUtils';
import { API } from './Api';
import { ResultsManager } from './ResultsManager';

export class JobManager {
  private static IKSM_SESSION_FILE_NAME = 'iksm_session';
  private static RESULTS_FOLDER_NAME = 'results';
  private static LOCK_FILE_NAME = 'lock.txt';

  private root: Folder;
  private lockFile: File;
  private api: API;
  private resultsManager: ResultsManager;

  constructor() {
    this.root = DriveUtils.getScriptFolder();
    this.api = this.initApi();
    this.resultsManager = this.initResultsManager();
  }

  private initApi() {
    const file = DriveUtils.getFile(this.root, JobManager.IKSM_SESSION_FILE_NAME);
    const iksmSession = DriveUtils.getFileContentText(file);
    return new API(iksmSession);
  }

  private initResultsManager() {
    const folder = DriveUtils.getFolder(this.root, JobManager.RESULTS_FOLDER_NAME);
    return new ResultsManager(folder);
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
    Logger.log(this.resultsManager.getLocalLatestBattleNumber());
    this.unlock();
  }
}
