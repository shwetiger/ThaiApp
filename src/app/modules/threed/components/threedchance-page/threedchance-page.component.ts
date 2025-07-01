import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders ,HttpErrorResponse, HttpParams} from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, retry } from 'rxjs/operators';
import { Subscription, throwError , timer } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { Router, ActivatedRoute } from '@angular/router';
import { FunctService } from 'src/app/shared/service/funct.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { esLocale } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'app-threedchance-page',
  templateUrl: './threedchance-page.component.html',
  styleUrls: ['./threedchance-page.component.scss']
})
export class ThreedchancePageComponent implements OnInit {
  threeDBetLimitModel : any;
  betThreedNumber=[];
  selectedThreedNumber: Array<any> = new Array<any>(); 

  number: any;
  selected: any; 
  betLimitColor: any;
  unbetstatus: any;
  buttonVisible :Boolean; /*XXXX*/
  not3dLimit = false;

  constructor(
    private router: Router, 
    private storage: LocalStorageService, 
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private translateService: TranslateService,) {
   
   }

  ngOnInit(): void {
    this.getThreedbetLimit();
  }
  handleError(error: HttpErrorResponse){
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", '', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
    }
    if(error.status == 201)
    {
       this.toastr.error("", this.translateService.instant('record_alerady_exit'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        return false;
    }
    if(error.status == 409)
    {
       this.toastr.error("Tip", this.translateService.instant('dublicate'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        return false;
    }
    if(error.status == 400)
    {
       this.toastr.error("Bad request.", this.translateService.instant('dublicate'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
        });
        return false;
    }
    return throwError(error);
    }

 getThreedbetLimit()
 {
  let headers = new HttpHeaders(); 
  this.http.get(this.funct.ipaddress + 'betamountLimitation/Get3DBetLimit',{ headers: headers })
  .pipe(
    catchError(this.handleError.bind(this))
  )
  .subscribe(
    result => {
      this.dto.Response = result;      
      this.storage.store('localThreeDBetLimitModel',this.dto.Response);
      this.threeDBetLimitModel = this.storage.retrieve('localThreeDBetLimitModel');
      /*XXX*/
      if(this.threeDBetLimitModel == null || this.threeDBetLimitModel.length == 0)
      {
        this.not3dLimit = true;
      }
      this.betLimit(this.threeDBetLimitModel);
      /*XXX*/
      if(this.betThreedNumber == null || this.betThreedNumber.length ==0)
      {
       this.buttonVisible = false; /*select button*/
      }
      else {
        this.buttonVisible = true;
      }
    
      
    }); 
 }

 betLimit(item:any)
 {   
  for (let i= 0; i < item.length; i++)
   {   
    const value = Math.round(((parseInt(item[i].totalBetAmount)) / (parseInt(item[i].limitAmt))) * 100);  
    if( value >= 80 && ((parseInt(item[i].limitAmt)) -(parseInt(item[i].totalBetAmount))) >= 100) //XXX edit >=
    {
      this.betThreedNumber[i] =
      {       
        number: item[i].betNumber, 
        selected: false, 
        betLimitColor: value,
        unbetstatus: false
      }; 
      continue;
    }
    if( value >= 80 && ((parseInt(item[i].limitAmt)) -(parseInt(item[i].totalBetAmount))) < 100)
    {
      this.betThreedNumber[i] =
      {       
        number: item[i].betNumber, 
        selected: false, 
        betLimitColor: 100,
        unbetstatus: false
      }; 
      continue;
    }
    
   }
   this.betThreedNumber = this.betThreedNumber.filter(function (el) {
    return (el != null || el != undefined);
   }); 
   /*remove null or undefined in array*/
 // .log("ddd" + JSON.stringify(this.betThreedNumber))
 }

// percentData(item: any) /*not use now*/
// {
  
  
//     if (item.limitedAmt == null) {
//             return 0;
//     }
//     const value = ((parseInt(item.totalBetAmount)) / (parseInt(item.limitAmt))) * 100;
//     if (parseInt(item.totalBetAmount) == 0) {
//       return 0;
//     } else if (value >= 100) {
//       return 100;
//     } else if(((parseInt(item.limitAmt)) - (parseInt(item.totalBetAmount))) < 100){
//       return 100;
//     }
//      else {
//       return value;
//     } 
 
  
// }

betNumberSelected(i: number , selected: boolean){
  var filtered = this.betThreedNumber.filter(function (el) {
    return (el != null || el != undefined);
  }); 

  if((i == filtered.find(x=>x.number == i).number) && filtered.find(x=>x.number == i).betLimitColor < 100)
  {
    filtered.find(x=>x.number == i).selected=selected;
    if(selected == true)
    {
      this.selectedThreedNumber.push(i);
    }
    if(selected == false)
    {
        if(this.selectedThreedNumber != null || this.selectedThreedNumber != undefined)
        {
          var index = this.selectedThreedNumber.findIndex(x => x === i);
          this.selectedThreedNumber.splice(index, 1); 
        }
    }
  }
  if(i == this.threeDBetLimitModel.find(x=>x.betNumber == i).betNumber)
  {     
    if((this.threeDBetLimitModel.find(x=>x.betNumber == i).limitAmt == this.threeDBetLimitModel.find(x=>x.betNumber == i).totalBetAmount ) || ((this.threeDBetLimitModel.find(x=>x.betNumber == i).limitAmt - this.threeDBetLimitModel.find(x=>x.betNumber == i).totalBetAmount ) < 100))
    {
      filtered.find(x=>x.number == i).selected=false;
      this.toastr.warning('',this.translateService.instant('bet_limit_above90'), {
        timeOut: 1000,
        positionClass: 'toast-bottom-center',
        });
    }
   
  } 
}
goToBetPage()
{
  if( this.selectedThreedNumber.length > 0)
  {
    this.router.navigate(['/threed/bet'], {state: {threedbetChance:  this.selectedThreedNumber},replaceUrl: false} );
 
  }
  else
  {
    this.toastr.error('',this.translateService.instant('select_numbers'), {
      timeOut: 1000,
      positionClass: 'toast-bottom-center',
      });
    return;
  }
}
}
