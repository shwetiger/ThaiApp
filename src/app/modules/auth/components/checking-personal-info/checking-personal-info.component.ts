import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { catchError, retry } from 'rxjs/operators';
import { Location } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DeviceUUID, Agent } from 'device-uuid';
import { NavigationService } from 'src/app/shared/service/navigation.service';
import { FunctService } from 'src/app/shared/service/funct.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
declare var $: any;

@Component({
  selector: 'app-checking-personal-info',
  templateUrl: './checking-personal-info.component.html',
  styleUrls: ['./checking-personal-info.component.scss']
})
export class CheckingPersonalInfoComponent implements OnInit {

  OtpSms: any;
  localOtpSms: any;
  prefix = "+95";
  phoneValue: "";
  regularExpressionPhone = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{3,6}$";
  localRegisterCountryCode: any;
  bank_type: any;
  forgetPasswordModalRef: BsModalRef;
  message: any;
  imagePath: any;
  imgURL: any;
  amtPlaceholder: any;
  bankInfoList: any;
  topupAmt: any = "";
  topupDate: any = "";
  topupBank: any = "";
  fileUploadModel: any;
  isHidden = false;
  forgetpassword_unselect: any;
  calendarYear: any = [];
  recaptcha: boolean = false;
  SMSprovider: any;
  SMSoperatorList: any;
  Usefirebase: boolean = false;
  Operatorcodelist: any;
  MPTarraylist: any = ['4', '2', '8', '5'];
  OoredooList: any = ['9'];
  MYTELList: any = ['6'];
  TelenorList: any = ['7'];
  smstype: any;
  functionName: string = 'Forgot Password OTP';
  Timer: any;
  emailaddress: any;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    public navigation: NavigationService,
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
    this.BankInfoListByType();
  }

  ngOnInit(): void {
    this.common.submitLoading = false;
    this.spinner.hide("submitLoading");
    this.storage.clear("changeoptprocess");
    this.storage.clear('formPageType',);
    this.BankInfoListByType();
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    this.fileUploadModel = {
      "phone_no": "",
      "deviceId": "",
      "ipAddress": "",
      "imageUrl": "",
      "bankslipImage64BaseData": ""
    }

    this.imgURL = null;
    this.topupBank = null;
    this.topupAmt = null;
    this.topupDate = null;
    sessionStorage.setItem('bankType', "");
    sessionStorage.setItem('day', "");
    sessionStorage.setItem('month', "");
    sessionStorage.setItem('year', "");
    sessionStorage.setItem("imageUrl", "");
    this.getsmstype();
  }

  ngAfterViewInit() {
    this.initBankTypeSelect();
    this.initGlobalClose();
    this.getForgetDay();
    this.getForgetMonth();
    this.getForgetYear();
  }

  async getBankTypeSelect() {
    await this.BankInfoListByType();
    $(".bank-type-select").attr("placeholder", this.translateService.instant("latest-bank-type"));
    var unselect = this.translateService.instant("forgetpassword-unselect");
    var bankList = this.storage.retrieve('localBankTypeList');
    var bankRequired = this.translateService.instant("forget1");
    if (bankList == null || bankList == undefined) {
      bankList = ["AYA Pay", "CB Pay", "KBZ Pay", "Wave Pay"];
    }
    $(".bank-type-select").each(function () {
      var classes = $(this).attr("class");
      var template = '<div class="' + classes + '">';
      template += '<span class="custom-select-trigger">' + $(this).attr("placeholder") + '</span>';
      template += '<div class="custom-options">';
      template += '<span class="custom-option" data-value="" style="white-space: nowrap">' + unselect + '</span>';
      $.each(bankList, function (key, value) {
        template += '<span class="custom-option" data-value="' + value + '">' + value + '</span>';
      });
      template += '</div></div>';
      $(this).wrap('<div class="custom-select-wrapper"></div>');
      $(this).hide();
      $(this).after(template);
    });
    $(".custom-option:first-of-type").hover(function () {
      $(this).parents(".custom-options").addClass("option-hover");
    }, function () {
      $(this).parents(".custom-options").removeClass("option-hover");
    });
    $(".custom-select-trigger").on("click", function () {
      $('html').one('click', function () {
        $(".custom-select").removeClass("opened");
      });
      $(this).parents(".custom-select").toggleClass("opened");
      event.stopPropagation();
    });
    $(".custom-option").on("click", function () {
      $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
      $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
      $(this).addClass("selection");
      $(this).parents(".custom-select").removeClass("opened");
      $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
      $(this).parents(".custom-select").find(".custom-select-trigger").attr("data-value", $(this).data("value"));
      sessionStorage.setItem('bankType', $(this).data("value"));

      $(document).ready(function () {
        this.topupBank = sessionStorage.getItem('bankType');
        var imgURL = sessionStorage.getItem("imageUrl");
        if (imgURL != null && imgURL != undefined && imgURL != "") {
          if ((this.topupBank == null || this.topupBank == undefined || this.topupBank == '') || (this.topupBank != null || this.topupBank != undefined || this.topupBank != '')) {
            $("#errBankList").html("");
            return true;
          }
        }
        if ((this.topupBank == null || this.topupBank == undefined || this.topupBank == '')) {
          $("#errBankList").html(bankRequired);
          return false;
        }
        else {
          $("#errBankList").html("");
          return true;
        }
      });
    });

  }

  getForgetDay() {
    var unselect = this.translateService.instant("forgetpassword-unselect");
    var dateRequired = this.translateService.instant("forget3");
    var calendar = this.translateService.instant("dd");
    $(document).ready(function () {
      $(".day").attr("placeholder", calendar);
      $(".day").each(function () {
        var classes = $(this).attr("class");
        var template = '<div class="' + classes + '">';
        template += '<span class="custom-select-forget-day-trigger">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        template += '<div class="custom-options-scorll">';
        template += '<span class="custom-option" data-value="" style="white-space: nowrap">' + unselect + '</span>';
        for (let i = 1; i <= 31; i++) {
          if (i < 10) {
            template += '<span class="custom-option" data-value="' + i + '">' + "0" + i + '</span>';
          }
          else {
            template += '<span class="custom-option" data-value="' + i + '">' + i + '</span>';
          }
        }

        template += '</div></div></div>';
        $(this).wrap('<div class="custom-select-wrapper"></div>');
        $(this).hide();
        $(this).after(template);
      });
      $(".custom-option:first-of-type").hover(function () {
        $(this).parents(".custom-options").addClass("option-hover");
      }, function () {
        $(this).parents(".custom-options").removeClass("option-hover");
      });
      $(".custom-select-forget-day-trigger").on("click", function () {
        $(document).ready(function () {
          $(".month").removeClass("opened");
          $(".year").removeClass("opened");
        });
        $('html').one('click', function () {
          $(".custom-select").removeClass("opened");
        });

        $(this).parents(".custom-select").toggleClass("opened");
        event.stopPropagation();
      });
      $(".day .custom-option").on("click", function () {

        $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
        $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
        $(this).addClass("selection");
        $(this).parents(".custom-select").removeClass("opened");
        $(this).parents(".custom-select").find(".custom-select-forget-day-trigger").text($(this).text());
        $(this).parents(".custom-select").find(".custom-select-forget-day-trigger").attr("data-value", $(this).data("value"));
        sessionStorage.setItem("day", $(this).data("value"));
        $.fn.update_day_select_for();
        $(document).ready(function () {
          var day = sessionStorage.getItem("day");
          var month = sessionStorage.getItem("month");
          var year = sessionStorage.getItem("year");
          var imgURL = sessionStorage.getItem("imageUrl");
          if (imgURL != null && imgURL != undefined && imgURL != "") {
            if ((day == '' && month == '' && year == '') || (day != '' && month != '' && year != '')) {
              $("#errDate").html("");
              return true;
            }
          }
          else {
            if ((day == null || day == '' || day == undefined) || (month == null || month == '' || month == undefined) || (year == null || year == '' || year == undefined)) {
              $("#errDate").html(dateRequired);
              return false;
            }
            else {
              $("#errDate").html("");
              this.topupDate = year.toString() + "-" + month.toString() + "-" + day.toString();
              return true;
            }
          }
        });
      });

      $.fn.get_last_day_value_for = function () {
        var last_value_for_day;
        var last_days = [31, 30, 29, 28, 27];
        var i = 0;
        while (i <= 3) {
          last_value_for_day = $('.day .custom-options-scorll').find("span:eq(" + last_days[i] + ")").data("value");
          if (last_value_for_day != undefined) {
            return last_value_for_day = parseInt(last_value_for_day);
          }
          i++;
        }
      }
      $.fn.update_day_select_for = function (day) {
        var last_value_for_day;
        var selected_month;
        var selected_day;
        var selected_year;
        var last_day_of_month;
        var days_to_remove;
        var days_to_add;
        selected_day = sessionStorage.getItem("day");
        selected_month = sessionStorage.getItem("month");
        selected_year = sessionStorage.getItem("year");
        last_value_for_day = $.fn.get_last_day_value_forMonth();
        selected_month = parseInt(selected_month);
        if ($.inArray(selected_month, [4, 6, 9, 11]) != -1) {
          last_day_of_month = 30;
        } else if (selected_month == 2) {
          if (new Date(selected_year, 1, 29).getDate() == 29) {
            last_day_of_month = 29;
          } else {
            last_day_of_month = 28;
          }
        } else {
          last_day_of_month = 31;
        }
        // Remove days
        if (last_value_for_day > last_day_of_month) {
          days_to_remove = last_value_for_day - last_day_of_month;
          var i = 0;
          while (i < days_to_remove) {
            $('.day .custom-options-scorll').find("span:eq(" + (last_value_for_day - i) + ")").remove();
            i++;
          }

          // Add days
        } else if (last_value_for_day < last_day_of_month) {
          days_to_add = last_day_of_month - last_value_for_day;
          var i = 1;
          while (i <= days_to_add) {
            $('.day .custom-options-scorll').append("<span class='custom-option' data-value='" + (last_value_for_day + i) + "'>" + (last_value_for_day + i) + "</span>");
            i++;
          }
        }

        // If selected day is invalid, move to last valid day
        last_value_for_day = $.fn.get_last_day_value_forMonth();
        if (selected_day > last_value_for_day) {
          $('.day .custom-options-scorll').find("span:eq(" + (last_value_for_day - 1) + ")").addClass("selection");
        }
      }
    });
  }

  getForgetMonth() {
    var unselect = this.translateService.instant("forgetpassword-unselect");
    var dateRequired = this.translateService.instant("forget3");
    var calendar = this.translateService.instant("mm");
    $(document).ready(function () {
      $(".month").attr("placeholder", calendar);
      $(".month").each(function () {
        var classes = $(this).attr("class");
        var template = '<div class="' + classes + '">';
        template += '<span class="custom-select-forget-month-trigger">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        template += '<div class="custom-options-scorll">';
        template += '<span class="custom-option" data-value="" style="white-space: nowrap">' + unselect + '</span>';
        for (let i = 1; i <= 12; i++) {
          if (i < 10) {
            template += '<span class="custom-option" data-value="' + i + '">' + "0" + i + '</span>';
          }
          else {
            template += '<span class="custom-option" data-value="' + i + '">' + i + '</span>';
          }
        }

        template += '</div></div></div>';
        $(this).wrap('<div class="custom-select-wrapper"></div>');
        $(this).hide();
        $(this).after(template);
      });
      $(".custom-option:first-of-type").hover(function () {
        $(this).parents(".custom-options").addClass("option-hover");
      }, function () {
        $(this).parents(".custom-options").removeClass("option-hover");
      });
      $(".custom-select-forget-month-trigger").on("click", function () {
        $(document).ready(function () {
          $(".day").removeClass("opened");
          $(".year").removeClass("opened");
        });
        $('html').one('click', function () {
          $(".custom-select").removeClass("opened");
        });
        $(this).parents(".custom-select").toggleClass("opened");
        event.stopPropagation();
      });
      $(".month .custom-option").on("click", function () {

        $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
        $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
        $(this).addClass("selection");
        $(this).parents(".custom-select").removeClass("opened");
        $(this).parents(".custom-select").find(".custom-select-forget-month-trigger").text($(this).text());
        $(this).parents(".custom-select").find(".custom-select-forget-month-trigger").attr("data-value", $(this).data("value"));
        sessionStorage.setItem("month", $(this).data("value"))
        $.fn.update_day_select_forMonth();

        $(document).ready(function () {
          var day = sessionStorage.getItem("day");
          var month = sessionStorage.getItem("month");
          var year = sessionStorage.getItem("year");
          var imgURL = sessionStorage.getItem("imageUrl");
          if (imgURL != null && imgURL != undefined && imgURL != "") {
            if ((day == '' && month == '' && year == '') || (day != '' && month != '' && year != '')) {
              $("#errDate").html("");
              return true;
            }
          }
          else {
            if ((day == null || day == '' || day == undefined) || (month == null || month == '' || month == undefined) || (year == null || year == '' || year == undefined)) {

              $("#errDate").html(dateRequired);
              return false;
            }
            else {
              $("#errDate").html("");
              this.topupDate = year.toString() + "-" + month.toString() + "-" + day.toString();
              return true;
            }
          }

        });
      });
      $.fn.get_last_day_value_forMonth = function () {
        var last_value_for_day;
        var last_days = [31, 30, 29, 28, 27];
        var i = 0;
        while (i <= 3) {
          last_value_for_day = $('.day .custom-options-scorll').find("span:eq(" + last_days[i] + ")").data("value");
          if (last_value_for_day != undefined) {
            return last_value_for_day = parseInt(last_value_for_day);
          }
          i++;
        }
      }
      $.fn.update_day_select_forMonth = function () {
        var last_value_for_day;
        var selected_month;
        var selected_day;
        var selected_year;
        var last_day_of_month;
        var days_to_remove;
        var days_to_add;
        selected_day = sessionStorage.getItem("day");
        selected_month = sessionStorage.getItem("month");
        selected_year = sessionStorage.getItem("year");
        last_value_for_day = $.fn.get_last_day_value_forMonth();
        selected_month = parseInt(selected_month);
        if ($.inArray(selected_month, [4, 6, 9, 11]) != -1) {
          last_day_of_month = 30;
        } else if (selected_month == 2) {
          if (new Date(selected_year, 1, 29).getDate() == 29) {
            last_day_of_month = 29;
          } else {
            last_day_of_month = 28;
          }
        } else {
          last_day_of_month = 31;
        }
        // Remove days
        if (last_value_for_day > last_day_of_month) {
          days_to_remove = last_value_for_day - last_day_of_month;
          var i = 0;
          while (i < days_to_remove) {
            $('.day .custom-options-scorll').find("span:eq(" + (last_value_for_day - i) + ")").remove();
            i++;
          }

          // Add days
        } else if (last_value_for_day < last_day_of_month) {
          days_to_add = last_day_of_month - last_value_for_day;
          var i = 1;
          while (i <= days_to_add) {
            $('.day .custom-options-scorll').append("<span class='custom-option' data-value='" + (last_value_for_day + i) + "'>" + (last_value_for_day + i) + "</span>");
            i++;
          }
        }

        last_value_for_day = $.fn.get_last_day_value_forMonth();
        if (selected_day > last_value_for_day) {
          $('.day .custom-options-scorll').find("span:eq(" + (last_value_for_day - 1) + ")").addClass("selection");
        }
      }
    });
  }


  getForgetYear() {
    var unselect = this.translateService.instant("forgetpassword-unselect");
    var dateRequired = this.translateService.instant("forget3");
    var calendar = this.translateService.instant("yyyy");

    var yearList = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019"];

    $(document).ready(function () {

      $(".year").attr("placeholder", calendar);

      $(".year").each(function () {

        var classes = $(this).attr("class");
        var template = '<div class="' + classes + '">';

        template += '<span class="custom-select-forget-year-trigger">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        template += '<div class="custom-options-scorll">';

        template += '<span class="custom-option" data-value="" style="white-space: nowrap">' + unselect + '</span>';

        for (let i = 0; i < yearList.length; i++) {
          template += '<span class="custom-option" data-value="' + yearList[i] + '">' + yearList[i] + '</span>';
        }

        template += '</div></div></div>';

        $(this).wrap('<div class="custom-select-wrapper"></div>');
        $(this).hide();
        $(this).after(template);
      });

      // Open dropdown
      $(".custom-select-forget-year-trigger").on("click", function (event) {

        $(".day").removeClass("opened");
        $(".month").removeClass("opened");

        $('html').one('click', function () {
          $(".custom-select").removeClass("opened");
        });

        $(this).parents(".custom-select").toggleClass("opened");
        event.stopPropagation();
      });

      // Select option
      $(".year .custom-option").on("click", function () {

        $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
        $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
        $(this).addClass("selection");
        $(this).parents(".custom-select").removeClass("opened");

        $(this).parents(".custom-select").find(".custom-select-forget-year-trigger")
          .text($(this).text())
          .attr("data-value", $(this).data("value"));

        sessionStorage.setItem("year", $(this).data("value"));

        var day = sessionStorage.getItem("day");
        var month = sessionStorage.getItem("month");
        var year = sessionStorage.getItem("year");

        if (!day || !month || !year) {
          $("#errDate").html(dateRequired);
        } else {
          $("#errDate").html("");
        }

      });

    });
  }

  async initBankTypeSelect() {
    await this.BankInfoListByType();

    const placeholder = this.translateService.instant("latest-bank-type");
    const unselect = this.translateService.instant("forgetpassword-unselect");
    const bankRequired = this.translateService.instant("forget1");

    let bankList = this.storage.retrieve('localBankTypeList');
    if (!bankList) {
      bankList = ["AYA Pay", "CB Pay", "KBZ Pay", "Wave Pay"];
    }

    const $select = $(".bank-type-select");

    $select.attr("placeholder", placeholder);

    $select.each(function () {
      const $this = $(this);
      const template = `
      <div class="custom-select bank-select">
        <span class="custom-select-trigger">${placeholder}</span>
        <div class="custom-options">
          <span class="custom-option" data-value="">${unselect}</span>
          ${bankList.map(b => `<span class="custom-option" data-value="${b}">${b}</span>`).join("")}
        </div>
      </div>
    `;

      $this.wrap('<div class="custom-select-wrapper"></div>');
      $this.hide().after(template);
    });

    $(".bank-select .custom-select-trigger").off().on("click", function (e) {
      e.stopPropagation();
      $(".bank-select").removeClass("opened");
      $(this).parent().toggleClass("opened");
    });

    $(".bank-select .custom-option").off().on("click", function () {
      const value = $(this).data("value");

      const $parent = $(this).closest(".bank-select");
      $parent.find(".custom-option").removeClass("selection");
      $(this).addClass("selection");

      $parent.find(".custom-select-trigger").text($(this).text());
      $parent.removeClass("opened");

      sessionStorage.setItem("bankType", value);

      value ? $("#errBankList").html("") : $("#errBankList").html(bankRequired);
    });
  }

 

  initYearSelect() {
    const yearList = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019"];
    const unselect = this.translateService.instant("forgetpassword-unselect");
    const placeholder = this.translateService.instant("yyyy");
    const dateRequired = this.translateService.instant("forget3");

    const $select = $(".year");

    $select.attr("placeholder", placeholder);

    $select.each(function () {
      const template = `
      <div class="custom-select year-select">
        <span class="custom-select-trigger">${placeholder}</span>
        <div class="custom-options">
          <div class="custom-options-scroll">
            <span class="custom-option" data-value="">${unselect}</span>
            ${yearList.map(y => `
              <span class="custom-option" data-value="${y}">${y}</span>
            `).join("")}
          </div>
        </div>
      </div>
    `;

      $(this).wrap('<div class="custom-select-wrapper"></div>');
      $(this).hide().after(template);
    });

    $(".year-select .custom-select-trigger").off().on("click", function (e) {
      e.stopPropagation();
      $(".year-select").removeClass("opened");
      $(this).parent().toggleClass("opened");
    });

    $(".year-select .custom-option").off().on("click", function (e) {
      const value = $(this).data("value");
      const $parent = $(this).closest(".year-select");

      $parent.find(".custom-option").removeClass("selection");
      $(this).addClass("selection");

      $parent.find(".custom-select-trigger").text(value || placeholder);
      $parent.removeClass("opened");

      sessionStorage.setItem("year", value);

      value
        ? $("#errDate").html("")
        : $("#errDate").html(dateRequired);
    });

    $(document).on("click", function () {
      $(".year-select").removeClass("opened");
    });
  }

  initGlobalClose() {
    $("html").off("click").on("click", () => {
      $(".custom-select").removeClass("opened");
    });
  }
  /*XXX*/
  BankInfoListByType() {
    let headers = new HttpHeaders();
    let params = new HttpParams();
    params = params.set("type", 'TOPUP');
    this.http.get(this.funct.ipaddress + 'userforgotpassword/BankInfoListByType', { headers: headers, params: params })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ""))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.bankInfoList = this.dto.Response;
          this.storage.store('localBankTypeList', this.dto.Response);
        });
  }

  checkPhoneNumber() {
    $("#phoneErr").html("");
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    if (this.phoneValue.length == 0) {
      var phoneRequired = this.translateService.instant("requiredFiled");
      phoneRequired = phoneRequired.toString().replace("@value", this.translateService.instant("phoneNumberHint"));
      $("#phoneErr").html(phoneRequired);
      return false;
    }
    let mobNumber = RegExp(this.regularExpressionPhone);
    if (!mobNumber.test(this.phoneValue)) {
      $("#phoneErr").html(this.translateService.instant("phoneInvaild"));
      return false;
    }
    return true;
  }

  checkBankList() {
    this.topupBank = sessionStorage.getItem('bankType');
    this.imgURL = sessionStorage.getItem("imageUrl");
    if ((this.imagePath != null && this.imagePath != '' && this.imagePath !=undefined) &&
      ((this.topupAmt) || (this.topupBank) || (this.topupDate))) {

      this.toastr.error("", this.translateService.instant("forget-choose-question"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });

      return false;
    }
    if (this.imgURL != null && this.imgURL != undefined && this.imgURL != "") {
      if (this.topupBank == '' || this.topupBank != '') {
        if (this.topupBank == '') {
          this.topupBank = null;
        }
        $("#errBankList").html("");
        return true;
      }
    }
    else {
      if ((this.topupBank == null || this.topupBank == undefined || this.topupBank == '')) {
        var bankRequired = this.translateService.instant("forget1");
        $("#errBankList").html(bankRequired);
        return false;
      }
      else {
        $("#errBankList").html("");
        return true;
      }
    }
  }
  checkDate() {
    var day = sessionStorage.getItem("day");
    var month = sessionStorage.getItem("month");
    var year = sessionStorage.getItem("year");
    this.imgURL = sessionStorage.getItem("imageUrl");

    if (this.imgURL != null && this.imgURL != undefined && this.imgURL != "") {
      if ((day == '' && month == '' && year == '') || (day != '' && month != '' && year != '')) {
        if ((day == '' && month == '' && year == '')) {
          this.topupDate = null;

        }
        $("#errDate").html("");
        return true;
      }
    }
    else {
      if ((day == null || day == '' || day == undefined) || (month == null || month == '' || month == undefined) || (year == null || year == '' || year == undefined)) {
        var dateRequired = this.translateService.instant("forget3");
        $("#errDate").html(dateRequired);
        return false;
      }
      else {
        $("#errDate").html("");
        this.topupDate = year.toString() + "-" + month.toString() + "-" + day.toString();
        return true;
      }

    }
  }

  checkAmt() {
    this.imgURL = sessionStorage.getItem("imageUrl");
    if (this.imgURL != null && this.imgURL != undefined && this.imgURL != "") {
      if (this.topupAmt == '' || this.topupAmt != '') {
        if (this.topupAmt == '') {
          this.topupAmt = null;
        }
        $("#errAmt").html("");
        return true;
      }

    }
    if (this.topupAmt == null || this.topupAmt == '' || this.topupAmt == undefined) {
      var topupAmountRequired = this.translateService.instant("forget2");
      $("#errAmt").html(topupAmountRequired);
      return false;
    }
    if (this.topupAmt >= 1000) {
      $("#errAmt").html("")
      return true;
    }
    if (this.topupAmt < 1000) {
      $("#errAmt").html(this.translateService.instant('forget2'));
      return false;
    }
  }

  /*XXXX*/
  preview(files) {
    if (files.length === 0)
      return;
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }
    var reader = new FileReader();
    this.imagePath = files;
    this.isHidden = true;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {

      this.imgURL = reader.result;
      $("#errBankList").html("");
      $("#errDate").html("");
      $("#errAmt").html("");
      sessionStorage.setItem("imageUrl", this.imgURL);
    }
  }


  ForgotPasswordValidation(forgetPassword: TemplateRef<any>, forgetPassword1: TemplateRef<any>) {
    let checkBankList = this.checkBankList();
    let checkAmt = this.checkAmt();
    let checkDate = this.checkDate();
    if (!checkBankList || !checkAmt || !checkDate) {
      return;
    }

    this.common.submitLoading = true;
    this.spinner.show("submitLoading");

    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone) {
      return;
    }
    var phoneNumber;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.startsWith('0')) {
      phoneNumber = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    }
    else {
      phoneNumber = this.prefix + this.phoneValue;
    }
    const forgetPasswordModal = {
      number: phoneNumber,
    };

    let headers = new HttpHeaders();
    let params = new HttpParams();
    this.imgURL = sessionStorage.getItem("imageUrl");
    if ((this.imgURL == null || this.imgURL == undefined || this.imgURL == "") &&
      ((this.topupAmt == null || this.topupAmt == undefined || this.topupAmt == "") ||
        (this.topupBank == null || this.topupBank == undefined || this.topupBank == "") ||
        (this.topupDate == null || this.topupDate == undefined || this.topupDate == ""))) {
      let checkBankList = this.checkBankList();
      let checkAmt = this.checkAmt();
      let checkDate = this.checkDate();
      if (!checkBankList || !checkAmt || !checkDate) {
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
        return;
      }
    }
    if ((this.imgURL != null && this.imgURL != undefined && this.imgURL != "") && ((this.topupAmt != null && this.topupAmt != undefined && this.topupAmt != "") ||
      (this.topupBank != null && this.topupBank != undefined && this.topupBank != "" && this.topupBank != "null") ||
      (this.topupDate != null && this.topupDate != undefined && this.topupDate != "" && this.topupDate != "null"))) {
      setTimeout(() => {
        this.common.submitLoading = false;
        this.spinner.hide("submitLoading");
      }, 1000);
      this.toastr.error("", this.translateService.instant("forget-choose-question"), {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });

      let checkBankList = this.checkBankList();
      let checkAmt = this.checkAmt();
      let checkDate = this.checkDate();
      if (!checkBankList || !checkAmt || !checkDate) {
        return;
      }
      return;
    }
    if ((this.imgURL != null && this.imgURL != undefined && this.imgURL != "") &&
      ((this.topupAmt == null || this.topupAmt == undefined || this.topupAmt == "") ||
        (this.topupBank == null || this.topupBank == undefined || this.topupBank == "" || this.topupAmt == "null") ||
        (this.topupDate == null || this.topupDate == undefined || this.topupDate == "" || this.topupDate == "null"))) {

      this.ForgotPasswordBankSlipCreate();
      return;
    }

    params = params.set("phoneNo", phoneNumber).set("topupAmt", this.topupAmt).set("topupDate", this.datePipe.transform(this.topupDate, "yyyy-MM-dd")).set("topupBank", this.topupBank);
    this.http.get(this.funct.ipaddress + 'userforgotpassword/ForgotPasswordValidation', { headers: headers, params: params })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ""))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          setTimeout(() => {
            this.common.submitLoading = false;
            this.spinner.hide("submitLoading");
          }, 1000);
          switch (this.dto.Response.validestatus) {
            case 0:
              switch (this.dto.Response.attempcount) {
                case 3:
                  this.forgetPasswordModalRef = this.modalService.show(forgetPassword1, {
                    initialState: forgetPasswordModal,
                    class: "forgetPassword-class modal-sm"
                  });
                  break;
                case 2:
                  this.forgetPasswordModalRef = this.modalService.show(forgetPassword, {
                    initialState: forgetPasswordModal,
                    class: "forgetPassword-class modal-sm"
                  });
                  break;
                case 1:
                  this.forgetPasswordModalRef = this.modalService.show(forgetPassword, {
                    initialState: forgetPasswordModal,
                    class: "forgetPassword-class modal-sm"
                  });
                  break;
                default:
                  this.forgetPasswordModalRef = this.modalService.show(forgetPassword1, {
                    initialState: forgetPasswordModal,
                    class: "forgetPassword-class modal-sm"
                  });
                  break;
              }
              break;
            default:
              this.submit();
              break;
          }
        });
  }

  forgetPasswordModal(forgetPassword: TemplateRef<any>) {
    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone) {
      return;
    }
    var phoneNumber;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.startsWith('0')) {
      phoneNumber = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    }
    else {
      phoneNumber = this.prefix + this.phoneValue;
    }

    const forgetPasswordModal = {
      number: phoneNumber,
    };
    this.forgetPasswordModalRef = this.modalService.show(forgetPassword, {
      initialState: forgetPasswordModal,
      class: "forgetPassword-class modal-sm"
    });
  }
  HideAlertOne() {
    this.forgetPasswordModalRef.hide();
  }
  HideAlert() {
    this.forgetPasswordModalRef.hide();
    this.navigation.goBack();
    this.navigation.goBack();
  }

  async getCountDown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.storage.clear('Timer');
      const phoneNumber = this.preparePhoneNumber();
      let headers = new HttpHeaders();
      this.http.post(
        this.funct.ipaddress +
        'countdown/get?phoneno=' + phoneNumber +
        '&email=' + this.emailaddress +
        '&type=' + this.smstype +
        '&functionName=' + this.functionName,
        {},
        { headers: headers }
      )
        .pipe(catchError(this.handleErrorMessage.handleError.bind(this, "")))
        .subscribe({
          next: (result: any) => {
            this.dto.Response = result;
            if (this.dto.Response.status === 'Success') {
              const data = this.dto.Response.data;
              this.Timer = data.remainingSeconds;
              this.storage.store('Timer', this.Timer);
            }

            resolve();
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

  submit() {
    this.storage.store("otptype", 'smsotp');
    if (!this.checkPhoneNumber()) {
      return;
    }
    const phoneNumber = this.preparePhoneNumber();
    this.http.get(
      `${this.funct.ipaddress}v1/user/getForgotPassowrdOTP?phoneNo=${phoneNumber}`
    )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ""))
      )
      .subscribe(result => this.handleForgetOtpResponse(result));
  }

  private preparePhoneNumber(): string {
    const prefix = this.storage.retrieve('localPhonePrefix');

    if (this.phoneValue.startsWith('0')) {
      return prefix + this.phoneValue.substring(1);
    }
    return prefix + this.phoneValue;
  }

  private async handleForgetOtpResponse(result: any) {
    this.dto.Response = result;
    if (this.dto.Response.status === true) {
      this.handleSuccessOtp();
    }
    if (this.dto.Response.status === 'Error') {
      if (this.dto.Response.message?.includes('180 seconds')) {
        await this.getCountDown();
        this.storage.store("formPageType", 'forgetPassword');
        this.router.navigate(['/login/otp'], { replaceUrl: true });
        return;
      }

      if (this.dto.Response.message?.includes('60 seconds')) {
        this.toastr.error(
          "",
          this.translateService.instant("otp-request-time-onemin"),
          {
            timeOut: 3000,
            positionClass: 'toast-top-center',
          }
        );
        return;
      }
      return;
    }
    if (this.dto.Response.status !== true) {
      return;
    }
  }

  private async handleSuccessOtp() {
    this.storage.clear('registeropttype');
    this.storage.clear('actionType');
    this.storage.store('localOtpSms', this.dto.Response);
    this.appendRequestId(this.dto.Response.request_id);
    sessionStorage.setItem('rootUrl', "/home");
    this.storage.store("formPageType", 'forgetPassword');
    this.storage.store('localForgetPasswordSuccess', 'success');
    await this.getCountDown();
    this.router.navigate(['/login/otp'], { replaceUrl: true });
  }

  private appendRequestId(requestId: string) {
    if (!requestId) return;

    let requestIdList = this.storage.retrieve('requestId');
    requestIdList = requestIdList
      ? `${requestIdList},${requestId}`
      : requestId;

    this.storage.store('requestId', requestIdList);
  }

  ForgotPasswordBankSlipCreate() {
    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone) {
      return;
    }
    var phoneNumber;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.startsWith('0')) {
      phoneNumber = this.prefix + this.phoneValue.substring(1, this.phoneValue.length);
    }
    else {
      phoneNumber = this.prefix + this.phoneValue;
    }
    const forgetPasswordModal = {
      number: phoneNumber,
    };
    if (this.imgURL != undefined) {
      if (this.imgURL.includes('data:image/jpeg;base64,'))
        this.fileUploadModel.bankslipImage64BaseData = this.imgURL.replace("data:image/jpeg;base64,", "");
      if (this.imgURL.includes('data:image/png;base64,'))
        this.fileUploadModel.bankslipImage64BaseData = this.imgURL.replace("data:image/png;base64,", "");
      if (this.imgURL.includes('data:image/gif;base64,'))
        this.fileUploadModel.bankslipImage64BaseData = this.imgURL.replace("data:image/jpg;base64,", "");
    }
    this.fileUploadModel.phone_no = phoneNumber;
    this.fileUploadModel.deviceId = new DeviceUUID().get();
    this.fileUploadModel.ipAddress = "";
    this.fileUploadModel.imageUrl = this.fileUploadModel.bankslipImage64BaseData;
    this.http.post(this.funct.ipaddress + 'userforgotpassword/ForgotPasswordBankSlipCreate', this.fileUploadModel)
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ""))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.common.submitLoading = false;
          this.spinner.hide("submitLoading");
          if (this.dto.Response.status == 'Success') {
            this.storage.store('localBankSlipWaiting', 'success')
            this.router.navigate(['/login/waiting'], { replaceUrl: false });
          }
        }
      );
  }

  removeFns() {
    sessionStorage.setItem("imageUrl", "");
    this.imagePath = "";
    this.imgURL = null;
    this.isHidden = false;
    this.checkBankList();
    this.checkAmt();
    this.checkDate();
  }

  goCustomerServicePage() {
    this.forgetPasswordModalRef.hide();
    sessionStorage.setItem('rootUrl', "service-phone");
    this.navigation.goBack();

  }

  enter(event) {
    event.target.blur();
  }

  getsmstype() {
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + this.phoneValue, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.emailaddress = this.dto.Response.email;
          this.smstype = this.dto.Response.smstype;
        });
  }

  onAmountInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let currentValue = inputElement.value;
    currentValue = currentValue.replace('.', '');
    inputElement.value = currentValue;
  }
}
