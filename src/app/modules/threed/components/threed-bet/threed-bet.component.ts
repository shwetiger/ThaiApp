import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, NavigationExtras } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { ThreedCloseTimeComponent } from 'src/app/shared/components/threed-close-time/threed-close-time.component';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { Location } from '@angular/common';
import { FunctService } from 'src/app/shared/service/funct.service';
import { catchError, retry } from 'rxjs/operators';
import { DtoService } from 'src/app/shared/service/dto.service';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-threed-bet',
  templateUrl: './threed-bet.component.html',
  styleUrls: ['./threed-bet.component.scss']
})
export class ThreedBetComponent implements OnInit {
  @ViewChild(ThreedCloseTimeComponent) child: ThreedCloseTimeComponent;
  amount: any;
  cannotSmallThan: any;
  isUserLoggedIn: boolean = false;
  betValue = '';
  betnumber: string;
  isUse: number;
  betNumberList: Array<{ betNumberValue: string, isUse: number }> = [];
  newBetThreedNumber = [];
  threedbetChance: any;
  threedCloseTime: any;
  token: any;
  selectnum: any;
  threedNumberFieldType: any;
  dunum: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private spinner: NgxSpinnerService,
    private storage: LocalStorageService,
    private translateService: TranslateService,
    private router: Router,
    private toastr: ToastrService,
    private location: Location,
    private http: HttpClient,
    private funct: FunctService,
    private dto: DtoService) {
    this.threedbetChance = history.state.threedbetChance;
  }

  ngOnInit() {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.getThreedScrolling();
    this.threedNumberFieldType = "number";
    this.storage.clear('localTrippleNumbers');
    this.storage.clear('localHundredNumbers');
    this.storage.clear('localSelectedNumberList');
    this.storage.clear('localSelectedRangeNumberList');
    this.storage.clear('localSelectedNumberListRange');
    this.storage.clear('localQuickSelectedNumberList');
    this.storage.clear('localquickSelectLink');
    this.storage.clear('localNewDreamBookNumber');
    this.betNumberList = this.storage.retrieve('localSelectTwoDList');
    this.getCheckUser()
    if (this.threedbetChance != null) {
      this.storeThreedChangeNumber();
    }
  }

  storeThreedChangeNumber() {
    this.betNumberList = [];
    if (this.threedbetChance.length > 0) {
      for (let l = 0; l < this.threedbetChance.length; l++) {
        if (this.betNumberList.find(x => x.betNumberValue === this.threedbetChance[l])) {
          continue;
        }
        else {
          this.betNumberList.push({ "betNumberValue": this.threedbetChance[l], "isUse": 1 });
          this.storage.store('localSelectTwoDList', this.betNumberList)
        }
      }
    }
  }
  public twodClose(data: any) {
    this.threedCloseTime = data;
  }

  selectNumber(num1) {
    this.betNumberList = [];
    if (num1.length == 0) {
      num1 = $("#number-swiper-value").val();
      this.selectnum = num1;
    }

    try {

      if (num1.includes('-')) {
        this.toastr.error(
          "",
          this.translateService.instant("invalid_bet_number"),
          {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          }
        );
        this.storeBetNumber(newNumber, false);
        return;
      }
      if (num1.includes('.')) {
        this.toastr.error("", this.translateService.instant("invalid_bet_number"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      if (num1) {
        var newNumber = [];
        var splitted = ("" + num1).split("");
        if (splitted.length == 3) {
          var indexValue = this.betNumberList.filter(f => f.betNumberValue === num1).length;
          if (indexValue == 0) {
            this.betNumberList.push({ betNumberValue: num1, isUse: 1 });
            this.betValue = '';
            newNumber.push({ betNumberValue: num1, isUse: 1 });
            this.storeBetNumber(newNumber, false);
          }
        }
        else {

        }
      }
    }
    catch (Error) {
    }
  }

  storeBetNumber(item: any, isFromRound: any) {
    if (this.storage.retrieve('localSelectTwoDList') != null) {
      this.betNumberList = this.storage.retrieve('localSelectTwoDList');
    }
    else {
      this.betNumberList = [];
    }
    if (item.length > 0) {
      for (let l = 0; l < item.length; l++) {
        if (this.betNumberList.find(x => x.betNumberValue === item[l].betNumberValue)) {
          if (!isFromRound) {
            this.toastr.error("", this.translateService.instant("already_added"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
          }
          continue;
        }
        else {
          this.betNumberList.push({ "betNumberValue": item[l].betNumberValue, "isUse": 1 });
        }
      }
    }
    this.storage.store('localSelectTwoDList', this.betNumberList);
  }
  roundNumber(num1) {
    this.betNumberList = [];
    if (num1.length == 0) {
      num1 = this.selectnum;
      if (this.dunum == num1) {
        this.toastr.error("", this.translateService.instant("select_numbers"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      }
      if (num1 == undefined || num1 == '') {
        if (this.storage.retrieve('localSelectTwoDList') != null) {
          this.betNumberList = this.storage.retrieve('localSelectTwoDList');
        }
        this.toastr.error("", this.translateService.instant("select_numbers"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
      }
    }
    try {
      if (num1.includes('.')) {
        this.toastr.error("", this.translateService.instant("invalid_bet_number"), {
          timeOut: 3000,
          positionClass: 'toast-top-center',
        });
        return;
      }
      if (num1) {
        this.dunum = num1;
        var newNumber = [];
        var splitted = ("" + num1).split("");
        if (splitted.length == 3) {
          var indexValue = this.betNumberList.indexOf(num1);
          if (indexValue < 0) {
            let unique = splitted.filter((item, i, ar) => ar.indexOf(item) === i);
            if (unique.length == 1) {
              this.betNumberList.push({ betNumberValue: num1, isUse: 1 });
              newNumber.push({ betNumberValue: num1, isUse: 1 });
            }
            else {
              let shuff1 = splitted[0] + splitted[1] + splitted[2];
              if (this.betNumberList.filter(f => f.betNumberValue === shuff1).length == 0) {
                this.betNumberList.push({ betNumberValue: shuff1, isUse: 1 });
                newNumber.push({ betNumberValue: shuff1, isUse: 1 });
              }
              let shuff2 = splitted[0] + splitted[2] + splitted[1];
              if (this.betNumberList.filter(f => f.betNumberValue === shuff2).length == 0) {
                this.betNumberList.push({ betNumberValue: shuff2, isUse: 1 });
                newNumber.push({ betNumberValue: shuff2, isUse: 1 });
              }
              let shuff3 = splitted[1] + splitted[0] + splitted[2];
              if (this.betNumberList.filter(f => f.betNumberValue === shuff3).length == 0) {
                this.betNumberList.push({ betNumberValue: shuff3, isUse: 1 });
                newNumber.push({ betNumberValue: shuff3, isUse: 1 });
              }
              let shuff4 = splitted[1] + splitted[2] + splitted[0];
              if (this.betNumberList.filter(f => f.betNumberValue === shuff4).length == 0) {
                this.betNumberList.push({ betNumberValue: shuff4, isUse: 1 });
                newNumber.push({ betNumberValue: shuff4, isUse: 1 });
              }
              let shuff5 = splitted[2] + splitted[0] + splitted[1];
              if (this.betNumberList.filter(f => f.betNumberValue === shuff5).length == 0) {
                this.betNumberList.push({ betNumberValue: shuff5, isUse: 1 });
                newNumber.push({ betNumberValue: shuff5, isUse: 1 });
              }
              let shuff6 = splitted[2] + splitted[1] + splitted[0];
              if (this.betNumberList.filter(f => f.betNumberValue === shuff6).length == 0) {
                this.betNumberList.push({ betNumberValue: shuff6, isUse: 1 });
                newNumber.push({ betNumberValue: shuff6, isUse: 1 });
              }
            }
            this.betValue = '';
          }
        }
        this.storeBetNumber(newNumber, true);
      }
    }
    catch (Error) {

    }
  }

  clearNumber() {
    this.storage.clear('localSelectTwoDList');
    this.betNumberList = [];
    this.selectnum = ''
  }

  selectBetNumber(objNum): { betNumberValue: string; isUse: number; }[] {
    let index = this.betNumberList.indexOf(objNum);
    if (index > -1) {
      if (objNum.isUse == 1) {
        objNum.isUse = 0;
      }
      else {
        objNum.isUse = 1;
      }
      this.betNumberList[index] = objNum;
    }
    return this.betNumberList;
  }

  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    const allowedChars = /^[0-9]*$/;
    if (!allowedChars.test(event.key) || event.key === '.') {
      event.preventDefault();
      return false
    }
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    else {
      return true;
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
  keyPressNumberfornumberintput(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const charCode = (event.which) ? event.which : event.keyCode;
    const allowedChars = /^[0-9]*$/;

    if (inputElement.value.length >= 3 && allowedChars.test(event.key)) {
      event.preventDefault();
      return false;
    }
    if (!allowedChars.test(event.key) || charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  checkBetNumberCount() {
    $("#betNumberCountErr").html("");
    if (this.betValue == null || this.betValue == undefined || this.betValue == '') {
      $("#betNumberCountErr").html("");
      return true;
    }
    if (this.betValue.toString().length > 3) {
      $("#betNumberCountErr").html("Must be 3 digit only");
      return;
    }
    if (this.betValue.toString().length < 3) {
      $("#betNumberCountErr").html(this.translateService.instant("threed_number_text_required"));
      return;
    }
    if (this.betValue.toString().includes('.') || this.betValue.toString().includes('-')) {
      $("#betNumberCountErr").html(this.translateService.instant("invalid_bet_number"));
      return;
    }
    else {
      $("#betNumberCountErr").html("");
      return true;
    }
  }
  threeDBet() {
    let checkAmount = this.checkBetAmount();
    if (checkAmount == false) {
      return;
    }
    if (this.betNumberList == null || this.betNumberList == undefined) {
      this.toastr.error('', this.translateService.instant('select_numbers'), {
        positionClass: 'toast-top-center',
        timeOut: 1000,
      });
      return;
    }
    let source = this.betNumberList.filter(f => f.isUse == 1);
    if (source.length > 0) {
      if (this.checkBetAmount()) {
        var c = 0;
        for (var i = 0; i < source.length; i++) {
          this.newBetThreedNumber[i] = { "number": source[i].betNumberValue, "selected": true, "unbetstatus": false, "amount": this.amount };
        }
        if (this.threedCloseTime) {
          this.toastr.error('', this.translateService.instant('threeDbet_time_close'), {
            positionClass: 'toast-top-center',
            timeOut: 1000,
          });
          return;
        }
        else {
          this.storage.store('localNewBetThreedNumber', this.newBetThreedNumber);
          this.storage.clear('threedRoot');
          this.storage.store('localThreedDPage', 'threed');
          this.router.navigate(['/threed/bet-confirm'], { state: { betThreeDList: this.newBetThreedNumber }, replaceUrl: false });
        }
      }
    }
    else {
      this.toastr.error("", this.translateService.instant("select_numbers"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
    }
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
      this.cannotSmallThan = this.translateService.instant('amount') + ": " + this.cannotSmallThan.toString().replace("@value", '100');
      $("#betAmountErr").html(this.cannotSmallThan);
      return false;
    }
  }

  refreshPage() {
    this.common.refreshLoading = true;
    this.spinner.show("refreshLoading");
    this.clearNumber();
    if (this.amount != null || this.amount != undefined || this.amount != "") {
      this.amount = "";
    }
    if (this.betValue != null || this.betValue != undefined || this.betValue != "") {
      this.betValue = "";
    }
    this.ngOnInit();
    this.child.getCloseTime();
    this.threedCloseTime = this.child.threeDCloseTime;
    this.child.getUserProfile();
    setTimeout(() => {
      this.common.refreshLoading = false;
      this.spinner.hide("refreshLoading");
    }, 3000);
  }

  getCheckUser() {
    this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', this.token);
    this.http.get(this.funct.ipaddress + 'user/PointUserProfile', { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.common.refreshLoading = false;
          this.spinner.hide("refreshLoading");
          this.dto.Response = {};
          this.dto.Response = result;
          this.isUserLoggedIn = true;
        });
  }

  enter(event) {
    event.target.blur();
  }

  quickSelectedFunction() {
    this.storage.clear('localTrippleNumbers');
    this.storage.clear('localHundredNumbers');
    this.storage.clear('localSelectedNumberList');
    this.storage.clear('localSelectedRangeNumberList');
    this.storage.clear('localSelectedNumberListRange');
    this.storage.clear('localQuickSelectedNumberList');
    this.storage.clear('localquickSelectLink');
    this.storage.clear('localquickSelectCount');
    this.router.navigate(['/threed/quick-select3d'], { state: { closeTime: this.threedCloseTime, }, replaceUrl: false })
  }

  goToDreamBook() {
    this.router.navigate(['/threed/dream-book'], { replaceUrl: false });
  }

  getThreedScrolling() {
    const easing = {
      easeOutCubic: function (pos) {
        return (Math.pow((pos - 1), 3) + 1);
      },
      easeOutQuart: function (pos) {
        return -(Math.pow((pos - 1), 4) - 1);
      },
    };
    class IosSelector {
      elems: any;
      options: any;
      halfCount: number;
      quarterCount: number;
      a: number;
      minV: number;
      selected: any;
      source: any;
      exceedA: number;
      moveT: number;
      moving: boolean;
      events: { touchstart: any; touchmove: any; touchend: any; };
      itemHeight: number;
      itemAngle: number;
      radius: number;
      scroll: number;
      value: any;
      type: string;
      onChange: any;
      constructor(options) {
        let defaults = {
          el: '', // dom
          type: 'infinite', // infinite 无限滚动，normal 非无限
          count: 20, // 圆环规格，圆环上选项个数，必须设置 4 的倍数
          sensitivity: 0.8, // 灵敏度
          source: [], // 选项 {value: xx, text: xx}
          value: null,
          onChange: null
        };

        this.options = Object.assign({}, defaults, options);
        this.options.count = this.options.count - this.options.count % 4;
        Object.assign(this, this.options);
        this.halfCount = this.options.count / 2;
        this.quarterCount = this.options.count / 4;
        this.a = this.options.sensitivity * 10; // 滚动减速度
        this.minV = Math.sqrt(1 / this.a); // 最小初速度
        this.selected = this.source[0];
        this.exceedA = 10; // 超出减速
        this.moveT = 0; // 滚动 tick
        this.moving = false;
        this.elems = {
          el: document.querySelector(this.options.el),
          circleList: null,
          circleItems: null, // list
          highlight: null,
          highlightList: null,
          highListItems: null // list
        };
        this.events = {
          touchstart: null,
          touchmove: null,
          touchend: null
        };
        this.itemHeight = this.elems.el.offsetHeight * 3 / this.options.count; // 每项高度
        this.itemAngle = 360 / this.options.count; // 每项之间旋转度数
        this.radius = this.itemHeight / Math.tan(this.itemAngle * Math.PI / 180); // 圆环半径
        this.scroll = 0; // 单位为一个 item 的高度（度数）
        this._init();
      }

      _init() {
        this._create(this.options.source);

        let touchData = {
          startY: 0,
          yArr: []
        };
        for (let eventName in this.events) {
          this.events[eventName] = ((eventName) => {
            return (e) => {
              if (this.elems.el.contains(e.target) || e.target === this.elems.el) {
                e.preventDefault();
                if (this.source.length) {
                  this['_' + eventName](e, touchData);
                }
              }
            };
          })(eventName);
        }
        this.elems.el.addEventListener('touchstart', this.events.touchstart);
        document.addEventListener('mousedown', this.events.touchstart);
        this.elems.el.addEventListener('touchend', this.events.touchend);
        document.addEventListener('mouseup', this.events.touchend);
        if (this.source.length) {
          this.value = this.value !== null ? this.value : this.source[0].value;
          this.select(this.value);
        }
      }
      _touchstart(e, touchData) {
        this.elems.el.addEventListener('touchmove', this.events.touchmove);
        document.addEventListener('mousemove', this.events.touchmove);
        let eventY = e.clientY || e.touches[0].clientY;
        touchData.startY = eventY;
        touchData.yArr = [[eventY, new Date().getTime()]];
        touchData.touchScroll = this.scroll;
        this._stop();
      }
      _touchmove(e, touchData) {
        let eventY = e.clientY || e.touches[0].clientY;
        touchData.yArr.push([eventY, new Date().getTime()]);
        if (touchData.length > 5) {
          touchData.unshift();
        }
        let scrollAdd = (touchData.startY - eventY) / this.itemHeight;
        let moveToScroll = scrollAdd + this.scroll;
        if (this.type === 'normal') {
          if (moveToScroll < 0) {
            moveToScroll *= 0.3;
          } else if (moveToScroll > this.source.length) {
            moveToScroll = this.source.length + (moveToScroll - this.source.length) * 0.3;
          }
        } else {
          moveToScroll = this._normalizeScroll(moveToScroll);
        }
        touchData.touchScroll = this._moveTo(moveToScroll);
      }
      _touchend(e, touchData) {
        this.elems.el.removeEventListener('touchmove', this.events.touchmove);
        document.removeEventListener('mousemove', this.events.touchmove);
        let v;
        if (touchData.yArr.length === 1) {
          v = 0;
        } else {
          let startTime = touchData.yArr[touchData.yArr.length - 2][1];
          let endTime = touchData.yArr[touchData.yArr.length - 1][1];
          let startY = touchData.yArr[touchData.yArr.length - 2][0];
          let endY = touchData.yArr[touchData.yArr.length - 1][0];
          v = ((startY - endY) / this.itemHeight) * 1000 / (endTime - startTime);
          let sign = v > 0 ? 1 : -1;
          v = Math.abs(v) > 30 ? 30 * sign : v;
        }
        this.scroll = touchData.touchScroll;
        this._animateMoveByInitV(v);
      }
      _create(source) {
        if (!source.length) {
          return;
        }
        let template = `
          <div class="select-wrap">
            <ul class="select-options" style="transform: translate3d(0, 0, ${-this.radius}px) rotateX(0deg);">
              {{circleListHTML}}
            </ul>
            <div class="highlight">
              <ul class="highlight-list">
                {{highListHTML}}
              </ul>
            </div>
          </div>
        `;
        if (this.options.type === 'infinite') {
          let concatSource = [].concat(source);
          while (concatSource.length < this.halfCount) {
            concatSource = concatSource.concat(source);
          }
          source = concatSource;
        }
        this.source = source;
        let sourceLength = source.length;
        let circleListHTML = '';
        for (let i = 0; i < source.length; i++) {
          circleListHTML += `<li class="select-option"
                        style="
                          top: ${this.itemHeight * -0.5}px;
                          height: ${this.itemHeight}px;
                          line-height: ${this.itemHeight}px;
                          transform: rotateX(${-this.itemAngle * i}deg) translate3d(0, 0, ${this.radius}px);
                        "
                        data-index="${i}"
                        >${source[i].text}</li>`
        }

        let highListHTML = '';
        for (let i = 0; i < source.length; i++) {
          this.itemHeight = 40;
          highListHTML += `<li class="highlight-item" style="height: ${this.itemHeight}px;">
                            ${source[i].text}
                          </li>`;
        }
        if (this.options.type === 'infinite') {
          for (let i = 0; i < this.quarterCount; i++) {
            circleListHTML = `<li class="select-option"
                          style="
                            top: ${this.itemHeight * -0.5}px;
                            height: ${this.itemHeight}px;
                            line-height: ${this.itemHeight}px;
                            transform: rotateX(${this.itemAngle * (i + 1)}deg) translate3d(0, 0, ${this.radius}px);
                          "
                          data-index="${-i - 1}"
                          >${source[sourceLength - i - 1].text}</li>` + circleListHTML;
            circleListHTML += `<li class="select-option"
                          style="
                            top: ${this.itemHeight * -0.5}px;
                            height: ${this.itemHeight}px;
                            line-height: ${this.itemHeight}px;
                            transform: rotateX(${-this.itemAngle * (i + sourceLength)}deg) translate3d(0, 0, ${this.radius}px);
                          "
                          data-index="${i + sourceLength}"
                          >${source[i].text}</li>`;
          }
          highListHTML = `<li class="highlight-item" style="height: ${this.itemHeight}px;">
                              ${source[sourceLength - 1].text}
                          </li>` + highListHTML;
          highListHTML += `<li class="highlight-item" style="height: ${this.itemHeight}px;">${source[0].text}</li>`
        }
        this.elems.el.innerHTML = template
          .replace('{{circleListHTML}}', circleListHTML)
          .replace('{{highListHTML}}', highListHTML);
        this.elems.circleList = this.elems.el.querySelector('.select-options');
        this.elems.circleItems = this.elems.el.querySelectorAll('.select-option');
        this.elems.highlight = this.elems.el.querySelector('.highlight');
        this.elems.highlightList = this.elems.el.querySelector('.highlight-list');
        this.elems.highlightitems = this.elems.el.querySelectorAll('.highlight-item');
        if (this.type === 'infinite') {
          this.elems.highlightList.style.top = -this.itemHeight + 'px';
        }
        this.elems.highlight.style.height = this.itemHeight + 'px';
        this.elems.highlight.style.lineHeight = this.itemHeight + 'px';
      }
      _normalizeScroll(scroll) {
        let normalizedScroll = scroll;
        while (normalizedScroll < 0) {
          normalizedScroll += this.source.length;
        }
        normalizedScroll = normalizedScroll % this.source.length;
        return normalizedScroll;
      }
      _moveTo(scroll) {
        if (this.type === 'infinite') {
          scroll = this._normalizeScroll(scroll);
        }
        this.elems.circleList.style.transform = `translate3d(0, 0, ${-this.radius}px) rotateX(${this.itemAngle * scroll}deg)`;
        this.elems.highlightList.style.transform = `translate3d(0, ${-(scroll) * this.itemHeight}px, 0)`;

        [...this.elems.circleItems].forEach(itemElem => {
          if (Math.abs(itemElem.dataset.index - scroll) > this.quarterCount) {
            itemElem.style.visibility = 'hidden';
          } else {
            itemElem.style.visibility = 'visible';
          }
        });
        return scroll;
      }

      async _animateMoveByInitV(initV) {
        let initScroll;
        let finalScroll;
        let finalV;
        let totalScrollLen;
        let a;
        let t;
        if (this.type === 'normal') {
          if (this.scroll < 0 || this.scroll > this.source.length - 1) {
            a = this.exceedA;
            initScroll = this.scroll;
            finalScroll = this.scroll < 0 ? 0 : this.source.length - 1;
            totalScrollLen = initScroll - finalScroll;
            t = Math.sqrt(Math.abs(totalScrollLen / a));
            initV = a * t;
            initV = this.scroll > 0 ? -initV : initV;
            finalV = 0;
            await this._animateToScroll(initScroll, finalScroll, t);
          } else {
            initScroll = this.scroll;
            a = initV > 0 ? -this.a : this.a; // 减速加速度
            t = Math.abs(initV / a); // 速度减到 0 花费时间
            totalScrollLen = initV * t + a * t * t / 2; // 总滚动长度
            finalScroll = Math.round(this.scroll + totalScrollLen); // 取整，确保准确最终 scroll 为整数
            finalScroll = finalScroll < 0 ? 0 : (finalScroll > this.source.length - 1 ? this.source.length - 1 : finalScroll);
            totalScrollLen = finalScroll - initScroll;
            t = Math.sqrt(Math.abs(totalScrollLen / a));
            await this._animateToScroll(this.scroll, finalScroll, t, 'easeOutQuart');
          }
        } else {
          initScroll = this.scroll;
          a = initV > 0 ? -this.a : this.a; // 减速加速度
          t = Math.abs(initV / a); // 速度减到 0 花费时间
          totalScrollLen = initV * t + a * t * t / 2; // 总滚动长度
          finalScroll = Math.round(this.scroll + totalScrollLen); // 取整，确保准确最终 scroll 为整数
          await this._animateToScroll(this.scroll, finalScroll, t, 'easeOutQuart');
        }
        this._selectByScroll(this.scroll);
      }

      _animateToScroll(initScroll, finalScroll, t, easingName = 'easeOutQuart') {
        if (initScroll === finalScroll || t === 0) {
          this._moveTo(initScroll);
          return;
        }

        let start = new Date().getTime() / 1000;
        let pass = 0;
        let totalScrollLen = finalScroll - initScroll;
        return new Promise<void>((resolve, reject) => {
          this.moving = true;
          let tick = () => {
            pass = new Date().getTime() / 1000 - start;
            if (pass < t) {
              this.scroll = this._moveTo(initScroll + easing[easingName](pass / t) * totalScrollLen);
              this.moveT = requestAnimationFrame(tick);
            } else {
              resolve();
              this._stop();
              this.scroll = this._moveTo(initScroll + totalScrollLen);
            }
          };
          tick();
        });
      }
      _stop() {
        this.moving = false;
        cancelAnimationFrame(this.moveT);
      }
      _selectByScroll(scroll) {
        scroll = this._normalizeScroll(scroll) | 0;
        if (scroll > this.source.length - 1) {
          scroll = this.source.length - 1;
          this._moveTo(scroll);
        }
        this._moveTo(scroll);
        this.scroll = scroll;
        this.selected = this.source[scroll];
        this.value = this.selected.value;
        this.onChange && this.onChange(this.selected);
      }

      updateSource(source) {
        this._create(source);

        if (!this.moving) {
          this._selectByScroll(this.scroll);
        }
      }

      select(value) {
        for (let i = 0; i < this.source.length; i++) {
          if (this.source[i].value === value) {
            window.cancelAnimationFrame(this.moveT);
            let initScroll = this._normalizeScroll(this.scroll);
            let finalScroll = i;
            let t = Math.sqrt(Math.abs((finalScroll - initScroll) / this.a));
            this._animateToScroll(initScroll, finalScroll, t);
            setTimeout(() => this._selectByScroll(i));
            return;
          }
        }
        throw new Error(`can not select value: ${value}, ${value} match nothing in current source`);
      }

      destroy() {
        this._stop();
        for (let eventName in this.events) {
          this.elems.el.removeEventListener('eventName', this.events[eventName]);
        }
        document.removeEventListener('mousedown', this.events['touchstart']);
        document.removeEventListener('mousemove', this.events['touchmove']);
        document.removeEventListener('mouseup', this.events['touchend']);
        this.elems.el.innerHTML = '';
        this.elems = null;
      }
    }

    function getYears() {
      let currentYear = 10;//new Date().getFullYear();
      let years = [];
      for (let i = 0; i < 10; i++) {
        years.push({
          value: i,
          text: i
        });
      }
      return years;
    }

    function getMonths() {
      let months = [];
      for (let i = 0; i < 10; i++) {
        months.push({
          value: i,
          text: i
        });
      }
      return months;
    }

    function getDays() {
      let dayCount = 10;//new Date(year,month,0).getDate();
      let days = [];
      for (let i = 0; i < dayCount; i++) {
        days.push({
          value: i,
          text: i
        });
      }
      return days;
    }

    function getScrolling() {
      let yearSelector;
      let monthSelector;
      let daySelector;
      var currentYear = 1;//new Date().getFullYear();
      var currentMonth = 1;
      var currentDay = 1;
      const yearSource = getYears();
      const monthSource = getMonths(); let daySource = getDays();
      yearSelector = new IosSelector({
        el: '#year1',
        type: 'infinite',
        source: yearSource,
        count: 20,
        onChange: (selected) => {
          currentYear = selected.value;
          daySource = getDays();
          daySelector.updateSource(daySource);
          $("#number-swiper-value").val(yearSelector.value + "" + monthSelector.value + "" + daySelector.value);
        }
      });
      monthSelector = new IosSelector({
        el: '#month1',
        type: 'infinite',
        source: monthSource,
        count: 20,
        onChange: (selected) => {
          currentMonth = selected.value;
          daySource = getDays();
          daySelector.updateSource(daySource);
          $("#number-swiper-value").val(yearSelector.value + "" + monthSelector.value + "" + daySelector.value);
        }
      });
      daySelector = new IosSelector({
        el: '#day1',
        type: 'infinite',
        source: [],
        count: 20,
        onChange: (selected) => {
          currentDay = selected.value;
          $("#number-swiper-value").val(yearSelector.value + "" + monthSelector.value + "" + daySelector.value);
        }
      });

      let now = new Date();
      setTimeout(function () {
        yearSelector.select(0);
        monthSelector.select(0);
        daySelector.select(0);
      });
    }

    getScrolling();
  }

  goBack() {
    var threedsuccessback = history.state.threedsuccessback;
    if (threedsuccessback == true) {
      this.router.navigate(['/threed'], { state: { threedsuccessback: true }, replaceUrl: false });
    }
    else {
      this.router.navigate(['/threed'], { replaceUrl: false });
    }
  }

  refreshPageHeader() {
    this.ngOnInit();
  }

}
