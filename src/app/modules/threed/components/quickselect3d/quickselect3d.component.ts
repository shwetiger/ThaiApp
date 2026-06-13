import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationExtras } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';

@Component({
  selector: 'app-quickselect3d',
  templateUrl: './quickselect3d.component.html',
  styleUrls: ['./quickselect3d.component.scss']
})
export class Quickselect3dComponent implements OnInit {
  trippleNumbers: Array<{ betNumberValue: string, isUse: number }> = [];
  hundredNumbers: Array<{ betNumberValue: string, isUse: number }> = [];
  count: number = 0;
  cannotSmallThan: any;
  amount: any;
  selectedRangeNumberList: Array<{ betNumberValue: string }> = [];
  newBetThreedNumber: any = [];
  closeTime: any;
  selectedNumberList1: Array<{ betNumberValue: string }> = [];
  selectedNumberList3: Array<{ betNumberValue: string }> = [];
  selectedNumberList: { betNumberValue: string }[] = [];
  threedCloseTime: any;
  constructor(private storage: LocalStorageService, private translateService: TranslateService, private router: Router, private toastr: ToastrService) {
    this.count = 0;
  }

  ngOnInit(): void {
    if (this.storage.retrieve('localTrippleNumbers') != null) {
      this.trippleNumbers = this.storage.retrieve('localTrippleNumbers');
      this.selectedNumberList = this.storage.retrieve('localSelectedNumberList');
    }
    else {
      this.assignTrippleNubmers();
    }
    if (this.storage.retrieve('localHundredNumbers') != null) {
      this.hundredNumbers = this.storage.retrieve('localHundredNumbers');
    }
    else {
      this.assignHundredNumbers();
    }
    if (this.storage.retrieve('localquickSelectCount') != null) {
      this.count = this.storage.retrieve('localquickSelectCount');
    }
    this.closeTime = history.state.closeTime;
    if (this.closeTime == undefined) {
      this.closeTime = true;
    }
  }

  public twodClose(data: any) {
    this.threedCloseTime = data;
  }

  assignTrippleNubmers() {
    for (let i = 0; i <= 9; i++) {
      let strValue = i.toString() + "" + i.toString() + "" + i.toString();
      this.trippleNumbers.push({ betNumberValue: strValue, isUse: 0 });
    }
  }

  assignHundredNumbers() {
    this.hundredNumbers.push({ betNumberValue: "000-099", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "100-199", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "200-299", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "300-399", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "400-499", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "500-599", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "600-699", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "700-799", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "800-899", isUse: 0 });
    this.hundredNumbers.push({ betNumberValue: "900-999", isUse: 0 });
  }
  selectTrippleNubmers(objNum): { betNumberValue: string; isUse: number; }[] {
    if (this.storage.retrieve('localSelectedNumberList') != null) {
      this.selectedNumberList = this.storage.retrieve('localSelectedNumberList');
    }
    if (this.hundredNumbers[0].isUse == 1 && objNum.betNumberValue == '000') {
      return;
    }
    if (this.hundredNumbers[1].isUse == 1 && objNum.betNumberValue == '111') {
      return;
    }
    if (this.hundredNumbers[2].isUse == 1 && objNum.betNumberValue == '222') {
      return;
    }
    if (this.hundredNumbers[3].isUse == 1 && objNum.betNumberValue == '333') {
      return;
    }
    if (this.hundredNumbers[4].isUse == 1 && objNum.betNumberValue == '444') {
      return;
    }
    if (this.hundredNumbers[5].isUse == 1 && objNum.betNumberValue == '555') {
      return;
    }
    if (this.hundredNumbers[6].isUse == 1 && objNum.betNumberValue == '666') {
      return;
    }
    if (this.hundredNumbers[7].isUse == 1 && objNum.betNumberValue == '777') {
      return;
    }
    if (this.hundredNumbers[8].isUse == 1 && objNum.betNumberValue == '888') {
      return;
    }
    if (this.hundredNumbers[9].isUse == 1 && objNum.betNumberValue == '999') {
      return;
    }

    let index = this.trippleNumbers.indexOf(objNum);
    if (index > -1) {
      if (objNum.isUse == 1) {
        this.selectedNumberList.splice(this.selectedNumberList.findIndex(x => x.betNumberValue === objNum.betNumberValue), 1);
        objNum.isUse = 0;
        this.count -= 1;
      }
      else {
        this.selectedNumberList.push({ betNumberValue: objNum.betNumberValue });
        objNum.isUse = 1;
        this.count += 1;
      }
      this.trippleNumbers[index] = objNum;
    }
    this.storage.store('localSelectedNumberList', this.selectedNumberList);
    this.storage.store('localTrippleNumbers', this.trippleNumbers);
    return this.trippleNumbers;
  }

