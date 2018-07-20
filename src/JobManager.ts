import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import Properties = GoogleAppsScript.Properties.Properties;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

import { Utils } from './Utils';
import { API } from './API';

namespace PropetyKeys {
  export const IKSM_SESSION = 'iksm_session';
  export const LOCK = 'lock';
  export const LATEST = 'latest';
}

export class JobManager {
  private static RESULTS_FOLDER_NAME = 'results';

  private readonly root: Folder;
  private readonly properties: Properties;
  private readonly api: API;
  private readonly resultFolder: Folder;

  constructor() {
    this.root = Utils.getScriptFolder();
    this.properties = PropertiesService.getScriptProperties();
    this.api = this.initApi();
    this.resultFolder = Utils.getFolder(this.root, JobManager.RESULTS_FOLDER_NAME);
  }

  private initApi() {
    const iksmSession = this.properties.getProperty(PropetyKeys.IKSM_SESSION);
    return new API(iksmSession);
  }

  private lock(): boolean {
    const lock = this.properties.getProperty(PropetyKeys.LOCK);
    if (lock != null) {
      console.error('Lock Failed.');
      return false;
    }

    this.properties.setProperty(PropetyKeys.LOCK, Date.now().toString());
    return true;
  }

  private unlock() {
    this.properties.deleteProperty(PropetyKeys.LOCK);
  }

  private getLocalLatestBattleNumber(): number {
    const latest = this.properties.getProperty(PropetyKeys.LATEST);
    var battleNumber = Number(latest);
    if (latest != null && !isNaN(battleNumber)) return battleNumber;

    throw new Error(Utilities.formatString('Property latest is invalid: %s', latest));
  }

  private saveResult(response: HTTPResponse, battleNumber): void {
    if (response.getResponseCode() !== 200) return;

    const name = battleNumber.toString();
    const file = this.resultFolder.createFile(name, response.getContentText('UTF-8'));
    if (file === null) throw new Error('Failed to save result.');

    this.properties.setProperty(PropetyKeys.LATEST, name);
    console.log(Utilities.formatString('Result %d is saved.', battleNumber));
  }

  public run(): void {
    if (!this.lock()) return;
    try {
      const battleNumber = this.getLocalLatestBattleNumber() + 1;
      const response = this.api.fetchResult(battleNumber);
      this.saveResult(response, battleNumber);
    } catch (error) {
      console.error(JSON.stringify(error));
    }
    this.unlock();
  }
}
