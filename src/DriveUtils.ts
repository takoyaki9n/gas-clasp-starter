import Folder = GoogleAppsScript.Drive.Folder;
import File = GoogleAppsScript.Drive.File;

export class DriveUtils {
  public static getScriptFolder(): Folder {
    const scriptId = ScriptApp.getScriptId();
    const file = DriveApp.getFileById(scriptId);
    const folders = file.getParents();
    while (folders.hasNext()) return folders.next();
    return null;
  }

  public static getFolder(folder: Folder, folderName: string): Folder {
    const folders = folder.getFoldersByName(folderName);
    while (folders.hasNext()) return folders.next();
    return null;
  }

  public static getFile(folder: Folder, fileName: string): File {
    const files = folder.getFilesByName(fileName);
    while (files.hasNext()) return files.next();
    return null;
  }

  public static getFileContentText(file: File): string {
    return file != null ? file.getBlob().getDataAsString() : '';
  }
}