  removeBetNumber(value: string) {
    const index = this.selectedNumberList.findIndex(item => item.betNumberValue === value);
    if (index !== -1) {
      this.selectedNumberList.splice(index, 1);
    }
  }
  selectHundredNubmers(objNum): { betNumberValue: string; isUse: number; }[] {

    if (this.storage.retrieve('localSelectedRangeNumberList') != null) {
      this.selectedRangeNumberList = this.storage.retrieve('localSelectedRangeNumberList');
    }

    if (objNum.betNumberValue == '000-099' && this.trippleNumbers[0].isUse == 1) {
      this.trippleNumbers[0].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[0].betNumberValue);
      this.count -= 1;
    }
    if (objNum.betNumberValue == '100-199' && this.trippleNumbers[1].isUse == 1) {
      this.trippleNumbers[1].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[1].betNumberValue);
      this.count -= 1;
    }
    if (objNum.betNumberValue == '200-299' && this.trippleNumbers[2].isUse == 1) {
      this.trippleNumbers[2].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[2].betNumberValue);
      this.count -= 1;
    }
    if (objNum.betNumberValue == '300-399' && this.trippleNumbers[3].isUse == 1) {
      this.trippleNumbers[3].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[3].betNumberValue);
      this.count -= 1;
    }

    if (objNum.betNumberValue == '400-499' && this.trippleNumbers[4].isUse == 1) {
      this.trippleNumbers[4].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[4].betNumberValue);
      this.count -= 1;
    }
    if (objNum.betNumberValue == '500-599' && this.trippleNumbers[5].isUse == 1) {
      this.trippleNumbers[5].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[5].betNumberValue);
      this.count -= 1;
    }

    if (objNum.betNumberValue == '600-699' && this.trippleNumbers[6].isUse == 1) {
      this.trippleNumbers[6].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[6].betNumberValue);
      this.count -= 1;
    }
    if (objNum.betNumberValue == '700-799' && this.trippleNumbers[7].isUse == 1) {
      this.trippleNumbers[7].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[7].betNumberValue);
      this.count -= 1;
    }
    if (objNum.betNumberValue == '800-899' && this.trippleNumbers[8].isUse == 1) {
      this.trippleNumbers[8].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[8].betNumberValue);
      this.count -= 1;
    }

    if (objNum.betNumberValue == '900-999' && this.trippleNumbers[9].isUse == 1) {
      this.trippleNumbers[9].isUse = 0;
      this.removeBetNumber(this.trippleNumbers[9].betNumberValue);
      this.count -= 1;
    }

    var isUse = objNum.isUse;

    if (this.hundredNumbers.find(x => x.betNumberValue === objNum.betNumberValue)) {
      if (isUse == 1) {

        var newselectedRangeNumberList = [];
        for (var j = 0; j < this.selectedRangeNumberList.length; j++) {
          if (this.selectedRangeNumberList[j].betNumberValue === objNum.betNumberValue) {

            continue
          }
          else {
            newselectedRangeNumberList.push(this.selectedRangeNumberList[j]);
          }
        }
        this.selectedRangeNumberList = newselectedRangeNumberList;
        this.count -= 100;
        this.hundredNumbers.find(x => x.betNumberValue === objNum.betNumberValue).isUse = 0;

      }
      if (isUse == 0) {
        this.selectedRangeNumberList.push({ betNumberValue: objNum.betNumberValue });
        this.count += 100;
        this.hundredNumbers.find(x => x.betNumberValue === objNum.betNumberValue).isUse = 1;
      }
    }
    this.storage.store('localSelectedRangeNumberList', this.selectedRangeNumberList);
    this.storage.store('localHundredNumbers', this.hundredNumbers);
    return this.hundredNumbers;
  }

  checkBetAmount() {
    if (this.amount == '' || this.amount == null || this.amount == undefined) {
      var amountRequired = this.translateService.instant("requiredFiled");
      amountRequired = amountRequired.toString().replace("@value", this.translateService.instant("amount"));
      $("#betAmountErr").html(amountRequired);
      return false;
    }
    if (this.amount >= 100) {
      $("#betAmountErr").html("")
      return true;
    }

    if (this.amount < 100) {
      this.cannotSmallThan = this.translateService.instant("cannotSmallThan");
      this.cannotSmallThan = this.translateService.instant('amount') + ": " + this.cannotSmallThan.toString().replace("@value", 100);
      $("#betAmountErr").html(this.cannotSmallThan);
      return false;
    }
  }

  onlyNumber(event: any) {
  const input = event.target;

  // remove non-numbers
  input.value = input.value.replace(/[^0-9]/g, '');

  this.amount = input.value;

  // keep cursor at end
  setTimeout(() => {
    input.setSelectionRange(input.value.length, input.value.length);
  });
}


  quickSelectCancel() {
    this.selectedNumberList = [];
    this.selectedRangeNumberList = [];
    this.storage.clear('localTrippleNumbers');
    this.storage.clear('localHundredNumbers');
    this.storage.clear('localSelectedNumberList');
    this.storage.clear('localSelectedRangeNumberList');
    this.storage.clear('localSelectedNumberListRange');
    this.storage.clear('localQuickSelectedNumberList');
    this.count = 0;
    this.trippleNumbers.forEach(item => {
      if (item.betNumberValue == item.betNumberValue) {
        item.isUse = 0;
      }
    });
    this.hundredNumbers.forEach(item => {
      if (item.betNumberValue == item.betNumberValue) {
        item.isUse = 0;
      }
    });
  }

  quickSelectBet() {
    this.selectedNumberList3 = [];
    let chkamount = this.checkBetAmount();
    if (!chkamount) {
      return
    }
    if (this.storage.retrieve('localSelectedRangeNumberList') != null) {
      this.selectedRangeNumberList = this.storage.retrieve('localSelectedRangeNumberList');
    }
    this.selectedNumberList1 = [];
    for (let j = 0; j < this.selectedRangeNumberList.length; j++) {
      let betNo = this.selectedRangeNumberList[j].betNumberValue;
      var newarr = betNo.split('-');
      if (newarr.length > 0) {
        let firstNo: number = 0;
        let secondNo: number = 0;
        firstNo = Number(newarr[0]);
        secondNo = Number(newarr[1]);
        for (let i = firstNo; i <= secondNo; i++) {
          if (i < 10) {
            this.selectedNumberList1.push({ betNumberValue: "00" + i.toString() });
          }
          if (i >= 10 && i < 100) {
            this.selectedNumberList1.push({ betNumberValue: "0" + i.toString() });
          }
          if (i >= 100) {
            this.selectedNumberList1.push({ betNumberValue: i.toString() });
          }
        }

      }
    }
    this.selectedNumberList3 = [...this.selectedNumberList, ...this.selectedNumberList1];
    if (this.selectedNumberList3.length > 0) {
      this.newBetThreedNumber = [];
      for (let n = 0; n < this.selectedNumberList3.length; n++) {
        this.newBetThreedNumber[n] = { "number": this.selectedNumberList3[n].betNumberValue, "selected": true, "unbetstatus": false, "amount": this.amount };
      }
      if (this.threedCloseTime) {
        this.toastr.error('', this.translateService.instant('threeDbet_time_close'), {
          positionClass: 'toast-top-center',
          timeOut: 1000,
        });
        return;
      }
      this.storage.store('localQuickSelectedNumberList', this.newBetThreedNumber);
      this.storage.store('localquickSelectLink', true);
      var countNum = this.newBetThreedNumber.length;
      this.storage.store('localquickSelectCount', countNum);
      this.storage.store('threedRoot', "/quick-select3d");
      this.storage.store('localThreedDPage', 'quickSelect');
      this.router.navigate(['/threed/bet-confirm'], { state: { betThreeDList: this.newBetThreedNumber, quickSelectedList: true }, replaceUrl: false });
    }
    else {
      this.toastr.error("", this.translateService.instant("select_numbers"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
  }
  enter(event) {
    event.target.blur();
  }
}
