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
    this.keyParseServerUrl = 'https://thai2d3d.b4a.io';
    this.keyLiveQueryUrl = 'wss://thai2d3d.b4a.io';
  }
}
