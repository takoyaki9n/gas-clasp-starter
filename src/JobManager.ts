import Folder = GoogleAppsScript.Drive.Folder;
import Properties = GoogleAppsScript.Properties.Properties;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

import { Utils } from './Utils';
import { API } from './API';
import { PropetyKeys } from './PropetyKeys';

export class JobManager {
  private static RESULTS_FOLDER_NAME = 'results';
  private static MAX_RESULTS_COUNT = 50;

  private readonly root: Folder;
  private readonly properties: Properties;
  private readonly api: API;
  private readonly resultFolder: Folder;

  constructor() {
    this.root = Utils.getScriptFolder();
    this.properties = PropertiesService.getScriptProperties();
    const iksmSession = this.properties.getProperty(PropetyKeys.IKSM_SESSION);
    this.api = new API(iksmSession);
    this.resultFolder = Utils.getFolder(this.root, JobManager.RESULTS_FOLDER_NAME);
  }

  private lock(): boolean {
    const lock = this.properties.getProperty(PropetyKeys.LOCK);
    if (lock !== null) return Utils.withLog(false, 'Lock failed.');

    this.properties.setProperty(PropetyKeys.LOCK, Date.now().toString());
    return true;
  }

  private unlock() {
    this.properties.deleteProperty(PropetyKeys.LOCK);
  }

  private getLocalLatestBattleNumber(): number {
    const latest = this.properties.getProperty(PropetyKeys.LATEST);
    var battleNumber = Number(latest);
    if (latest === null || isNaN(battleNumber))
      throw new Error(Utilities.formatString('Property latest is invalid: %s', latest));

    return battleNumber;
  }

  private getRemoteLatestBattleNumber(): number {
    const response = this.api.fetchResults();
    const responseData = JSON.parse(response.getContentText('UTF-8'));
    const results: Array<any> = responseData.results;
    results.sort((a, b) => {
      return b.battle_number - a.battle_number;
    });
    return Number(results[0].battle_number);
  }

  private saveResult(response: HTTPResponse, battleNumber): void {
    if (response.getResponseCode() !== 200) return;

    const name = battleNumber.toString();
    const file = this.resultFolder.createFile(name, response.getContentText('UTF-8'));
    if (file === null) throw new Error('Failed to save result.');

    this.properties.setProperty(PropetyKeys.LATEST, name);
    console.log(Utilities.formatString('Result %d is saved.', battleNumber));
  }

  private run(fun: () => void): void {
    if (!this.lock()) return;
    try {
      fun();
    } catch (error) {
      console.error(JSON.stringify(error));
    }
    this.unlock();
  }

  public downloadResult(): void {
    this.run(() => {
      const remote = this.getRemoteLatestBattleNumber();
      const local = this.getLocalLatestBattleNumber();

      if (remote === local) return Utils.withLog(null, 'Already up-to-date.');

      if (remote - local > JobManager.MAX_RESULTS_COUNT)
        return Utils.withLog<null>(null, 'Old results seemed to be lost...');

      const battleNumber = local + 1;
      const response = this.api.fetchResult(battleNumber);
      this.saveResult(response, battleNumber);
    });
  }
}
