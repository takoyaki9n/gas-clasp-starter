import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

export class API {
  static APP_BASE: string = 'https://app.splatoon2.nintendo.net';

  static API_BASE: string = API.APP_BASE + '/api';

  static API_RESULTS: string = API.API_BASE + '/results';

  static getResultsUrl(): string {
    return API.API_RESULTS;
  }

  static getResultUrl(battleNumber: number): string {
    return API.API_RESULTS + '/' + battleNumber.toString();
  }

  static getFormatedCookie(cookies: Object) {
    var kvs = [];
    for (const key in cookies) {
      kvs.push(Utilities.formatString('%s=%s', key, cookies[key]));
    }
    return kvs.join('; ');
  }

  private iksmSession: string;
  private params: URLFetchRequestOptions;
  constructor(iksmSession: string) {
    this.iksmSession = iksmSession;
    this.params = this.initParams();
  }

  private initParams(): URLFetchRequestOptions {
    const cookies = { iksm_session: this.iksmSession };
    const headers = { Cookie: API.getFormatedCookie(cookies) };
    return {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    };
  }

  private callAPI(url: string): Object {
    const response = UrlFetchApp.fetch(url, this.params);
    const data = response.getContentText('UTF-8');
    const obj = JSON.parse(data);
    if (response.getResponseCode() !== 200) {
      Logger.log(data);
    }
    return obj;
  }

  public callResults(): Object {
    return this.callAPI(API.getResultsUrl());
  }

  public callResult(battleNumber: number): Object {
    return this.callAPI(API.getResultUrl(battleNumber));
  }
}
