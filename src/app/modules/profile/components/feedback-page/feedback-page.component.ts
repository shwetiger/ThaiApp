import { Component, OnInit, ElementRef,ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { Location } from '@angular/common';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/shared/service/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.scss']
})
export class FeedbackPageComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  feedbackModel : any;
  token : any;
  requiredForm!: FormGroup;
  feedbackTab:any;
  faqTab:any;
  QuestionHeaderList:any;
  Questiondetaillist:any;
  questionlistshow: boolean[];
  searchKey:any;
  answerlist:any;
  type:any;
  typeList:any;
  activeTab:any;
  
  constructor(   
    public common: CommonService,
    private handleErrorMessage: HandleErrorMessageService,
    private elementRef: ElementRef, 
    private translateService: TranslateService,
    private toastr: ToastrService,
    private http: HttpClient, 
    private funct: FunctService, 
    private storage: LocalStorageService, 
    private dto: DtoService,
    private _location: Location,
    private fb: FormBuilder,
    private router:Router,
    private route:ActivatedRoute) { 
      this.type = history.state.type;
      this.validation();
    }

  ngOnInit(): void {
    if(this.type=='feedback')
    {
      this.feedbackTab=true;
      this.faqTab=false;
    }
    else
    {
      this.feedbackTab=false;
      this.faqTab=true;
    }
    this.feedbackModel = {
      title : '',
      description : ''
    }
   this.getqusetionlist(0,'');

  }

  ngOndestroy() {
    this.elementRef.nativeElement.remove();
  }

 
  validation() {
    this.requiredForm = this.fb.group({
    title: ['', Validators.required ],
    description: ['', Validators.required ],
    });
  }
 
  titleRequired(){
    let title = this.translateService.instant("requiredFiled");
    title = title.toString().replace("@value", this.translateService.instant("feedbacktitleHint"));    
    return title;
  }
  descriptionRequired(){
    let descri = this.translateService.instant("requiredFiled");
    descri = descri.toString().replace("@value", this.translateService.instant("feedbackbodyHint"));    
    return descri;
  }
  goBack(){
    this._location.back();
  }
 containsSpecialCharacters(str) {
    var pattern = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return !pattern.test(str);
  }
  onSubmitting() {  
    this.feedbackModel.title= this.requiredForm.value['title'];
    this.feedbackModel.description= this.requiredForm.value['description'];
    // const containstitleHTML = this.containsSpecialCharacters(this.feedbackModel.title);
    // const containsdescHTML = this.containsSpecialCharacters(this.feedbackModel.description);
    // if(containstitleHTML && containsdescHTML)
    // {
    // } 
    // else
    // {
    //   this.toastr.error("", "Invalid characters", {
    //     timeOut: 3000,
    //     positionClass: 'toast-top-center',
    //     });
    //     return;
    // }
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    this.http.post(this.funct.ipaddress+'feedback/feedbackInsert', this.feedbackModel, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          if(this.dto.Response.message == "error"){
            this.toastr.error("", this.translateService.instant("submitting-request-time"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
              });
              return;
          }
      
  
            if(this.dto.Response == true)
            {
              this.toastr.success("", this.translateService.instant("success_message"), {
                timeOut: 3000,
                positionClass: 'toast-top-center',
                });
                this._location.back();         
            }
        }
    );
  }

  GotoFaq()
  {
    this.faqTab=true;
    this.feedbackTab=false;
  }
  GotoFeedback()
  {
    this.feedbackTab=true;
    this.faqTab=false;
  }


  getqusetionbyId(FaqId:any)
  {
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams(); 
    params = params.set('FaqId',FaqId);
    this.http.get(this.funct.ipaddress+'feedback/faqStepsForApp', { params:params,headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.Questiondetaillist=this.dto.Response;       
  });
}

getqusetionbytype(type:any)
  {
    this.token = this.storage.retrieve('token');    
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token); 
    let params = new HttpParams(); 
    params = params.set('FaqId',type);
    this.http.get(this.funct.ipaddress+'feedback/faqStepsForApp', { params:params,headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this,''))
     )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.Questiondetaillist=this.dto.Response;       
  });
}

getqusetionlist(typeId,question)
{
  this.token = this.storage.retrieve('token');    
  let headers = new HttpHeaders(); 
  let params = new HttpParams(); 
  params = params.set('typeId',typeId).set('question',question);
  this.http.get(this.funct.ipaddress+'feedback/faqlistforapp', {params:params,headers: headers })
    .pipe(
      catchError(this.handleErrorMessage.handleError.bind(this,''))
   )
    .subscribe(
      result => {
        this.dto.Response = result;
        this.QuestionHeaderList=this.dto.Response;
        console.log("QuestionList>>>"+JSON.stringify(this.QuestionHeaderList))
        this.questionlistshow = new Array(this.QuestionHeaderList.length).fill(false);
        this.typeList = Array.from(new Set(this.QuestionHeaderList.map(item => item.type_name)))
        .map(typeName => this.QuestionHeaderList.find(item => item.type_name === typeName)!);
       
});

}

  QuestiondetaillistShow(FaqId:any,i)
  {
    this.questionlistshow[i]=true;
    this.getqusetionbyId(FaqId)
  }
  QuestiondetaillistNotShow(i)
  {
    this.Questiondetaillist=[];
    this.questionlistshow[i]=false;
    
  }

  search() {
  
    if(this.searchKey==null ||this.searchKey.length==0){
      this.getqusetionlist(0,'');
      return;
    }
    else{
      this.getqusetionlist(0,this.searchKey);
    }
   
  } 

  onEnter()
  {
    this.searchInput.nativeElement.blur();
  }

  gotouserguide(id,question)
  {
   this.router.navigate(['/me-page/user-guide',{FaqId:id,Question:question} ])
  }
  countItems(items: any[]): number {
    return items.length;
  }

  switchTab(tabName: string): void {
    this.activeTab = tabName;
  }
 
}
