import { Component, HostListener, OnInit, Pipe, PipeTransform, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Subscription, throwError, timer } from 'rxjs';
import { Location, DatePipe, formatDate } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TwodCloseTimeComponent } from 'src/app/shared/components/twod-close-time/twod-close-time.component';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { BetSectionDialogComponent } from 'src/app/shared/dialog/bet-section-dialog/bet-section-dialog.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-twod-bet',
  templateUrl: './twod-bet.component.html',
  styleUrls: ['./twod-bet.component.scss']

})
export class TwodBetComponent implements OnInit {
  @ViewChild(TwodCloseTimeComponent) child: TwodCloseTimeComponent;
  twodNumbers: any;
  betCounterModel: any;
  betTwodModel: any;
  betTwodNumber = [];
  number: any;
  selected: any;
  betLimitColor: any;
  unbetstatus: any;
  amount: any;
  betAmount: any;
  betSelectedCount = 0;
  modalRef: BsModalRef;
  newBetTwodNumber = [];
  twoDBetLimitModel: any;
  betLimitedColor: any;
  token: any;
  userProfileModel: any;
  twoDCloseTime: any = false;
  sectionModel: any;
  test: any;
  closeWeekend: boolean = false;
  closeHoliday: boolean = false;
  closeTwoD: boolean = false;
  holidaryDescrition: any = '';
  colorMeaning: BsModalRef;
  parentLink: any;
  granParent: any;
  twoDCloseSection: any;
  section: any;
  sectionId: any;
  betSection: BsModalRef;
  modalConfig: ModalOptions;
  rNumberArray: Array<any> = [];
  qselectcloseno: Array<any> = [];
  twodBetUnBetList: BsModalRef;
  twodBetUnBetListmodal: any;
  twodBetAkhway: BsModalRef;
  enteredStrings = [];
  enteredStringsoutput = [];
  roundbuttondisable: boolean = false;
  usekhway: boolean = false;
  akhwaybuttondisable: boolean = false;
  akhwayconfrimbutton: boolean = true;
  maxlength: any;

  constructor(
    public common: CommonService,
    private datePipe: DatePipe,
    private modalService: BsModalService,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private dto: DtoService,
    private http: HttpClient,
    private util: UtilService,
    private router: Router,
    private storage: LocalStorageService,
    private funct: FunctService,
    private location: Location,) {
    this.section = this.storage.retrieve('localSection');
    this.sectionId = this.storage.retrieve('localSectionId');
    this.closeWeekend = this.storage.retrieve('localCloseWeekend');
    this.closeHoliday = this.storage.retrieve('localCloseHoliday');
  }

  quickSelectModal(quickSelect: TemplateRef<any>) {
    this.modalRef = this.modalService.show(quickSelect, { class: "quickSelect-class " });
  }

  colorMeaningModal(colorMeaning: TemplateRef<any>) {
    this.colorMeaning = this.modalService.show(colorMeaning, {
      class: "colorMeaning-class modal-sm"
    });
  }

  hidecolorMeaningModal() {
    this.colorMeaning.hide();
  }

