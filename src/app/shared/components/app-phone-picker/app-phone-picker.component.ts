import { Component, OnInit, ContentChild, ElementRef, ViewContainerRef, Injectable, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';

import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";

import { DtoService } from '../../service/dto.service';
import { UtilService } from '../../service/util.service';
import { FunctService } from '../../service/funct.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HandleErrorMessageService } from '../../service/handle-error-message.service';
import { CommonService } from '../../service/common.service';
import { ZawgyiDetector } from '@myanmartools/ng-zawgyi-detector';


@Component({
  selector: 'app-phone-picker',
  templateUrl: './app-phone-picker.component.html',
  styleUrls: ['./app-phone-picker.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class AppPhonePickerComponent implements OnInit {

  supportLanguages = ['en','my','th','zh'];
  phone_no : any;  
  regExpressionList :any;   
  registerCountryCode: any;  
  CountryCodeActive: any;
  selectedIndex: any;
  imageUrl= "assets/img/my_flag.png";
  @Input() prefix= "";
  localRegisterCountryCode: any;
  regularExpression= "^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";//'^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$';//'^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$';
  activeLang: any;
  @Input() phoneValue = ""; 
  @Input() regularExpressionPhone = '';
  @Input() actionType = "";
  @Input() isDisabled: boolean = false;
  
  @Output() phoneValueChange = new EventEmitter<string>();
  @Output() regularExpressionPhoneChange = new EventEmitter<string>();
  @Output() prefixChange = new EventEmitter<string>();
 
 
  loginModel: { phone_no: string; password: string; app_version: string; fcmtoken: string; deviceId: string; ipAddress: string; };
  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService, 
    private translateService: TranslateService,
    private toastr: ToastrService, 
    private spinner: NgxSpinnerService, 
    private dto: DtoService, 
    private http: HttpClient, 
    private util: UtilService, 
    private router: Router, 
    private storage: LocalStorageService, 
    private funct: FunctService,
    private readonly _zawgyiDetector: ZawgyiDetector)
    {
     
   }


  async ngOnInit(): Promise<void> {   
    this.prefix= "+95";
    if(this.storage.retrieve('localPhonePrefix') ==null){
      this.storage.store('localPhonePrefix',this.prefix);
    }
    this.phoneValue=this.storage.retrieve('localPhoneValue');
    this.loginModel = {
      phone_no: '',
      password: '',   
      app_version: '',
      fcmtoken: 'fcmtoken',
      deviceId: '',
      ipAddress: 'tt'
    } 
    this.translateService.addLangs(this.supportLanguages);
     
    if(this.storage.retrieve('localLanguage') == null || this.storage.retrieve('localLanguage') == '')
    {
      this.storage.store('localLanguage', 'en');
      this.activeLang=this.storage.store('localLanguage', 'en');
     
    }     
    else{
      this.translateService.setDefaultLang(this.storage.retrieve('localLanguage')); 
      this.activeLang=this.storage.retrieve('localLanguage');
     
    } 
     await this.getRegisterCountryCode();  
      var localpre=this.storage.retrieve('localPhonePrefix');
      if(localpre == null){
        this.selectedIndex = 0;
      }else{
           this.selectedIndex = 0;           
           if(this.registerCountryCode !=null && this.registerCountryCode !=undefined){
            for(let j=0;j< this.registerCountryCode.length;j++){
              if((this.registerCountryCode[j].prefix == localpre) && j== 0){
                
                return;
              }
              if((this.registerCountryCode[j].prefix == localpre) && j>0){
                
                this.selectedIndex= j;
                return;
              }
             }
           }
           
      }
     
      this.regularExpressionPhoneChange.emit(this.regularExpression);
      this.prefixChange.emit(this.prefix);
      if(this.registerCountryCode !=null){
        if (this.registerCountryCode.length > 0) {
          this.prefix= this.registerCountryCode[this.selectedIndex].prefix;
          this.imageUrl= this.registerCountryCode[this.selectedIndex].imageUrl;
          this.regularExpression = this.registerCountryCode[this.selectedIndex].regularExpression
          
      }
      }
      
  }
   handleError(error: HttpErrorResponse){
   
    if(error.status == 0){
      this.toastr.error("", 'check your internet connection', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    
    if(error.status == 423)
    {
      this.toastr.error("", this.translateService.instant("youNeedLogin"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
        this.storage.clear('token');
        this.storage.clear('isUserLoggedIn');
         this.router.navigate(['/login'], { replaceUrl: true });
    }
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", 'Invalid!', {
        timeOut: 3000,
        positionClass: 'toast-top-center',
        });
    }
    return throwError(error);
    }
  changeRegisterCountryCode(){
      this.prefix=this.registerCountryCode[this.selectedIndex].prefix;
      this.imageUrl = this.registerCountryCode[this.selectedIndex].imageUrl;
      this.regularExpression = this.registerCountryCode[this.selectedIndex].regularExpression;    
      this.regularExpressionPhoneChange.emit(this.regularExpression);
      this.prefixChange.emit(this.prefix);
      this.phoneValueChange.emit(this.phoneValue);
      this.storage.store('localPhonePrefix',this.prefix);
      
    }
  selectedRegisterCountryCode(index: number) {
    
      this.selectedIndex = index;
      this.changeRegisterCountryCode();
    }
  getRegisterCountryCode() { 
      let headers = new HttpHeaders();
      this.registerCountryCode = [];
      this.registerCountryCode = this.storage.retrieve('localRegisterCountryCode');
      
      if(this.registerCountryCode != null)
      {
        this.registerCountryCode = this.storage.retrieve('localRegisterCountryCode');        
      
      }
      this.http.get(this.funct.ipaddress + 'registerPhone/getRegisterPhoneMobileList', { headers: headers })
      .pipe(
          catchError(this.handleError.bind(this))
        )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.registerCountryCode = this.dto.Response;       
          let _prefix=this.storage.retrieve('localPhonePrefix');    
          this.registerCountryCode.forEach(element => {
            if(element.prefix == _prefix){
              this.prefix=element.prefix;
              this.imageUrl=element.imageUrl;
            }           
         });    
          this.storage.store('localRegisterCountryCode',  this.registerCountryCode);
      
        }
      );
    }
  checkPhoneNumber()
  {

    this.common.submitLoading= false;         
    this.spinner.hide("submitLoading");
    
    $("#phoneErr").html("");
    var prefix = this.storage.retrieve('localPhonePrefix');  
    this.phoneValueChange.emit(this.phoneValue);
    $("#phoneErr").html("");
    this.storage.store('localPhoneValue', this.phoneValue);
    if(this.phoneValue.length==0) 
    {
     var phoneRequired = this.translateService.instant("requiredFiled");
     phoneRequired =  phoneRequired.toString().replace("@value", this.translateService.instant("phonenumbererr"));
        $("#phoneErr").html(phoneRequired);
      return false;
    }
    const result = this._zawgyiDetector.detect(this.phoneValue);
    if (result.detectedEnc === 'zg') {
        $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
        return false;
    } else if (result.detectedEnc === 'uni') {
        $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
        return false;
    } 
    if(prefix == "+95"){       
      
      if(!this.phoneValue.startsWith("0")){       
       var checkNumber = this.translateService.instant("not-allowed-phone");
       checkNumber= checkNumber.toString().replace("@number","09");
        $("#phoneErr").html(checkNumber);
        return false;
      }
      
    }
    if(prefix == "+66"){
      if(!this.phoneValue.startsWith("0")){
       var checkNumber = this.translateService.instant("not-allowed-phone");
       checkNumber= checkNumber.toString().replace("@number","06, 08, 09");
        $("#phoneErr").html(checkNumber);
        return false;
      }
    }
    let pattern = RegExp(this.regularExpressionPhone);// /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$/;

    if (!pattern.test(this.phoneValue)) {     
       $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
       return false;
    }
    return true;
    
  }
  enter(event)
  {
    event.target.blur();
  }
  

}
