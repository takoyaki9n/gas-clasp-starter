import Folder = GoogleAppsScript.Drive.Folder;

import { DriveUtils } from './DriveUtils';

export class ResultsManager {
  private folder: Folder;

  constructor(folder: Folder) {
    this.folder = folder;
  }

  public getLocalLatestBattleNumber(): number {
    var battleNumber = -1;
    DriveUtils.forEach(this.folder.getFiles(), file => {
      const name = file.getName();
      const number = Number(name);
      if (Number.isInteger(number)) battleNumber = Math.max(battleNumber, number);
    });
    return battleNumber;
  }
}
