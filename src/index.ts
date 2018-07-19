import Folder = GoogleAppsScript.Drive.Folder;
import { API } from './Api';
import { JobManager } from './JobManager';

declare var global: any;

global.main = (): void => {
  const jobManager = new JobManager();
  jobManager.run();
};
