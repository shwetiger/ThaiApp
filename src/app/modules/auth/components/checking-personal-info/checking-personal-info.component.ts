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
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
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
  //loadingSubmiting : any;
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
    private location: Location,
    private afAuth: AngularFireAuth,) {

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
    this.getBankTypeSelect();
    this.getForgetDay();
    this.getForgetMonth();
    this.getForgetYear();
    sessionStorage.setItem('bankType', "");
    sessionStorage.setItem('day', "");
    sessionStorage.setItem('month', "");
    sessionStorage.setItem('year', "");
    sessionStorage.setItem("imageUrl", "");
    this.getSMSOperators();
    this.GetSMSProvider();
    this.getsmstype();
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

        // If selected day is invalid, move to last valid day
        last_value_for_day = $.fn.get_last_day_value_forMonth();
        if (selected_day > last_value_for_day) {
          $('.day .custom-options-scorll').find("span:eq(" + (last_value_for_day - 1) + ")").addClass("selection");
        }
      }
    });
  }
  getForgetYear() {
    this.calendarYear = ["2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];
    var yearlist = this.calendarYear;
    var unselect = this.translateService.instant("forgetpassword-unselect");
    var dateRequired = this.translateService.instant("forget3");
    var calendar = this.translateService.instant("yyyy");
    $(document).ready(function () {
      $(".year").attr("placeholder", calendar);
      $(".year").each(function () {
        var classes = $(this).attr("class");
        var template = '<div class="' + classes + '">';
        template += '<span class="custom-select-forget-year-trigger">' + $(this).attr("placeholder") + '</span>';
        template += '<div class="custom-options">';
        template += '<div class="custom-options-scorll">';
        template += '<span class="custom-option" data-value="" style="white-space: nowrap">' + unselect + '</span>';
        for (let i = 0; i < yearlist.length; i++) {
          template += '<span class="custom-option" data-value="' + yearlist[i] + '">' + yearlist[i] + '</span>';
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
      $(".custom-select-forget-year-trigger").on("click", function () {
        $(document).ready(function () {
          $(".day").removeClass("opened");
          $(".month").removeClass("opened");
        });
        $('html').one('click', function () {
          $(".custom-select").removeClass("opened");
        });
        $(this).parents(".custom-select").toggleClass("opened");
        event.stopPropagation();
      });
      $(".year .custom-option").on("click", function () {
        $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
        $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
        $(this).addClass("selection");
        $(this).parents(".custom-select").removeClass("opened");
        $(this).parents(".custom-select").find(".custom-select-forget-year-trigger").text($(this).text());
        $(this).parents(".custom-select").find(".custom-select-forget-year-trigger").attr("data-value", $(this).data("value"));
        sessionStorage.setItem("year", $(this).data("value"));
        $.fn.update_day_select_forYear();
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

      $.fn.get_last_day_value_forYear = function () {
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
      $.fn.update_day_select_forYear = function () {
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
        last_value_for_day = $.fn.get_last_day_value_forYear();
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
        last_value_for_day = $.fn.get_last_day_value_forYear();
        if (selected_day > last_value_for_day) {
          $('.day .custom-options-scorll').find("span:eq(" + (last_value_for_day - 1) + ")").addClass("selection");
        }
      }
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
              //if(this.SMSprovider == 'firebase' && this.Usefirebase == true)
              if (this.Usefirebase == true && this.smstype == 'sms_poh') {
                this.signInWithPhoneNumber();
              }
              else {
                this.submit();
              }

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

  submit() {
    this.storage.store("otptype", 'smsotp')
    let checkPhone = this.checkPhoneNumber();
    if (!checkPhone) {
      return;
    }
    let phoneNumber = this.prefix + this.phoneValue;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(
        1, this.phoneValue.length);
    }
    else {
      phoneNumber = this.prefix + this.phoneValue;
    }
    let headers = new HttpHeaders();
    this.OtpSms = [];
    this.OtpSms = this.storage.retrieve('localOtpSms');
    this.http.get(this.funct.ipaddress + 'user/getForgotPassowrdOTP?phoneNo=' + phoneNumber, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ""))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          if (this.dto.Response.status === true) {
            this.storage.store('localOtpSms', this.dto.Response);
            this.storage.clear('registeropttype');
            this.storage.clear('actionType');
            this.storage.clear('Timer');
            this.OtpSms = this.storage.retrieve('localOtpSms'); /*Old =/forget-password */
            sessionStorage.setItem('rootUrl', "/home");
            this.storage.store("formPageType", 'forgetPassword');
            this.router.navigate(['/login/otp'], { state: { formPage: "forgetPassword", otptype: 'smsotp' }, replaceUrl: true });
            this.storage.store('localForgetPasswordSuccess', 'success');
            if (this.dto.Response.statusCode == 200) {
              if (this.dto.Response.body.split('').trim() == "Not valid OTP code") {
                this.toastr.error("Bad request.", 'OTP is not correct', {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                return null;
              }
              if (this.dto.Response.body.split('').trim() == "Try Again") {
                this.toastr.error("Bad request.", this.dto.Response.body.toString(), {
                  timeOut: 3000,
                  positionClass: 'toast-top-center',
                });
                return null;
              }
              return this.OtpSms;
            }
          }
          else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('180 seconds')) {
            this.storage.store("formPageType", 'forgetPassword');
            this.router.navigate(['/login/otp'], { state: { formPage: "forgetPassword", otptype: 'smsotp' }, replaceUrl: true });
          }
          else if (this.dto.Response.status === 'Error' && this.dto.Response.message?.includes('60 seconds')) {
            this.toastr.error("", this.translateService.instant("otp-request-time-onemin"), {
              timeOut: 3000,
              positionClass: 'toast-top-center',
            });
            this.storage.clear('Timer');
            return null;
          }
        }
      );
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
  removeFns() /*Remove preview*/ {
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

  signInWithPhoneNumber() {
    this.storage.clear('Timer');
    this.recaptcha = true;
    let phCheck = this.checkPhoneNumber();
    if (phCheck == false) {
      return;
    }
    this.phoneValue = this.storage.retrieve('localPhoneValue');

    let phoneNumber;
    if (this.phoneValue.startsWith("0")) {
      phoneNumber = this.prefix + this.phoneValue.substring(
        1, this.phoneValue.length);
    }
    if (!this.phoneValue.startsWith("0")) //XXXX 
    {
      phoneNumber = this.prefix + this.phoneValue;
    }

    // const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container'); // Make sure you have an element with id 'recaptcha-container'
    const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
      }
    })
    this.afAuth.signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(confirmationResult => {
        this.storage.store('verificationCode', confirmationResult.verificationId);
        this.storage.store("otptype", 'firebaseotp');
        this.storage.store("formPage", 'forgetPassword');
        this.storage.clear('Timer');
        this.router.navigate(['/login/otp'], { state: { formPage: "forgetPassword", otptype: 'firebaseotp' }, replaceUrl: true });
        this.storage.store('localForgetPasswordSuccess', 'success');
      })
      .catch(error => {

        this.recaptcha = false;
        this.toastr.error("", error.message,
          {
            timeOut: 2000,
            positionClass: 'toast-bottom-center',
          });
        console.error('Phone authentication error', error.message);
      });
  }
  GetSMSProvider() {
    this.http.get(this.funct.ipaddress + 'user/getSMSProvider')
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ""))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;
          this.SMSprovider = this.dto.Response.message;

        });

  }

  getSMSOperators() {
    this.phoneValue = this.storage.retrieve('localPhoneValue');
    var phoneno = this.phoneValue.substring(2, this.phoneValue.length);
    this.http.get(this.funct.ipaddress + 'user/getSMSOperators')
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ""))
      )
      .subscribe(
        result => {
          this.dto.Response = {};
          this.dto.Response = result;

          this.SMSoperatorList = this.dto.Response;
          if (this.SMSoperatorList != undefined || this.SMSoperatorList != null || this.SMSoperatorList != "") {

            for (let i = 0; i < this.SMSoperatorList.length; i++) {
              if (this.SMSoperatorList[i].operatorType == "MPT") {
                for (let i = 0; i < this.MPTarraylist.length; i++)
                  if (phoneno.startsWith(this.MPTarraylist[i])) {
                    this.Usefirebase = true;
                  }

              }
              else if (this.SMSoperatorList[i].operatorType == "Ooredoo") {
                for (let i = 0; i < this.OoredooList.length; i++)
                  if (phoneno.startsWith(this.OoredooList[i])) {
                    this.Usefirebase = true;
                  }

              }
              else if (this.SMSoperatorList[i].operatorType == "MYTEL") {
                for (let i = 0; i < this.MYTELList.length; i++)
                  if (phoneno.startsWith(this.MYTELList[i])) {
                    this.Usefirebase = true;
                  }

              }
              else if (this.SMSoperatorList[i].operatorType == "Telenor") {
                for (let i = 0; i < this.TelenorList.length; i++)
                  if (phoneno.startsWith(this.TelenorList[i])) {
                    this.Usefirebase = true;
                  }
              }
            }
          }
          else {
            return;
          }
        });
  }

  getsmstype() {
    // this.token = this.storage.retrieve('token');
    let headers = new HttpHeaders();
    this.http.get(this.funct.ipaddress + 'user/userSmsType?phone_no=' + this.phoneValue, { headers: headers })
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.smstype = this.dto.Response.smstype;
        });
  }
}
