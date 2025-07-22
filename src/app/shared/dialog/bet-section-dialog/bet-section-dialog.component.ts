import { Component, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { FunctService } from '../../service/funct.service';
import { DtoService } from '../../service/dto.service';
import { CommonService } from '../../service/common.service';

@Component({
  selector: 'app-bet-section-dialog',
  templateUrl: './bet-section-dialog.component.html',
  styleUrls: ['./bet-section-dialog.component.scss']
})
export class BetSectionDialogComponent implements OnInit {
  
  public selectedEvent: EventEmitter<any> = new EventEmitter();

  refLink: any;
  twodSectionList: any[] = [];

  constructor(
    private translateService: TranslateService,
    private modalService: BsModalService,
    private http: HttpClient,
    private funct: FunctService,
    private toastr: ToastrService,
    private dto: DtoService,
    private router: Router,
    private storage: LocalStorageService,
    public modalRef: BsModalRef,
    public common: CommonService
  ) {

    this.twodSectionList = this.storage.retrieve('localTwodSectionList');
  }

  async ngOnInit() {
    if (this.twodSectionList == null || this.twodSectionList == undefined || this.twodSectionList.length == 0) {
      this.twodSectionList = await this.getSectionList();
    }
    this.checkTwodCloseTime();
    
  }

  async getSectionList() {
    const axios = require('axios').default;
    const response = await axios.get(this.funct.ipaddress + 'twodsection/getTwodSectionList');
    return response.data;
  }

  async checkTwodCloseTime() {

    const dateTime = await this.common.getDateTime();
    const currentTime = await this.common.convertMyanmarTime(dateTime);

    for(let i=0; i < this.twodSectionList.length; i++){    
      if (this.twodSectionList[i].fromTime != null && this.twodSectionList[i].toTime != null) {

        var toTime = this.twodSectionList[i].toTime.split(":");
        var to = new Date(currentTime);
        to.setHours(toTime[0]);
        to.setMinutes(toTime[1]);

        var fourHour36Mins = new Date(currentTime);
        fourHour36Mins.setHours(16);
        fourHour36Mins.setMinutes(36);
      
        if (currentTime.getTime() >= to.getTime()){      
          this.twodSectionList[i].isClosed = true;
          this.twodSectionList[i].isSelected = false;                                        
        }  
        
        if (currentTime.getTime() >= fourHour36Mins.getTime()) {  
          this.twodSectionList[i].isClosed = false;
          this.twodSectionList[i].isSelected = false;                                        
        }

      }        
    }
    
    this.storage.store('localTwodSectionList', this.twodSectionList);
  }

  betSectionSelect(id: number){    
    for(let i=0; i< this.twodSectionList.length; i++){
      if(this.twodSectionList[i].id == id){        
        this.twodSectionList[i].isSelected = true;
        this.storage.store('localSection', this.twodSectionList[i]);
        this.storage.store('localSectionId', this.twodSectionList[i].id);
      } 
      else{
        
        this.twodSectionList[i].isSelected = false;
      }
    }
  }

  sectiondiglogclose()
  {
    for(let i=0; i< this.twodSectionList.length; i++){
    this.twodSectionList[i].isSelected = false;
    }
    this.modalRef.hide();
    
  }
  twoDbet(){   
    let count=0;
    for (let i=0; i< this.twodSectionList.length; i++) {
      if (this.twodSectionList[i].isSelected) {
        this.modalRef.hide();
        if (this.refLink == 'twod-bet') { // from twod-initial
          this.router.navigate(['/twod/bet'], {state:{replaceUrl: false}});
        } else if (this.refLink == 'twod-package') { // from twod-package
          this.router.navigate(['/twod-package'], {state:{replaceUrl: false}});
        } else if (this.refLink == null) { // from twod-bet
          this.selectedEvent.emit(200);
        }
      } else {
        ++count;
      }
    }
     
    if (count == 4) {
      this.common.warningMsg('bet-not-select', 'top');
    }
  }



}
