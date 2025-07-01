import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Back4appService {
  keyApplicationId: any;
  keyClientKey: any;
  jsKey: any;
  keyParseServerUrl: any;
  keyLiveQueryUrl: any;
  
  constructor() { 
    this.keyApplicationId = 'dxEhlPEJK3rGaa1viywMIxS31lqCFZMwb0oHQWXJ';
    this.keyClientKey= 'fJ5j4vzm8ZD6tmoCSdzMKE5HYnQovaXdXqYvsqTU';
    this.jsKey='G4ePnxxZcdObpoF8bZMx2QzvgNlFrpGb8WHrF0Bx';
   // this.keyParseServerUrl = 'https://parseapi.back4app.com';
  //  this.keyLiveQueryUrl = 'https://thai2d3d.b4a.io';
  this.keyParseServerUrl = 'https://thai2d3d.b4a.io';
  this.keyLiveQueryUrl = 'wss://thai2d3d.b4a.io';

    // this.keyApplicationId = 'Y9QHN2Zhm1gJTLsbUo00igiph3hsJHsBpV6MOjm4';
    // this.keyClientKey= 'e3U8gFGAQz0MODVJSaicQXbdxi88VfhQ7AOOjjaj';
    // this.jsKey='1vfbdd4BUSZYr7QJzhiBQ6WmNfX0Ov5sh3Pfys4l';
    // this.keyParseServerUrl = 'https://parseapi.back4app.com';
    // this.keyLiveQueryUrl = 'wss://tslive.b4a.io'; //error
  }
}
