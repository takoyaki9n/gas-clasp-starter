import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;
import Properties = GoogleAppsScript.Properties.Properties;

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
    if (lock != null) return false;
    this.properties.setProperty(PropetyKeys.LOCK, Date.now().toString());
    return true;
  }

  private unlock() {
    this.properties.deleteProperty(PropetyKeys.LOCK);
  }

  public getLocalLatestBattleNumber(): number {
    const latest = this.properties.getProperty(PropetyKeys.LATEST);
    var battleNumber = Number(latest);
    if (latest != null && !isNaN(battleNumber)) return battleNumber;

    battleNumber = -1;
    Utils.forEach(this.resultFolder.getFiles(), file => {
      const name = file.getName();
      const number = Number(name);
      if (!isNaN(number)) battleNumber = Math.max(battleNumber, number);
    });
    this.properties.setProperty(PropetyKeys.LATEST, battleNumber.toString());
    return battleNumber;
  }

  public run(): void {
    try {
      if (!this.lock()) return;
      const latest = this.getLocalLatestBattleNumber();
    } catch (error) {
      Logger.log(JSON.stringify(error));
    }
    this.unlock();
  }
}
