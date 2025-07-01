import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {
  @Output() myEvent = new EventEmitter();  
  constructor(private router: Router) { 
   
  }

  ngOnInit(): void {
   
  }
  
  refreshPage(): void{
    this.ngOnInit();
    this.myEvent.emit();    
  }

}
