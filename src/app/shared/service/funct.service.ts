import { Injectable, ViewContainerRef } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root',

})
export class FunctService {
  microsoftAddress(microsoftAddress: any, arg1: { headers: import("@angular/common/http").HttpHeaders; }) {
    throw new Error('Method not implemented.');
  }
  public ipaddress: any;
  public appName: any;
  public secretKey: any;
  public ipaddresslive: any;
  public ipaddressluke: any;
  constructor() {
    this.appName = "Thai 2D3D";
    this.ipaddress = "https://apitest.thai2d3dgame.com/api/";
   // this.ipaddress = "https://api.thai2d3dgame.com/api/";
    this.ipaddresslive = "https://api.thai2dlive.com/api/";
    this.ipaddressluke = "https://luke.2dboss.com/api/luke/twod-result-live";
    this.secretKey = "Yv9GlO0wX4peYxWCMGpUXM9ZKJBU78tc8cvSld5sN20";
  }
  encrypt(): string {
    var registerKey = "68cf74c3da49d6d579ab81926f43a479";
    var key = CryptoJS.enc.Utf8.parse('7061737323313233');
    var iv = CryptoJS.enc.Utf8.parse('7061737323313233');
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(registerKey), key,
      {
        keySize: 128,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
    return encrypted.toString();
  }

  getSignature(signature: string): string {
    var sin = Md5.hashStr(signature).toString();
    return sin;
  }
}

