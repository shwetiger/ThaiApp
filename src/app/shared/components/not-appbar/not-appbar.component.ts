import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-appbar',
  templateUrl: './not-appbar.component.html',
  styleUrls: ['./not-appbar.component.scss']
})
export class NotAppbarComponent implements OnInit {

  constructor(private Location: LocationStrategy,) { }

  ngOnInit(): void {    
   
  }

}
