import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

export class API {
  private static readonly HOST_URL = 'https://app.splatoon2.nintendo.net';
  private static readonly BASE_URL = API.HOST_URL + '/api';
  private static readonly RESULTS_URL = API.BASE_URL + '/results';

  static getResultsUrl(): string {
    return API.RESULTS_URL;
  }

  static getResultUrl(battleNumber: number): string {
    return API.RESULTS_URL + '/' + battleNumber.toString();
  }

  static getFormatedCookie(cookies: Object) {
    var kvs = [];
    for (const key in cookies) {
      kvs.push(Utilities.formatString('%s=%s', key, cookies[key]));
    }
    return kvs.join('; ');
  }

  private readonly iksmSession: string;
  private readonly params: URLFetchRequestOptions;

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
