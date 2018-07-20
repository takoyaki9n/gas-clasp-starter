import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import HTTPResponse = GoogleAppsScript.URL_Fetch.HTTPResponse;

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

  private fetchAPI(url: string): HTTPResponse {
    const response = UrlFetchApp.fetch(url, this.params);
    if (response.getResponseCode() !== 200) {
      console.error({
        url: url,
        responseCode: response.getResponseCode(),
        content: response.getContentText('UTF-8')
      });
    }
    return response;
  }

  public fetchResults(): HTTPResponse {
    return this.fetchAPI(API.getResultsUrl());
  }

  public fetchResult(battleNumber: number): HTTPResponse {
    return this.fetchAPI(API.getResultUrl(battleNumber));
  }
}
