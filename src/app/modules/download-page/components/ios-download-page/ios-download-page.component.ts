import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ios-download-page',
  templateUrl: './ios-download-page.component.html',
  styleUrls: ['./ios-download-page.component.scss']
})
export class IosDownloadPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  refreshPage(){
    this.ngOnInit();
  }
}