  async ngOnInit(): Promise<void> {
    this.betSelectedCount = this.storage.retrieve('Localbetselectcount');
    this.maxlength = 7;
    this.roundbuttondisable = false;
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.holidaryDescrition = this.storage.retrieve('localHolidayDescription');
    if ((this.closeHoliday != undefined && this.closeHoliday != null) || (this.closeWeekend != undefined && this.closeWeekend != null)) {
      if (this.closeHoliday || this.closeWeekend) {
        this.closeTwoD = true;
        setTimeout(() => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
        }, 1000);
        return;
      }
    }
    this.storage.clear('localUnbetLimitList');
    this.userProfileModel = "";
    this.sectionModel = {
      "sectionId": ''
    };
    this.betTwodModel = {
      number: '',
      selected: false,
      amount: 0
    }
    this.betCount();
    this.twoDBetLimit();
    this.getBalance();
    this.fetchData();
  }

  checkMaxLength(event: any) {
    const inputValue = event.target.value;
    if (inputValue.length > this.maxlength) {
      this.betAmount = parseInt(inputValue.slice(0, this.maxlength), 10);
    }
  }

  keyPressNumbers(event: KeyboardEvent) {
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;
    if (!allowedKeys.includes(key) || inputElement.value.length >= this.maxlength) {
      event.preventDefault();
    }
  }

  onlyNumber(event: any) {
  const input = event.target;

  // remove non-numbers
  input.value = input.value.replace(/[^0-9]/g, '');

  this.betAmount = input.value;

  // keep cursor at end
  setTimeout(() => {
    input.setSelectionRange(input.value.length, input.value.length);
  });
}

  public twoDClose(data: any) {
    this.twoDCloseTime = data.status;
    this.twoDCloseSection = this.translateService.instant("twoDCloseTime").toString().replace("@section", data.section);
  }

  public getWeekendClosed(data: any) {
    this.closeWeekend = data;
    if (this.closeWeekend) {
      this.closeTwoD = true;
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
      return;
    }
  }

  public getHolidayClosed(data: any) {
    this.closeHoliday = data;
    if (this.closeHoliday) {
      this.closeTwoD = true;
      this.storage.store("localCloseHoliday", this.closeHoliday);
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
      return;
    }
  }

  betCount() {
    for (let i = 0; i < 100; i++) {
      if (i < 10) {
        this.betTwodModel.number = i;
        this.betTwodModel.selectednumber = false;
        this.betTwodNumber[i] = { number: 0 + '' + i, selected: false, betLimitColor: '', unbetstatus: false };
      }
      else {
        this.betTwodModel.number = i;
        this.betTwodModel.selectednumber = false;
        this.betTwodNumber[i] = { number: i, selected: false, betLimitColor: '', unbetstatus: false };
      }
    }
    this.common.refreshLoading = false;
    this.spinner.hide("refreshLoading");
  }

  betNumberSelected(i: number, selected: boolean, reverseStatus: boolean) {
    if (this.betTwodNumber != null && this.betTwodNumber != undefined) {
      if (i == this.betTwodNumber.find(x => x.number == i).number) {
        let rNumber = this.betTwodNumber.find(x => x.number == i).number.split('').reverse().join('');
        this.betTwodNumber.find(x => x.number == i).selected = selected;
        this.betTwodNumber.find(x => x.number == rNumber).reverseStatus = false;
        if (reverseStatus) {
          this.betTwodNumber.find(x => x.number == i).reverseStatus = false;
          this.betTwodNumber.find(x => x.number == rNumber).selected = false;
        }
        this.rNumberArray.splice(this.rNumberArray.findIndex(x => x == rNumber), 1);
      }
      if (i == this.twoDBetLimitModel.find(x => x.betNumber == i).betNumber) {
        if ((this.twoDBetLimitModel.find(x => x.betNumber == i).limitAmt == this.twoDBetLimitModel.find(x => x.betNumber == i).totalBetAmount)
          || (this.twoDBetLimitModel.find(x => x.betNumber == i).limitAmt - this.twoDBetLimitModel.find(x => x.betNumber == i).totalBetAmount) < 100) {
          this.betTwodNumber.find(x => x.number == i).selected = false;
          this.toastr.warning('', this.translateService.instant('bet_limit_above90'), {
            timeOut: 1000,
            positionClass: 'toast-bottom-center',
          });
        }
      }
    }
    this.twoDBetTotal();
  }

  twoDBetTotal() {
    for (let i = 0; i < this.betTwodNumber.length; i++) {
      if (this.betTwodNumber[i].selected == false && this.betTwodNumber[i].betLimitColor == "100" && this.betTwodNumber[i].unbetstatus == true) {
        this.qselectcloseno[i] = this.betTwodNumber[i].number;
      }
    }
    this.betSelectedCount = this.betTwodNumber.filter(obj => {
      if (obj.selected) return true;
      return false;
    }).length;
  }

  twoDBetTotalforqselect(twodBetUnBetList: TemplateRef<any>) {
    for (let i = 0; i < this.betTwodNumber.length; i++) {
      if (this.betTwodNumber[i].selected == false && this.betTwodNumber[i].betLimitColor == "100" && this.betTwodNumber[i].unbetstatus == true) {
        this.qselectcloseno[i] = this.betTwodNumber[i].number;
      }
    }
    for (let i = this.qselectcloseno.length - 1; i >= 0; i--) {
      if (this.qselectcloseno[i] == null) {
        this.qselectcloseno.splice(i, 1);
      }
    }
    const countNumberarr: string[] = this.qselectcloseno.map((element, index) => `${index + 1}.${element}`);
    const unBetLimitListModal = {
      unBetLimitList: countNumberarr
    };
    if (this.qselectcloseno.length != 0) {
      this.twodBetUnBetList = this.modalService.show(twodBetUnBetList, {
        initialState: unBetLimitListModal,
        class: "colorMeaning-class modal-sm",
        backdrop: true,
        ignoreBackdropClick: true
      });
    }
  }

  unBetLimitListModalDelete() {
    this.qselectcloseno = [];
    this.twodBetUnBetList.hide();
  }

  selected0bk() {
    let zeroBk = ['00', '19', '28', '37', '46', '55', '64', '73', '82', '91'];
    this.betTwodNumber.forEach(elem => {
      if (zeroBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (zeroBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalRef.hide();
  }

  selected1bk() {
    let oneBk = ['01', '10', '29', '38', '47', '56', '65', '74', '83', '92'];
    this.betTwodNumber.forEach(elem => {
      if (oneBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (oneBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected2bk() {
    let twoBk = ['02', '11', '20', '39', '48', '57', '66', '75', '84', '93'];
    this.betTwodNumber.forEach(elem => {
      if (twoBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (twoBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected3bk() {
    let threeBk = ['03', '12', '21', '30', '49', '58', '67', '76', '85', '94'];
    this.betTwodNumber.forEach(elem => {
      if (threeBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (threeBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected4bk() {
    let fourBk = ['04', '13', '22', '31', '40', '59', '68', '77', '86', '95'];
    this.betTwodNumber.forEach(elem => {
      if (fourBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (fourBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected5bk() {
    let fiveBk = ['05', '14', '23', '32', '41', '50', '69', '78', '87', '96'];
    this.betTwodNumber.forEach(elem => {
      if (fiveBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (fiveBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected6bk() {
    let sixBk = ['06', '15', '24', '33', '42', '51', '60', '79', '88', '97'];
    this.betTwodNumber.forEach(elem => {
      if (sixBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (sixBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;

      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected7bk() {
    let sevenBk = ['07', '16', '25', '34', '43', '52', '61', '70', '89', '98'];
    this.betTwodNumber.forEach(elem => {
      if (sevenBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (sevenBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected8bk() {
    let eightBk = ['08', '17', '26', '35', '44', '53', '62', '71', '80', '99'];
    this.betTwodNumber.forEach(elem => {
      if (eightBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (eightBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selected9bk() {
    let nineBk = ['09', '18', '27', '36', '45', '54', '63', '72', '81', '90'];
    this.betTwodNumber.forEach(elem => {
      if (nineBk.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (nineBk.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedBrother() {
    let brother = ['01', '12', '23', '34', '45', '56', '67', '78', '89', '90'];
    this.betTwodNumber.forEach(elem => {
      if (brother.find(x => x == elem.number) && elem.betLimitColor != "100") {
        elem.selected = true;
      }
    });
    this.betTwodNumber.forEach(elem => {
      if (brother.find(x => x == elem.number) && elem.betLimitColor == "100") {
        elem.unbetstatus = true;
      }
    });
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedBig() {
    for (let i = 50; i <= 99; i++) {
      if (i == this.betTwodNumber.find(x => x.number == i).number) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 50; i <= 99; i++) {
      if (i == this.betTwodNumber.find(x => x.number == i).number) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedSmall() {
    for (let i = 0; i <= 49; i++) {
      if (i == this.betTwodNumber.find(x => x.number == i).number) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 49; i++) {
      if (i == this.betTwodNumber.find(x => x.number == i).number) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedOdd() {
    for (let i = 0; i <= 99; i++) {
      if (i % 2 != 0) {
        if (i == this.betTwodNumber.find(x => x.number == i).number) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
            this.betTwodNumber.find(x => x.number == i).selected = true;
          }
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i % 2 != 0) {
        if (i == this.betTwodNumber.find(x => x.number == i).number) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
            this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
          }
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedEven() {
    for (let i = 0; i <= 99; i++) {
      if (i % 2 == 0) {
        if (i == this.betTwodNumber.find(x => x.number == i).number) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
            this.betTwodNumber.find(x => x.number == i).selected = true;
          }
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i % 2 == 0) {
        if (i == this.betTwodNumber.find(x => x.number == i).number) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
            this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
          }
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedEe() {
    if (this.betTwodNumber.find(x => x.number == "00").number) {
      if (this.betTwodNumber.find(x => x.number == "00").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "00").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "02").number) {
      if (this.betTwodNumber.find(x => x.number == "02").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "02").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "04").number) {
      if (this.betTwodNumber.find(x => x.number == "04").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "04").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "06").number) {
      if (this.betTwodNumber.find(x => x.number == "06").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "06").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "08").number) {
      if (this.betTwodNumber.find(x => x.number == "08").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "08").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "20").number) {
      if (this.betTwodNumber.find(x => x.number == "20").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "20").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "22").number) {
      if (this.betTwodNumber.find(x => x.number == "22").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "22").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "24").number) {
      if (this.betTwodNumber.find(x => x.number == "24").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "24").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "26").number) {
      if (this.betTwodNumber.find(x => x.number == "26").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "26").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "28").number) {
      if (this.betTwodNumber.find(x => x.number == "28").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "28").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "40").number) {
      if (this.betTwodNumber.find(x => x.number == "40").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "40").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "42").number) {
      if (this.betTwodNumber.find(x => x.number == "42").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "42").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "44").number) {
      if (this.betTwodNumber.find(x => x.number == "44").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "44").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "46").number) {
      if (this.betTwodNumber.find(x => x.number == "46").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "46").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "48").number) {
      if (this.betTwodNumber.find(x => x.number == "48").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "48").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "60").number) {
      if (this.betTwodNumber.find(x => x.number == "60").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "60").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "62").number) {
      if (this.betTwodNumber.find(x => x.number == "62").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "62").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "64").number) {
      if (this.betTwodNumber.find(x => x.number == "64").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "64").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "66").number) {
      if (this.betTwodNumber.find(x => x.number == "66").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "66").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "68").number) {
      if (this.betTwodNumber.find(x => x.number == "68").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "68").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "80").number) {
      if (this.betTwodNumber.find(x => x.number == "80").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "80").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "82").number) {
      if (this.betTwodNumber.find(x => x.number == "82").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "82").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "84").number) {
      if (this.betTwodNumber.find(x => x.number == "84").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "84").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "86").number) {
      if (this.betTwodNumber.find(x => x.number == "86").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "86").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "88").number) {
      if (this.betTwodNumber.find(x => x.number == "88").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "88").selected = true;
      }
    }


    if (this.betTwodNumber.find(x => x.number == "00").number) {
      if (this.betTwodNumber.find(x => x.number == "00").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "00").unbetstatus = true;
      }

    }

    if (this.betTwodNumber.find(x => x.number == "02").number) {
      if (this.betTwodNumber.find(x => x.number == "02").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "02").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "04").number) {
      if (this.betTwodNumber.find(x => x.number == "04").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "04").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "06").number) {
      if (this.betTwodNumber.find(x => x.number == "06").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "06").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "08").number) {
      if (this.betTwodNumber.find(x => x.number == "08").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "08").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "20").number) {
      if (this.betTwodNumber.find(x => x.number == "20").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "20").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "22").number) {
      if (this.betTwodNumber.find(x => x.number == "22").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "22").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "24").number) {
      if (this.betTwodNumber.find(x => x.number == "24").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "24").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "26").number) {
      if (this.betTwodNumber.find(x => x.number == "26").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "26").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "28").number) {
      if (this.betTwodNumber.find(x => x.number == "28").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "28").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "40").number) {
      if (this.betTwodNumber.find(x => x.number == "40").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "40").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "42").number) {
      if (this.betTwodNumber.find(x => x.number == "42").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "42").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "44").number) {
      if (this.betTwodNumber.find(x => x.number == "44").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "44").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "46").number) {
      if (this.betTwodNumber.find(x => x.number == "46").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "46").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "48").number) {
      if (this.betTwodNumber.find(x => x.number == "48").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "48").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "60").number) {
      if (this.betTwodNumber.find(x => x.number == "60").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "60").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "62").number) {
      if (this.betTwodNumber.find(x => x.number == "62").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "62").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "64").number) {
      if (this.betTwodNumber.find(x => x.number == "64").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "64").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "66").number) {
      if (this.betTwodNumber.find(x => x.number == "66").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "66").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "68").number) {
      if (this.betTwodNumber.find(x => x.number == "68").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "68").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "80").number) {
      if (this.betTwodNumber.find(x => x.number == "80").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "80").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "82").number) {
      if (this.betTwodNumber.find(x => x.number == "82").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "82").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "84").number) {
      if (this.betTwodNumber.find(x => x.number == "84").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "84").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "86").number) {
      if (this.betTwodNumber.find(x => x.number == "86").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "86").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "88").number) {
      if (this.betTwodNumber.find(x => x.number == "88").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "88").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedEo() {
    if (this.betTwodNumber.find(x => x.number == "01").number) {
      if (this.betTwodNumber.find(x => x.number == "01").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "01").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "03").number) {
      if (this.betTwodNumber.find(x => x.number == "03").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "03").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "05").number) {
      if (this.betTwodNumber.find(x => x.number == "05").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "05").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "07").number) {
      if (this.betTwodNumber.find(x => x.number == "07").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "07").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "09").number) {
      if (this.betTwodNumber.find(x => x.number == "09").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "09").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "21").number) {
      if (this.betTwodNumber.find(x => x.number == "21").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "21").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "23").number) {
      if (this.betTwodNumber.find(x => x.number == "23").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "23").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "25").number) {
      if (this.betTwodNumber.find(x => x.number == "25").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "25").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "27").number) {
      if (this.betTwodNumber.find(x => x.number == "27").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "27").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "29").number) {
      if (this.betTwodNumber.find(x => x.number == "29").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "29").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "41").number) {
      if (this.betTwodNumber.find(x => x.number == "41").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "41").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "43").number) {
      if (this.betTwodNumber.find(x => x.number == "43").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "43").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "45").number) {
      if (this.betTwodNumber.find(x => x.number == "45").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "45").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "47").number) {
      if (this.betTwodNumber.find(x => x.number == "47").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "47").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "49").number) {
      if (this.betTwodNumber.find(x => x.number == "49").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "49").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "61").number) {
      if (this.betTwodNumber.find(x => x.number == "61").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "61").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "63").number) {
      if (this.betTwodNumber.find(x => x.number == "63").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "63").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "65").number) {
      if (this.betTwodNumber.find(x => x.number == "65").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "65").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "67").number) {
      if (this.betTwodNumber.find(x => x.number == "67").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "67").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "69").number) {
      if (this.betTwodNumber.find(x => x.number == "69").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "69").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "81").number) {
      if (this.betTwodNumber.find(x => x.number == "81").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "81").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "83").number) {
      if (this.betTwodNumber.find(x => x.number == "83").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "83").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "85").number) {
      if (this.betTwodNumber.find(x => x.number == "85").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "85").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "87").number) {
      if (this.betTwodNumber.find(x => x.number == "87").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "87").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "89").number) {
      if (this.betTwodNumber.find(x => x.number == "89").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "89").selected = true;
      }
    }
    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "01").number) {
      if (this.betTwodNumber.find(x => x.number == "01").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "01").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "03").number) {
      if (this.betTwodNumber.find(x => x.number == "03").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "03").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "05").number) {
      if (this.betTwodNumber.find(x => x.number == "05").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "05").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "07").number) {
      if (this.betTwodNumber.find(x => x.number == "07").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "07").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "09").number) {
      if (this.betTwodNumber.find(x => x.number == "09").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "09").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "21").number) {
      if (this.betTwodNumber.find(x => x.number == "21").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "21").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "23").number) {
      if (this.betTwodNumber.find(x => x.number == "23").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "23").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "25").number) {
      if (this.betTwodNumber.find(x => x.number == "25").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "25").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "27").number) {
      if (this.betTwodNumber.find(x => x.number == "27").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "27").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "29").number) {
      if (this.betTwodNumber.find(x => x.number == "29").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "29").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "41").number) {
      if (this.betTwodNumber.find(x => x.number == "41").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "41").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "43").number) {
      if (this.betTwodNumber.find(x => x.number == "43").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "43").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "45").number) {
      if (this.betTwodNumber.find(x => x.number == "45").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "45").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "47").number) {
      if (this.betTwodNumber.find(x => x.number == "47").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "47").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "49").number) {
      if (this.betTwodNumber.find(x => x.number == "49").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "49").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "61").number) {
      if (this.betTwodNumber.find(x => x.number == "61").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "61").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "63").number) {
      if (this.betTwodNumber.find(x => x.number == "63").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "63").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "65").number) {
      if (this.betTwodNumber.find(x => x.number == "65").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "65").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "67").number) {
      if (this.betTwodNumber.find(x => x.number == "67").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "67").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "69").number) {
      if (this.betTwodNumber.find(x => x.number == "69").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "69").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "81").number) {
      if (this.betTwodNumber.find(x => x.number == "81").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "81").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "83").number) {
      if (this.betTwodNumber.find(x => x.number == "83").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "83").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "85").number) {
      if (this.betTwodNumber.find(x => x.number == "85").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "85").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "87").number) {
      if (this.betTwodNumber.find(x => x.number == "87").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "87").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "89").number) {
      if (this.betTwodNumber.find(x => x.number == "89").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "89").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedOe() {
    if (this.betTwodNumber.find(x => x.number == "10").number) {
      if (this.betTwodNumber.find(x => x.number == "10").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "10").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "12").number) {
      if (this.betTwodNumber.find(x => x.number == "12").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "12").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "14").number) {
      if (this.betTwodNumber.find(x => x.number == "14").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "14").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "16").number) {
      if (this.betTwodNumber.find(x => x.number == "16").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "16").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "18").number) {
      if (this.betTwodNumber.find(x => x.number == "18").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "18").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "30").number) {
      if (this.betTwodNumber.find(x => x.number == "30").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "30").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "32").number) {
      if (this.betTwodNumber.find(x => x.number == "32").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "32").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "34").number) {
      if (this.betTwodNumber.find(x => x.number == "34").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "34").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "36").number) {
      if (this.betTwodNumber.find(x => x.number == "36").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "36").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "38").number) {
      if (this.betTwodNumber.find(x => x.number == "38").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "38").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "50").number) {
      if (this.betTwodNumber.find(x => x.number == "50").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "50").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "52").number) {
      if (this.betTwodNumber.find(x => x.number == "52").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "52").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "54").number) {
      if (this.betTwodNumber.find(x => x.number == "54").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "54").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "56").number) {
      if (this.betTwodNumber.find(x => x.number == "56").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "56").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "58").number) {
      if (this.betTwodNumber.find(x => x.number == "58").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "58").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "70").number) {
      if (this.betTwodNumber.find(x => x.number == "70").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "70").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "72").number) {
      if (this.betTwodNumber.find(x => x.number == "72").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "72").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "74").number) {
      if (this.betTwodNumber.find(x => x.number == "74").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "74").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "76").number) {
      if (this.betTwodNumber.find(x => x.number == "76").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "76").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "78").number) {
      if (this.betTwodNumber.find(x => x.number == "78").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "78").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "90").number) {
      if (this.betTwodNumber.find(x => x.number == "90").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "90").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "92").number) {
      if (this.betTwodNumber.find(x => x.number == "92").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "92").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "94").number) {
      if (this.betTwodNumber.find(x => x.number == "94").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "94").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "96").number) {
      if (this.betTwodNumber.find(x => x.number == "96").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "96").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "98").number) {
      if (this.betTwodNumber.find(x => x.number == "98").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "98").selected = true;
      }
    }
    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "10").number) {
      if (this.betTwodNumber.find(x => x.number == "10").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "10").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "12").number) {
      if (this.betTwodNumber.find(x => x.number == "12").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "12").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "14").number) {
      if (this.betTwodNumber.find(x => x.number == "14").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "14").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "16").number) {
      if (this.betTwodNumber.find(x => x.number == "16").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "16").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "18").number) {
      if (this.betTwodNumber.find(x => x.number == "18").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "18").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "30").number) {
      if (this.betTwodNumber.find(x => x.number == "30").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "30").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "32").number) {
      if (this.betTwodNumber.find(x => x.number == "32").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "32").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "34").number) {
      if (this.betTwodNumber.find(x => x.number == "34").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "34").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "36").number) {
      if (this.betTwodNumber.find(x => x.number == "36").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "36").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "38").number) {
      if (this.betTwodNumber.find(x => x.number == "38").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "38").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "50").number) {
      if (this.betTwodNumber.find(x => x.number == "50").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "50").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "52").number) {
      if (this.betTwodNumber.find(x => x.number == "52").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "52").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "54").number) {
      if (this.betTwodNumber.find(x => x.number == "54").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "54").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "56").number) {
      if (this.betTwodNumber.find(x => x.number == "56").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "56").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "58").number) {
      if (this.betTwodNumber.find(x => x.number == "58").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "58").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "70").number) {
      if (this.betTwodNumber.find(x => x.number == "70").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "70").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "72").number) {
      if (this.betTwodNumber.find(x => x.number == "72").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "72").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "74").number) {
      if (this.betTwodNumber.find(x => x.number == "74").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "74").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "76").number) {
      if (this.betTwodNumber.find(x => x.number == "76").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "76").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "78").number) {
      if (this.betTwodNumber.find(x => x.number == "78").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "78").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "90").number) {
      if (this.betTwodNumber.find(x => x.number == "90").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "90").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "92").number) {
      if (this.betTwodNumber.find(x => x.number == "92").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "92").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "94").number) {
      if (this.betTwodNumber.find(x => x.number == "94").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "94").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "96").number) {
      if (this.betTwodNumber.find(x => x.number == "96").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "96").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "98").number) {
      if (this.betTwodNumber.find(x => x.number == "98").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "98").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedOo() {
    if (this.betTwodNumber.find(x => x.number == "11").number) {
      if (this.betTwodNumber.find(x => x.number == "11").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "11").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "13").number) {
      if (this.betTwodNumber.find(x => x.number == "13").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "13").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "15").number) {
      if (this.betTwodNumber.find(x => x.number == "15").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "15").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "17").number) {
      if (this.betTwodNumber.find(x => x.number == "17").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "17").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "19").number) {
      if (this.betTwodNumber.find(x => x.number == "19").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "19").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "31").number) {
      if (this.betTwodNumber.find(x => x.number == "31").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "31").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "33").number) {
      if (this.betTwodNumber.find(x => x.number == "33").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "33").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "35").number) {
      if (this.betTwodNumber.find(x => x.number == "35").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "35").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "37").number) {
      if (this.betTwodNumber.find(x => x.number == "37").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "37").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "39").number) {
      if (this.betTwodNumber.find(x => x.number == "39").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "39").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "51").number) {
      if (this.betTwodNumber.find(x => x.number == "51").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "51").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "53").number) {
      if (this.betTwodNumber.find(x => x.number == "53").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "53").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "55").number) {
      if (this.betTwodNumber.find(x => x.number == "55").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "55").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "57").number) {
      if (this.betTwodNumber.find(x => x.number == "57").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "57").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "59").number) {
      if (this.betTwodNumber.find(x => x.number == "59").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "59").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "71").number) {
      if (this.betTwodNumber.find(x => x.number == "71").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "71").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "73").number) {
      if (this.betTwodNumber.find(x => x.number == "73").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "73").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "75").number) {
      if (this.betTwodNumber.find(x => x.number == "75").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "75").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "77").number) {
      if (this.betTwodNumber.find(x => x.number == "77").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "77").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "79").number) {
      if (this.betTwodNumber.find(x => x.number == "79").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "79").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "91").number) {
      if (this.betTwodNumber.find(x => x.number == "91").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "91").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "93").number) {
      if (this.betTwodNumber.find(x => x.number == "93").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "93").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "95").number) {
      if (this.betTwodNumber.find(x => x.number == "95").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "95").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "97").number) {
      if (this.betTwodNumber.find(x => x.number == "97").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "97").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "99").number) {
      if (this.betTwodNumber.find(x => x.number == "99").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "99").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "11").number) {
      if (this.betTwodNumber.find(x => x.number == "11").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "11").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "13").number) {
      if (this.betTwodNumber.find(x => x.number == "13").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "13").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "15").number) {
      if (this.betTwodNumber.find(x => x.number == "15").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "15").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "17").number) {
      if (this.betTwodNumber.find(x => x.number == "17").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "17").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "19").number) {
      if (this.betTwodNumber.find(x => x.number == "19").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "19").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "31").number) {
      if (this.betTwodNumber.find(x => x.number == "31").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "31").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "33").number) {
      if (this.betTwodNumber.find(x => x.number == "33").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "33").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "35").number) {
      if (this.betTwodNumber.find(x => x.number == "35").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "35").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "37").number) {
      if (this.betTwodNumber.find(x => x.number == "37").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "37").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "39").number) {
      if (this.betTwodNumber.find(x => x.number == "39").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "39").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "51").number) {
      if (this.betTwodNumber.find(x => x.number == "51").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "51").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "53").number) {
      if (this.betTwodNumber.find(x => x.number == "53").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "53").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "55").number) {
      if (this.betTwodNumber.find(x => x.number == "55").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "55").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "57").number) {
      if (this.betTwodNumber.find(x => x.number == "57").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "57").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "59").number) {
      if (this.betTwodNumber.find(x => x.number == "59").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "59").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "71").number) {
      if (this.betTwodNumber.find(x => x.number == "71").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "71").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "73").number) {
      if (this.betTwodNumber.find(x => x.number == "73").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "73").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "75").number) {
      if (this.betTwodNumber.find(x => x.number == "75").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "75").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "77").number) {
      if (this.betTwodNumber.find(x => x.number == "77").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "77").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "79").number) {
      if (this.betTwodNumber.find(x => x.number == "79").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "79").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "91").number) {
      if (this.betTwodNumber.find(x => x.number == "91").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "91").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "93").number) {
      if (this.betTwodNumber.find(x => x.number == "93").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "93").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "95").number) {
      if (this.betTwodNumber.find(x => x.number == "95").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "95").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "97").number) {
      if (this.betTwodNumber.find(x => x.number == "97").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "97").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "99").number) {
      if (this.betTwodNumber.find(x => x.number == "99").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "99").unbetstatus = true;
      }
    }

    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedSame() {
    if (this.betTwodNumber.find(x => x.number == "00").number) {
      if (this.betTwodNumber.find(x => x.number == "00").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "00").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "11").number) {
      if (this.betTwodNumber.find(x => x.number == "11").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "11").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "22").number) {
      if (this.betTwodNumber.find(x => x.number == "22").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "22").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "33").number) {
      if (this.betTwodNumber.find(x => x.number == "33").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "33").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "44").number) {
      if (this.betTwodNumber.find(x => x.number == "44").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "44").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "55").number) {
      if (this.betTwodNumber.find(x => x.number == "55").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "55").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "66").number) {
      if (this.betTwodNumber.find(x => x.number == "66").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "66").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "77").number) {
      if (this.betTwodNumber.find(x => x.number == "77").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "77").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "88").number) {
      if (this.betTwodNumber.find(x => x.number == "88").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "88").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "99").number) {
      if (this.betTwodNumber.find(x => x.number == "99").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "99").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "00").number) {
      if (this.betTwodNumber.find(x => x.number == "00").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "00").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "11").number) {
      if (this.betTwodNumber.find(x => x.number == "11").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "11").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "22").number) {
      if (this.betTwodNumber.find(x => x.number == "22").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "22").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "33").number) {
      if (this.betTwodNumber.find(x => x.number == "33").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "33").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "44").number) {
      if (this.betTwodNumber.find(x => x.number == "44").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "44").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "55").number) {
      if (this.betTwodNumber.find(x => x.number == "55").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "55").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "66").number) {
      if (this.betTwodNumber.find(x => x.number == "66").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "66").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "77").number) {
      if (this.betTwodNumber.find(x => x.number == "77").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "77").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "88").number) {
      if (this.betTwodNumber.find(x => x.number == "88").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "88").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "99").number) {
      if (this.betTwodNumber.find(x => x.number == "99").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "99").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  //Round
  selectedRound0() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().length == 1) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      } else {
        if (i.toString().includes("0")) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
            this.betTwodNumber.find(x => x.number == i).selected = true;
          }
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().length == 1) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      } else {
        if (i.toString().includes("0")) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
            this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
          }
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound1() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("1")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("1")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound2() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("2")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("2")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound3() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("3")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("3")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound4() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("4")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("4")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound5() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("5")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("5")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound6() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("6")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("6")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound7() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("7")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("7")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound8() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("8")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("8")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedRound9() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("9")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().includes("9")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  // Head
  selectedHead0() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().length == 1) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      } else {
        if (i.toString().startsWith("0")) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
            this.betTwodNumber.find(x => x.number == i).selected = true;
          }
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().length == 1) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      } else {
        if (i.toString().startsWith("0")) {
          if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
            this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
          }
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedHead1() {
    for (let i = 10; i <= 99; i++) {
      if (i.toString().startsWith("1")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 10; i <= 99; i++) {
      if (i.toString().startsWith("1")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedHead2() {
    for (let i = 20; i <= 99; i++) {
      if (i.toString().startsWith("2")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 20; i <= 99; i++) {
      if (i.toString().startsWith("2")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedHead3() {
    for (let i = 30; i <= 99; i++) {
      if (i.toString().startsWith("3")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 30; i <= 99; i++) {
      if (i.toString().startsWith("3")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedHead4() {
    for (let i = 40; i <= 99; i++) {
      if (i.toString().startsWith("4")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 40; i <= 99; i++) {

      if (i.toString().startsWith("4")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedHead5() {
    for (let i = 50; i <= 99; i++) {
      if (i.toString().startsWith("5")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 50; i <= 99; i++) {
      if (i.toString().startsWith("5")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedHead6() {
    for (let i = 60; i <= 99; i++) {
      if (i.toString().startsWith("6")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 60; i <= 99; i++) {
      if (i.toString().startsWith("6")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedHead7() {
    for (let i = 70; i <= 99; i++) {
      if (i.toString().startsWith("7")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 70; i <= 99; i++) {
      if (i.toString().startsWith("7")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedHead8() {
    for (let i = 80; i <= 99; i++) {
      if (i.toString().startsWith("8")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 80; i <= 99; i++) {
      if (i.toString().startsWith("8")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedHead9() {
    for (let i = 90; i <= 99; i++) {
      if (i.toString().startsWith("9")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 90; i <= 99; i++) {
      if (i.toString().startsWith("9")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  //Tail
  selectedTail0() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("0")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("0")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail1() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("1")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("1")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail2() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("2")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("2")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail3() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("3")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("3")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail4() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("4")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("4")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail5() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("5")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("5")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail6() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("6")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("6")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail7() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("7")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("7")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail8() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("8")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("8")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedTail9() {
    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("9")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
          this.betTwodNumber.find(x => x.number == i).selected = true;
        }
      }
    }

    for (let i = 0; i <= 99; i++) {
      if (i.toString().endsWith("9")) {
        if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
          this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
        }
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  //constellation
  selectedConstellation() {
    if (this.betTwodNumber.find(x => x.number == "07").number) {
      if (this.betTwodNumber.find(x => x.number == "07").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "07").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "18").number) {
      if (this.betTwodNumber.find(x => x.number == "18").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "18").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "24").number) {
      if (this.betTwodNumber.find(x => x.number == "24").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "24").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "35").number) {
      if (this.betTwodNumber.find(x => x.number == "35").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "35").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "69").number) {
      if (this.betTwodNumber.find(x => x.number == "69").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "69").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "07").number) {
      if (this.betTwodNumber.find(x => x.number == "07").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "07").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "18").number) {
      if (this.betTwodNumber.find(x => x.number == "18").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "18").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "24").number) {
      if (this.betTwodNumber.find(x => x.number == "24").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "24").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "35").number) {
      if (this.betTwodNumber.find(x => x.number == "35").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "35").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "69").number) {
      if (this.betTwodNumber.find(x => x.number == "69").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "69").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedConstellationR() {
    if (this.betTwodNumber.find(x => x.number == "70").number) {
      if (this.betTwodNumber.find(x => x.number == "70").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "70").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "81").number) {
      if (this.betTwodNumber.find(x => x.number == "81").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "81").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "42").number) {
      if (this.betTwodNumber.find(x => x.number == "42").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "42").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "53").number) {
      if (this.betTwodNumber.find(x => x.number == "53").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "53").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "96").number) {
      if (this.betTwodNumber.find(x => x.number == "96").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "96").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "70").number) {
      if (this.betTwodNumber.find(x => x.number == "70").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "70").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "81").number) {
      if (this.betTwodNumber.find(x => x.number == "81").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "81").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "42").number) {
      if (this.betTwodNumber.find(x => x.number == "42").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "42").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "53").number) {
      if (this.betTwodNumber.find(x => x.number == "53").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "53").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "96").number) {
      if (this.betTwodNumber.find(x => x.number == "96").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "96").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  selectedPowder() {
    if (this.betTwodNumber.find(x => x.number == "05").number) {
      if (this.betTwodNumber.find(x => x.number == "05").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "05").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "16").number) {
      if (this.betTwodNumber.find(x => x.number == "16").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "16").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "27").number) {
      if (this.betTwodNumber.find(x => x.number == "27").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "27").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "38").number) {
      if (this.betTwodNumber.find(x => x.number == "38").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "38").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "49").number) {
      if (this.betTwodNumber.find(x => x.number == "49").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "49").selected = true;
      }
    }


    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "05").number) {
      if (this.betTwodNumber.find(x => x.number == "05").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "05").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "16").number) {
      if (this.betTwodNumber.find(x => x.number == "16").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "16").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "27").number) {
      if (this.betTwodNumber.find(x => x.number == "27").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "27").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "38").number) {
      if (this.betTwodNumber.find(x => x.number == "38").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "38").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "49").number) {
      if (this.betTwodNumber.find(x => x.number == "49").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "49").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedPowerR() {
    if (this.betTwodNumber.find(x => x.number == "50").number) {
      if (this.betTwodNumber.find(x => x.number == "50").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "50").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "61").number) {
      if (this.betTwodNumber.find(x => x.number == "61").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "61").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "72").number) {
      if (this.betTwodNumber.find(x => x.number == "72").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "72").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "83").number) {
      if (this.betTwodNumber.find(x => x.number == "83").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "83").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "94").number) {
      if (this.betTwodNumber.find(x => x.number == "94").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "94").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "50").number) {
      if (this.betTwodNumber.find(x => x.number == "50").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "50").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "61").number) {
      if (this.betTwodNumber.find(x => x.number == "61").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "61").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "72").number) {
      if (this.betTwodNumber.find(x => x.number == "72").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "72").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "83").number) {
      if (this.betTwodNumber.find(x => x.number == "83").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "83").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "94").number) {
      if (this.betTwodNumber.find(x => x.number == "94").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "94").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedThaiConstellation() {
    if (this.betTwodNumber.find(x => x.number == "07").number) {
      if (this.betTwodNumber.find(x => x.number == "07").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "07").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "19").number) {
      if (this.betTwodNumber.find(x => x.number == "19").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "19").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "23").number) {
      if (this.betTwodNumber.find(x => x.number == "23").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "23").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "48").number) {
      if (this.betTwodNumber.find(x => x.number == "48").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "48").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "56").number) {
      if (this.betTwodNumber.find(x => x.number == "56").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "56").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "07").number) {
      if (this.betTwodNumber.find(x => x.number == "07").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "07").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "19").number) {
      if (this.betTwodNumber.find(x => x.number == "19").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "19").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "23").number) {
      if (this.betTwodNumber.find(x => x.number == "23").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "23").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "48").number) {
      if (this.betTwodNumber.find(x => x.number == "48").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "48").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "56").number) {
      if (this.betTwodNumber.find(x => x.number == "56").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "56").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedThaiConstellationR() {
    if (this.betTwodNumber.find(x => x.number == "70").number) {
      if (this.betTwodNumber.find(x => x.number == "70").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "70").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "91").number) {
      if (this.betTwodNumber.find(x => x.number == "91").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "91").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "32").number) {
      if (this.betTwodNumber.find(x => x.number == "32").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "32").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "84").number) {
      if (this.betTwodNumber.find(x => x.number == "84").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "84").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "65").number) {
      if (this.betTwodNumber.find(x => x.number == "65").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "65").selected = true;
      }
    }

    //eidt ==100
    if (this.betTwodNumber.find(x => x.number == "70").number) {
      if (this.betTwodNumber.find(x => x.number == "70").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "70").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "91").number) {
      if (this.betTwodNumber.find(x => x.number == "91").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "91").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "32").number) {
      if (this.betTwodNumber.find(x => x.number == "32").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "32").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "84").number) {
      if (this.betTwodNumber.find(x => x.number == "84").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "84").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "65").number) {
      if (this.betTwodNumber.find(x => x.number == "65").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "65").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedThaiPowder() {
    if (this.betTwodNumber.find(x => x.number == "09").number) {
      if (this.betTwodNumber.find(x => x.number == "09").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "09").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "13").number) {
      if (this.betTwodNumber.find(x => x.number == "13").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "13").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "26").number) {
      if (this.betTwodNumber.find(x => x.number == "26").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "26").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "47").number) {
      if (this.betTwodNumber.find(x => x.number == "47").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "47").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "58").number) {
      if (this.betTwodNumber.find(x => x.number == "58").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "58").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "09").number) {
      if (this.betTwodNumber.find(x => x.number == "09").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "09").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "13").number) {
      if (this.betTwodNumber.find(x => x.number == "13").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "13").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "26").number) {
      if (this.betTwodNumber.find(x => x.number == "26").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "26").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "47").number) {
      if (this.betTwodNumber.find(x => x.number == "47").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "47").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "58").number) {
      if (this.betTwodNumber.find(x => x.number == "58").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "58").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedThaiPowderR() {
    if (this.betTwodNumber.find(x => x.number == "90").number) {
      if (this.betTwodNumber.find(x => x.number == "90").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "90").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "31").number) {
      if (this.betTwodNumber.find(x => x.number == "31").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "31").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "62").number) {
      if (this.betTwodNumber.find(x => x.number == "62").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "62").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "74").number) {
      if (this.betTwodNumber.find(x => x.number == "74").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "74").selected = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "85").number) {
      if (this.betTwodNumber.find(x => x.number == "85").betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == "85").selected = true;
      }
    }

    //edit ==100
    if (this.betTwodNumber.find(x => x.number == "90").number) {
      if (this.betTwodNumber.find(x => x.number == "90").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "90").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "31").number) {
      if (this.betTwodNumber.find(x => x.number == "31").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "31").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "62").number) {
      if (this.betTwodNumber.find(x => x.number == "62").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "62").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "74").number) {
      if (this.betTwodNumber.find(x => x.number == "74").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "74").unbetstatus = true;
      }
    }
    if (this.betTwodNumber.find(x => x.number == "85").number) {
      if (this.betTwodNumber.find(x => x.number == "85").betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == "85").unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  //select Number
  selectedNumber0019() {
    for (let i = 0; i <= 19; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == i).selected = true;
      }
    }
    for (let i = 0; i <= 19; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedNumber2039() {
    for (let i = 20; i <= 39; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == i).selected = true;
      }
    }
    for (let i = 20; i <= 39; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedNumber4059() {
    for (let i = 40; i <= 59; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == i).selected = true;
      }
    }

    for (let i = 40; i <= 59; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedNumber6079() {
    for (let i = 60; i <= 79; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == i).selected = true;
      }
    }


    for (let i = 60; i <= 79; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }
  selectedNumber8099() {
    for (let i = 80; i <= 99; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == i).selected = true;
      }
    }

    for (let i = 80; i <= 99; i++) {
      if (this.betTwodNumber.find(x => x.number == i).betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == i).unbetstatus = true;
      }
    }
    this.twoDBetTotal();
    this.modalService.hide();
  }

  checkBetAmount() {
    if (this.betAmount == '' || this.betAmount == null || this.betAmount == undefined) {
      var betAmountRequired = this.translateService.instant("requiredFiled");
      betAmountRequired = betAmountRequired.toString().replace("@value", this.translateService.instant("amount"));
      $("#betAmountErr").html(betAmountRequired);
      return false;
    }
    if (this.betAmount >= 100) {
      $("#betAmountErr").html("")
      return true;

    }
    if (this.betAmount < 100) {
      var betAmountRequired1 = this.translateService.instant("cannotSmallThan");
      betAmountRequired1 = betAmountRequired1.toString().replace("@value", 100);
      $("#betAmountErr").html(this.translateService.instant('amount') + ":" + betAmountRequired1);
      return false;
    }

  }
  betNumberChecked(twodBetUnBetList: TemplateRef<any>) {
    this.betSelectedCount = 0;
    for (let i = 0; i <= 99; i++) {
      if (this.betTwodNumber.find(x => x.number == i).selected == true) {
        this.betSelectedCount++;
      }
    }

    if (this.betSelectedCount == 0) {
      if (this.qselectcloseno.length != 0) {
        this.twoDBetTotalforqselect(twodBetUnBetList);
        return false;
      }
      else {
        this.toastr.error('', this.translateService.instant('select_numbers'), {
          positionClass: 'toast-bottom-center',
          timeOut: 1000,
        });
        return false;
      }

    }
  }
  twoDBet(twodBetUnBetList: TemplateRef<any>) {
    // this.storage.store
    let checkAmount = this.checkBetAmount();
    let checkNumber = this.betNumberChecked(twodBetUnBetList);
    if (checkAmount == false) {
      return;
    }
    if (checkNumber == false) {
      return;
    }



    if (this.qselectcloseno.length != 0) {

      this.twoDBetTotalforqselect(twodBetUnBetList);
    }
    else {
      let j = 0;
      for (let i = 0; i <= 99; i++) {
        if (this.betTwodNumber.find(x => (x.number == i && x.selected == true))) {
          this.betTwodNumber.find(x => (x.number == i && x.selected == true)).amount = this.betAmount;
          this.newBetTwodNumber[j] = this.betTwodNumber[i];
          j++;
        }

      }
      this.storage.store('Localbetselectcount', this.betSelectedCount);
      this.storage.store('localNewBetTwodNumber', this.newBetTwodNumber);
      this.storage.clear('localNewTwodDreamBookNumber');
      this.router.navigate(['/twod/bet-confirm'], { state: { betTwoDList: this.newBetTwodNumber }, replaceUrl: false });
    }

  }
  twoDBetClean() {
    this.betSelectedCount = 0;
    this.storage.clear('localNewBetTwodNumber');
    this.betTwodNumber.map((elem) => { elem.selected = false; elem.reverseStatus = false, elem.unbetstatus = false, elem.akhway = false });
    this.rNumberArray = [];
    this.roundbuttondisable = false;
    this.akhwaybuttondisable = false;
    this.qselectcloseno = [];
  }

  handleError(error: HttpErrorResponse) {

    if (error.status == 400) {
      this.toastr.error("", 'Bad request.', {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
    }
    if (error.status == 201) {
      this.toastr.error("", this.translateService.instant('record_alerady_exit'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return false;
    }
    if (error.status == 409) {
      this.toastr.error("", this.translateService.instant('dublicate'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return false;
    }
    if (error.status == 400) {
      this.toastr.error("Bad request.", this.translateService.instant('dublicate'), {
        timeOut: 1000,
        positionClass: 'toast-top-center',
      });
      return false;
    }
    return throwError(error);
  }
  twoDBetLimit() {

    var sectionId = this.storage.retrieve('localSectionId');
    this.sectionModel.sectionId = sectionId;
    let headers = new HttpHeaders();
    var sectionList = {
      "sectionId": sectionId
    };
    this.http.post(this.funct.ipaddress + 'betamountLimitation/Get2DBetLimitFourSection', sectionList, { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.storage.store('localTwoDBetLimitModel', this.dto.Response);
          this.twoDBetLimitModel = this.dto.Response;
          this.betLimit(this.twoDBetLimitModel);
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");

        });
  }

  betLimit(item: any) {
    var localBetNumber = this.storage.retrieve('localNewBetTwodNumber');
    if (localBetNumber != null) {
      for (let i = 0; i < item.length; i++) {
        if (localBetNumber.find(x => x.number == item[i].betNumber)) {
          if (this.percentData(this.twoDBetLimitModel[i]) != 100) {
            this.betTwodNumber[i] = {
              number: item[i].betNumber, selected: true,
              betLimitColor: this.percentData(this.twoDBetLimitModel[i]), unbetstatus: false
            };
          }

        }
        else {
          if (this.percentData(this.twoDBetLimitModel[i]) == 100) {
            this.betTwodNumber[i] = {
              number: item[i].betNumber, selected: false,
              betLimitColor: this.percentData(this.twoDBetLimitModel[i]), unbetstatus: false
            };
          }
          else {
            this.betTwodNumber[i] = {
              number: item[i].betNumber, selected: false,
              betLimitColor: this.percentData(this.twoDBetLimitModel[i]), unbetstatus: false
            };
          }

        }


      }

    }
    else {
      for (let i = 0; i < item.length; i++) {
        this.betTwodNumber[i] = {
          number: item[i].betNumber, selected: false,
          betLimitColor: this.percentData(this.twoDBetLimitModel[i]), unbetstatus: false
        };
      }
    }
  }
  percentData(item: any) {
    const value =
      ((parseInt(item.totalBetAmount)) / (parseInt(item.limitAmt))) * 100;

    if (parseInt(item.totalBetAmount) == 0) {
      return 5;
    } else if (value >= 100) {
      return 100;
    }
    else if (((parseInt(item.limitAmt)) - (parseInt(item.totalBetAmount))) < 100) {
      return 100;
    }
    else {
      return value;
    }
  }

  getBalance() {
    let login = this.storage.retrieve('isUserLoggedIn');
    if (!login) {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
      return;
    }

    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe(
        catchError(this.handleError.bind(this))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.userProfileModel = this.dto.Response;
        });
  }
  async fetchData() {

    this.test = "";
    this.test = await this.http
      .get<any>(this.funct.ipaddress + 'value/getDateTime')
      .pipe()
      .toPromise();

  }

  @HostListener('window:beforeunload', ['$event'])
  handleRefresh(event: Event) {
    this.storage.clear('Localbetselectcount')
    this.twoDBetClean();
  }

  refreshPage(): void {
    this.betSelectedCount = 0;
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.section = this.storage.retrieve('localSection');
    this.sectionId = this.storage.retrieve('localSectionId');
    this.ngOnInit();
    this.twoDBetClean();
    if (this.betAmount != null || this.betAmount != undefined || this.betAmount != "") {
      this.betAmount = "";
      $("#betAmountErr").html("");
    }
    if (!this.closeHoliday) {
      this.child.ngOnInit();
    }
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 1000);
  }


  betSectionModal() {
    let initialState = { refLink: null };
    this.modalConfig = {
      animated: true,
      keyboard: true,
      backdrop: true,
      ignoreBackdropClick: false,
      class: 'bet-section-modal modal-sm'
    };
    this.betSection = this.modalService.show(BetSectionDialogComponent, { ...this.modalConfig, initialState });
    this.betSection.content.selectedEvent.subscribe(res => {
      if (res == 200) this.betSectionSelected();
    });
  }
  selectedReverse() {

    let checkNumber = this.checkBetNumber();

    if (checkNumber == false) {
      return;
    }
    this.akhwaybuttondisable = true;
    for (let i = 0; i <= 99; i++) {
      if (this.betTwodNumber.find(x => (x.number == i && x.selected == true))) {

        let rNumber = this.betTwodNumber[i].number.split('').reverse().join('');
        let rNumberIndex = this.betTwodNumber.findIndex(x => x.number == rNumber);
        if (this.betTwodNumber[rNumberIndex].betLimitColor != 100) {
          this.betTwodNumber[rNumberIndex].selected = true;
          // reverse icon
          let twinNumbers = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
          if (
            !twinNumbers.includes(this.betTwodNumber[i].number) &&
            !this.rNumberArray.includes(this.betTwodNumber[i].number) &&
            !this.rNumberArray.includes(this.betTwodNumber[rNumberIndex].number)
          ) {
            this.rNumberArray.push(this.betTwodNumber[i].number);
          }

        }

      }
    }
    this.rNumberArray.forEach(elem1 => {
      this.betTwodNumber.find((elem2) => elem2.number == elem1).reverseStatus = true;
    });
    this.twoDBetTotal();

  }
  betSectionSelected() {
    this.section = this.storage.retrieve('localSection');
    this.sectionId = this.storage.retrieve('localSectionId');
    this.twoDBetLimit();
    this.twoDBetClean();
  }
  checkBetNumber() {
    this.betSelectedCount = this.betTwodNumber.filter(obj => {
      if (obj.selected) return true;
      return false;
    }).length;

    if (this.betSelectedCount == 0) {
      this.common.errorMsg('select_numbers', 'bottom');
      return false;
    }

  }
  enter(event) {
    event.target.blur();
  }

  goToDreamBook() {
    this.storage.clear('localNewTwodDreamBookNumber');
    this.router.navigate(['/twod/dream-book'], { replaceUrl: false });
  }

  // goBack()
  // {
  //   var twodsuccessback= history.state.twodsuccessback;
  //   if(twodsuccessback==true)
  //   {
  //     this.router.navigate(['/twod'],{state:{twodsuccessback:true},replaceUrl: false});
  //   }
  //   else{
  //   this.location.back();
  //   }

  // }
  refreshPageHeader() {
    this.ngOnInit();
  }

  twodBetAkhwayModal(twodBetAkhway: TemplateRef<any>, number: []) {
    //  const inputElement= document.getElementById('myInput') as HTMLInputElement;
    //   inputElement.value = '';
    const betModal = {
      number: number,
    };
    this.twodBetAkhway = this.modalService.show(twodBetAkhway, {
      initialState: betModal,
      class: "colorMeaning-class modal-sm",
      backdrop: true,
      ignoreBackdropClick: true
    });
  }
  selectedakway(akwaynumber: any) {
    this.usekhway = true;
    this.enteredStrings = [];
    let inputNumber: string = akwaynumber;
    let akhwaynumberarr: string[] = inputNumber.toString().split('');
    let numRows: number = akhwaynumberarr.length;
    let numColumns: number = akhwaynumberarr.length;
    let twoDiArray: string[][] = Array.from({ length: numRows }, () => Array(numColumns).fill(''));
    for (let i = 0; i < akhwaynumberarr.length; i++) {
      for (let j = 0; j < akhwaynumberarr.length; j++) {
        if (i <= akhwaynumberarr.length) {
          if (akhwaynumberarr[i] == akhwaynumberarr[j]) {
            twoDiArray[i][j] = '';
          }
          else {
            twoDiArray[i][j] = akhwaynumberarr[i] + akhwaynumberarr[j];
          }
        }

      }
    }
    let oneDArray: string[] = [].concat.apply([], twoDiArray);
    let filteredArray: string[] = oneDArray.filter((str) => str !== "");
    for (let i = 0; i < filteredArray.length; i++) {
      if (this.betTwodNumber.find(x => x.number == filteredArray[i]).betLimitColor != 100) {
        this.betTwodNumber.find(x => x.number == filteredArray[i]).selected = true;
        this.betTwodNumber.find(x => x.number == filteredArray[i]).akhway = true;
      }
    }

    for (let i = 0; i < filteredArray.length; i++) {
      if (this.betTwodNumber.find(x => x.number == filteredArray[i]).betLimitColor == 100) {
        this.betTwodNumber.find(x => x.number == filteredArray[i]).unbetstatus = true;
      }
    }


    if (filteredArray != null) {
      this.roundbuttondisable = true;
    }
    this.akhwaybuttondisable = true;
    this.twoDBetTotal();
    this.modalService.hide();

  }

  AwayModalDelete() {
    this.modalService.hide();
    this.enteredStrings = [];
    this.akhwayconfrimbutton = false;
    this.maxlength = 10;
  }

  containsNoDigits(word: string): boolean {
    const regex = /^[^0-9]*$/;
    return regex.test(word);
  }

  validateInput() {
    const inputElement = document.getElementById("inputString") as HTMLInputElement;
    let value = inputElement.value;

    if (this.containsNoDigits(value)) {
      this.akhwayconfrimbutton = true;
      value = value.replace(/[^0-9]/g, '');
      inputElement.value = value;
      return;
    }

    if (value.length < 2) {
      this.akhwayconfrimbutton = true;
      $("#samenumbererr").html('');
      return;
    }

    const lastChar = value[value.length - 1];
    const prevChar = value[value.length - 2];
    const before = value.slice(0, -1); // lastChar မပါဘဲ အရင်စာလုံးတွေ

    const count = value.split('').filter(v => v === lastChar).length;
    if (count > 2) {
      inputElement.value = value.slice(0, -1);
      const msg = this.translateService.instant("same2number");
      $("#samenumbererr").html(msg);
      this.akhwayconfrimbutton = true;
      return;
    }
    if (count === 2 && before.includes(lastChar)) {
      const msg = this.translateService.instant("same2number");
      $("#samenumbererr").html(msg);
      this.akhwayconfrimbutton = true;
      return;
    }

    if (lastChar === prevChar) {
      const msg = this.translateService.instant("same2number");
      $("#samenumbererr").html(msg);
      this.akhwayconfrimbutton = true;
      return;
    }
    $("#samenumbererr").html('');
    this.akhwayconfrimbutton = false;
  }
}
