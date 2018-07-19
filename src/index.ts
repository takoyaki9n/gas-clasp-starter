import Folder = GoogleAppsScript.Drive.Folder;
import { API } from './API';

declare var global: any;

global.getScriptFolder = (): Folder => {
  const scriptId = ScriptApp.getScriptId();
  const file = DriveApp.getFileById(scriptId);
  const folders = file.getParents();
  while (folders.hasNext()) {
    return folders.next();
  }
  return null;
};

global.getIksmSession = (folder: Folder): string => {
  const files = folder.getFilesByName('iksm_session');
  while (files.hasNext()) {
    const file = files.next();
    const text = file.getBlob().getDataAsString();
    return text;
  }
  return null;
};

global.main = (): void => {
  const folder = global.getScriptFolder();
  const iksmSession = global.getIksmSession(folder);
  const api = new API(iksmSession);
  const response = api.callResults();
  Logger.log(JSON.stringify(response));
};
