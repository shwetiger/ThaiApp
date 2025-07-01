import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from './shared/service/navigation.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(    
    public navigation: NavigationService,
    private router: Router) {
      //this.navigation.startSaveHistory(); 
      
  }

  ngOnInit(): void {
  }
  
  onActivate(){
    window.scroll(0,0);
  }

  
}



