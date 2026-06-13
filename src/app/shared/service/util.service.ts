import { Injectable } from '@angular/core';
import { HttpClient   } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { FunctService } from './funct.service';
import { DtoService } from './dto.service';


@Injectable({
  providedIn: 'root'
})

export class UtilService {
  isLogged: boolean=false;
  token: any;
  constructor(private funct: FunctService,
    private toastr: ToastrService,
    private http: HttpClient,private dto: DtoService,private storage: LocalStorageService,) {
      if(this.storage.retrieve('isUserLoggedIn') !=null && this.storage.retrieve('isUserLoggedIn') !=undefined){
        this.isLogged= this.storage.retrieve('isUserLoggedIn');
      }
  }

  ngOnInit(): void {
  }
}
