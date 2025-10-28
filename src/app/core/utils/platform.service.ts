import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor() { }

  isFlutterWebView(): boolean {
    return typeof (window as any).FlutterChannel !== 'undefined';
  }
}
