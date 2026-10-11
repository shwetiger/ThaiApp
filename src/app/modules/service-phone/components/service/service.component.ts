import { Component, OnInit,OnDestroy, Pipe, PipeTransform, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { LocalStorageService } from 'ngx-webstorage';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import isUAWebview from "is-ua-webview";
import { HandleErrorMessageService } from 'src/app/shared/service/handle-error-message.service';
import { CommonService } from 'src/app/shared/service/common.service';
import { DtoService } from 'src/app/shared/service/dto.service';
import { FunctService } from 'src/app/shared/service/funct.service';
declare var Tawk_API: any;
declare var window: any;


@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
  servicePhoneList: any;
  localservicePhoneList: any;
  service_transaction: any;
  service_error: any;
  customer_service: any;
  deviceId: any;
  openUrl: any;
  isWebview: any;
  showBackButton: any;
  isWebviewforPh: boolean;
  phnumber: any;
  token: any;
  prefix = '+95';
  private tawkTimeout: any;
  private isDestroyed = false;

  constructor(
    private handleErrorMessage: HandleErrorMessageService,
    public common: CommonService,
    private Location: LocationStrategy,
    private translateService: TranslateService,
    private dto: DtoService,
    private funct: FunctService,
    private http: HttpClient,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private storage: LocalStorageService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isWebviewforPh = /(wv|Android.*Version\/[0-9].*Chrome\/[0-9].*Mobile Safari\/[0-9].*)/.test(navigator.userAgent)
      || !!window['cordova']
      || window.matchMedia('(display-mode: standalone)').matches;
    this.showBackButton = 1;
    this.deviceId = this.storage.retrieve('localDeviceId');
    this.isWebview = isUAWebview(navigator.userAgent)
    if (navigator.userAgent.indexOf("Mi") != -1 && this.isWebview) {
      this.openUrl = "";
    }
    if (this.deviceId != null || this.isWebview) {
      this.openUrl = "?openinnewtap=1";
    }
    else {
      this.openUrl = "";
    }
  }

  // ngOnInit(): void {
  //   this.phnumber = this.storage.retrieve('localPhoneValue');
  //   this.loadTawk(this.phnumber);
  //   this.service_transaction = 0;
  //   this.service_error = 0;
  //   this.customer_service = 0;
  //   this.listServicePhone();
  //   this.servicePhoneList = this.storage.retrieve('localservicePhoneList');

  // }

  ngOnInit(): void {
    this.isDestroyed = false;
    this.prefix = this.storage.retrieve('localPhonePrefix');
    this.phnumber = this.storage.retrieve('localPhoneValue');
    let phoneValue = this.storage.retrieve('localPhoneValue');
    let phoneNumber = '';

    if (window.Telegram?.WebApp.initData) {
      phoneNumber = this.storage.retrieve('tglocalphone');
    } else {
      phoneNumber = this.formatPhoneNumber(phoneValue, this.prefix);
    }
    this.loadTawk(phoneNumber);

    this.service_transaction = 0;
    this.service_error = 0;
    this.customer_service = 0;

    this.listServicePhone();
    this.servicePhoneList = this.storage.retrieve('localservicePhoneList');
  }

  private formatPhoneNumber(phone: string, prefix: string): string {
    if (!phone) return '';
    return phone.startsWith(prefix)
      ? phone
      : prefix + (phone.startsWith('0') ? phone.slice(1) : phone);
  }


  // ngOnDestroy(): void {
  //   this.isDestroyed = true;

  //   if (this.tawkTimeout) {
  //     clearTimeout(this.tawkTimeout);
  //     this.tawkTimeout = null;
  //   }

  //   const tawk = (window as any).Tawk_API;

  //   if (tawk && typeof tawk.hideWidget === 'function') {
  //     setTimeout(() => {
  //       try {
  //         tawk.hideWidget();
  //       } catch (e) {
  //         console.error('Tawk error:', e);
  //       }
  //     }, 100);
  //   }
  // }

  ngOnDestroy(): void {
  this.isDestroyed = true;

  if (this.tawkTimeout) {
    clearTimeout(this.tawkTimeout);
    this.tawkTimeout = null;
  }

  const tawk = (window as any).Tawk_API;

  try {
    if (tawk && typeof tawk.hideWidget === 'function') {
      tawk.hideWidget();
    }

    // Optional: remove widget visibility state
    console.log('Service phone page destroyed: hiding Tawk widget');
  } catch (error) {
    console.error('Tawk hideWidget error:', error);
  }
}



  // loadTawk(phoneno: string): void {
  //   this.common.refreshLoading = true;

  //   const finishLoading = () => {
  //     if (this.isDestroyed) {
  //       return;
  //     }

  //     this.common.refreshLoading = false;
  //     this.cdr.detectChanges();
  //   };

  //   const setupTawk = () => {
  //     if (this.isDestroyed) {
  //       return;
  //     }

  //     const tawkApi = (window as any).Tawk_API;

  //     if (!tawkApi) {
  //       finishLoading();
  //       return;
  //     }

  //     try {
  //       // Wait until Tawk is fully ready
  //       if (typeof tawkApi.onLoad === 'function') {
  //         tawkApi.onLoad = () => {
  //           if (this.isDestroyed) {
  //             return;
  //           }

  //           tawkApi.showWidget();

  //           tawkApi.setAttributes(
  //             {
  //               name: phoneno,
  //               phone: phoneno
  //             },
  //             (error: any) => {
  //               if (error) {
  //                 console.error('Tawk setAttributes error:', error);
  //               } else {
  //                // console.log('Tawk attributes updated:', phoneno);
  //               }

  //               finishLoading();
  //             }
  //           );
  //         };
  //       } else {
  //         tawkApi.showWidget();

  //         tawkApi.setAttributes(
  //           {
  //             name: phoneno,
  //             phone: phoneno
  //           },
  //           (error: any) => {
  //             if (error) {
  //               console.error('Tawk setAttributes error:', error);
  //             }

  //             finishLoading();
  //           }
  //         );
  //       }

  //     } catch (error) {
  //       console.error('Tawk error:', error);
  //       finishLoading();
  //     }
  //   };

  //   // Already loaded
  //   if ((window as any).Tawk_API) {
  //     setupTawk();
  //     return;
  //   }

  //   // Initialize API object BEFORE loading script
  //   (window as any).Tawk_API = (window as any).Tawk_API || {};

  //   const existingScript = document.querySelector(
  //     'script[src*="embed.tawk.to"]'
  //   ) as HTMLScriptElement | null;

  //   if (existingScript) {
  //     existingScript.addEventListener('load', setupTawk);
  //     existingScript.addEventListener('error', () => {
  //       finishLoading();
  //     });

  //     return;
  //   }

  //   const script = document.createElement('script');

  //   script.async = true;
  //   script.src =
  //     'https://embed.tawk.to/6a3f7d9bedc6bb1d4b5d0a93/1js405a6q';//testing
  //    // 'https://embed.tawk.to/6a3fb078eafe991d4bfa009f/1js4cim9n';//prod

  //   script.onload = () => {
  //     setupTawk();
  //   };

  //   script.onerror = (error) => {
  //     console.error('Tawk script loading failed:', error);
  //     finishLoading();
  //   };

  //   document.body.appendChild(script);

  //   this.tawkTimeout = setTimeout(() => {
  //     if (!this.isDestroyed) {
  //       finishLoading();
  //     }
  //   }, 5000);
  // }

  loadTawk(phoneNo: string): void {
    this.common.refreshLoading = true;
    this.token = this.storage.retrieve('token');
    const headers = new HttpHeaders({
      Authorization: this.token
    });
    // 1. Get Tawk hash from backend first
    this.http
      .get(
        this.funct.ipaddress + 'user/tawktohash',
        {
          headers
        }
      ).subscribe({
        next: (response: any) => {
          if (this.isDestroyed) {
            return;
          }
          console.log(JSON.stringify(response));
          const hash = response?.hash;
          const phone = response?.phoneNo;
          const userid = response?.userId;
          const name=response?.name;



          if (!hash) {
            console.error('Tawk hash not found:', response);
            this.finishTawkLoading();
            return;
          }

          // 2. Load Tawk
          this.initTawk(phone, hash, userid,name);
        },

        error: (error) => {
          console.error('Tawk hash API error:', error);
          this.finishTawkLoading();
        }
      });
  }


 private initTawk(
  phoneNo: string,
  hash: string,
  userid: string,
  name: string
): void {
  const w = window as any;

  if (this.isDestroyed) {
    return;
  }

  // Initialize Tawk API before loading the script
  w.Tawk_API = w.Tawk_API || {};

  const tawkApi = w.Tawk_API;

  // Normalize phone number.
  // Input should already be in E.164 format, e.g. +959123456789
  const phone = String(phoneNo || '').trim();

  if (!userid || !hash) {
    console.error('Tawk login requires userId and hash');
    this.finishTawkLoading();
    return;
  }

  if (phone && !/^\+[1-9]\d{1,14}$/.test(phone)) {
    console.error(
      'Invalid phone format. Use E.164 format, e.g. +959123456789'
    );
    this.finishTawkLoading();
    return;
  }

  let loginStarted = false;

  const loginTawk = (): void => {
    if (this.isDestroyed || loginStarted) {
      return;
    }

    if (typeof tawkApi.login !== 'function') {
      console.error('Tawk login API is not ready');
      this.finishTawkLoading();
      return;
    }

    loginStarted = true;

    try {
      tawkApi.login(
        {
          userId: String(userid).trim(),
          hash: String(hash).trim(),
          name: String(phone || '').trim(),
          phone: phone
        },
        (error: any) => {
          if (this.isDestroyed) {
            return;
          }

          if (error) {
            console.error('Tawk login error:', error);
            this.finishTawkLoading();
            return;
          }

          console.log('Tawk login successful');

          // Phone is already passed through login().
          // No additional setAttributes() call is needed.

          if (typeof tawkApi.showWidget === 'function') {
            tawkApi.showWidget();
          }

          this.finishTawkLoading();
        }
      );
    } catch (error) {
      console.error('Tawk login error:', error);
      this.finishTawkLoading();
    }
  };

  // If Tawk is already initialized, login directly.
  if (typeof tawkApi.login === 'function') {
    loginTawk();
    return;
  }

  // Register onLoad before loading the script.
  tawkApi.onLoad = () => {
    console.log('Tawk widget loaded');
    loginTawk();
  };

  const existingScript = document.querySelector(
    'script[src*="embed.tawk.to"]'
  ) as HTMLScriptElement | null;

  if (existingScript) {
    // Avoid calling login twice.
    // The registered Tawk onLoad callback handles login.
    existingScript.addEventListener(
      'error',
      () => {
        console.error('Tawk script loading failed');
        this.finishTawkLoading();
      },
      { once: true }
    );

    return;
  }

  const script = document.createElement('script');

  script.async = true;
  script.src =
    'https://embed.tawk.to/6a3f7d9bedc6bb1d4b5d0a93/1js405a6q';

  script.onerror = (error) => {
    console.error('Tawk script loading failed:', error);
    this.finishTawkLoading();
  };

  document.body.appendChild(script);
}


  private finishTawkLoading(): void {
    if (this.isDestroyed) {
      return;
    }

    this.common.refreshLoading = false;
    this.cdr.detectChanges();
  }


  listServicePhone() {
    this.service_transaction = 0;
    this.service_error = 0;
    this.customer_service = 0;

    let headers = new HttpHeaders();

    this.servicePhoneList = [];
    this.servicePhoneList = this.storage.retrieve('localservicePhoneList');

    if (this.servicePhoneList != null) {
      for (let i = 0; i < this.servicePhoneList.length; i++) {
        if (this.servicePhoneList[i].title == 'service_transaction') {
          ++this.service_transaction;
        }

        if (this.servicePhoneList[i].title == 'service_error') {
          ++this.service_error;
        }

        if (this.servicePhoneList[i].title == 'customer_service') {
          ++this.customer_service;
        }
      }
    }

    this.http.get(
      this.funct.ipaddress + 'service/listService?status=active',
      { headers: headers }
    )
      .pipe(
        catchError(this.handleErrorMessage.handleError.bind(this, ''))
      )
      .subscribe(
        result => {
          this.dto.Response = result;
          this.servicePhoneList = this.dto.Response;

          this.service_transaction = 0;
          this.service_error = 0;
          this.customer_service = 0;

          for (let i = 0; i < this.servicePhoneList.length; i++) {
            if (this.servicePhoneList[i].title == 'service_transaction') {
              ++this.service_transaction;
            }

            if (this.servicePhoneList[i].title == 'service_error') {
              ++this.service_error;
            }

            if (this.servicePhoneList[i].title == 'customer_service') {
              ++this.customer_service;
            }
          }

          this.storage.store(
            'localservicePhoneList',
            this.servicePhoneList
          );

        },
        error => {

        }
      );
  }



  openViberFallback(viber: any) {
    // Viber official fallback link
    window.location.href = "https://invite.viber.com/?g2=" + viber;
  }


}
