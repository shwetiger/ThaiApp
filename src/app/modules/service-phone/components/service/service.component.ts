import { Component, OnInit, OnDestroy, Pipe, PipeTransform, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
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
          };
          const hash = response?.hash;
          const phone = response?.phoneNo;
          const userid = response?.userId;
          const name = response?.name;



          if (!hash) {
            console.error('Tawk hash not found:', response);
            this.finishTawkLoading();
            return;
          }

          // 2. Load Tawk
          this.initTawk(phone, hash, userid, name);
        },

        error: (error) => {
          console.error('Tawk hash API error:', error);
          this.finishTawkLoading();
        }
      });
  }



  // private initTawk(
  //   phoneNo: string,
  //   hash: string,
  //   userid: string,
  //   name: string
  // ): void {
  //   const w = window as any;

  //   if (this.isDestroyed) {
  //     return;
  //   }

  //   // Initialize Tawk API
  //   w.Tawk_API = w.Tawk_API || {};
  //   const tawkApi = w.Tawk_API;

  //   // Normalize input values
  //   const phone = String(phoneNo || '').trim();
  //   const userId = String(userid || '').trim();
  //   const secureHash = String(hash || '').trim();
  //   const visitorName = String(name || '').trim();
  //   const displayName = phone || visitorName;

  //   // Validate required values
  //   if (!userId || !secureHash) {
  //     console.error('Tawk login requires userId and hash');
  //     this.finishTawkLoading();
  //     return;
  //   }

  //   // Validate E.164 phone format
  //   if (phone && !/^\+[1-9]\d{1,14}$/.test(phone)) {
  //     console.error(
  //       'Invalid phone format. Expected: +959123456789'
  //     );
  //     this.finishTawkLoading();
  //     return;
  //   }

  //   let loginStarted = false;
  //   let finished = false;

  //   const finish = (): void => {
  //     if (finished) {
  //       return;
  //     }

  //     finished = true;
  //     this.finishTawkLoading();
  //   };

  //   const loginTawk = (): void => {
  //     if (this.isDestroyed || loginStarted) {
  //       return;
  //     }

  //     if (typeof tawkApi.login !== 'function') {
  //       console.error('Tawk login API is not ready');
  //       finish();
  //       return;
  //     }

  //     loginStarted = true;

  //     // Prepare authenticated visitor data
  //     const loginData: any = {
  //       userId: userId,
  //       hash: secureHash,
  //       name: displayName
  //     };

  //     // Pass phone directly through login data
  //     if (phone) {
  //       loginData.phone = phone;
  //     }

  //     try {

  //       console.log('Tawk login payload:', {
  //         userId,
  //         name: displayName,
  //         phone: phone,
  //         hashExists: !!secureHash
  //       });
  //       tawkApi.login(loginData, (error: any) => {
  //         if (this.isDestroyed) {
  //           finish();
  //           return;
  //         }

  //         if (error) {
  //           console.error('Tawk login error:', error);
  //           finish();
  //           return;
  //         }

  //         console.log('Tawk login successful for:', userId);

  //         // Show widget after successful login
  //         if (typeof tawkApi.showWidget === 'function') {
  //           tawkApi.showWidget();
  //         }

  //         finish();
  //       });
  //     } catch (error) {
  //       console.error('Tawk login exception:', error);
  //       finish();
  //     }
  //   };

  //   // Reuse an already initialized Tawk API
  //   if (typeof tawkApi.login === 'function') {

  //     loginTawk();
  //     return;
  //   }

  //   // Check whether the widget script already exists
  //   const existingScript = document.querySelector(
  //     'script[src*="embed.tawk.to"]'
  //   ) as HTMLScriptElement | null;

  //   if (existingScript) {
  //     const previousOnLoad = tawkApi.onLoad;

  //     tawkApi.onLoad = (): void => {
  //       if (typeof previousOnLoad === 'function') {
  //         try {
  //           previousOnLoad();
  //         } catch (error) {
  //           console.error(
  //             'Previous Tawk onLoad error:',
  //             error
  //           );
  //         }
  //       }

  //       loginTawk();
  //     };

  //     return;
  //   }

  //   // Register callback before loading the widget
  //   tawkApi.onLoad = (): void => {
  //     loginTawk();
  //   };

  //   // Load Tawk script once
  //   const script = document.createElement('script');

  //   script.async = true;

  //   // Testing widget
  //   script.src =
  //     'https://embed.tawk.to/6a3f7d9bedc6bb1d4b5d0a93/1js405a6q';//testing

  //   // Production widget, if needed:
  //   // script.src =
  //   //  'https://embed.tawk.to/6a3fb078eafe991d4bfa009f/1js4cim9n';//prod

  //   script.onerror = (error: Event): void => {
  //     console.error('Tawk script loading failed:', error);
  //     finish();
  //   };

  //   document.body.appendChild(script);
  // }


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

  const phone = String(phoneNo || '').trim();
  const userId = String(userid || '').trim();
  const secureHash = String(hash || '').trim();
  const visitorName = String(name || '').trim();

  // Use phone as the displayed name when available.
  const displayName = phone || visitorName;

  if (!userId || !secureHash) {
    console.error('Tawk login requires userId and hash');
    this.finishTawkLoading();
    return;
  }

  // Validate phone number using E.164 format.
  if (phone && !/^\+[1-9]\d{1,14}$/.test(phone)) {
    console.error(
      'Invalid phone format. Expected: +959123456789'
    );
    this.finishTawkLoading();
    return;
  }

  // Reuse the existing Tawk API.
  w.Tawk_API = w.Tawk_API || {};
  const tawkApi = w.Tawk_API;

  let loginStarted = false;
  let finished = false;
  let loadHandlerRegistered = false;

  const finish = (): void => {
    if (finished) {
      return;
    }

    finished = true;
    this.finishTawkLoading();
  };

  const loginTawk = (): void => {
    if (this.isDestroyed || loginStarted || finished) {
      return;
    }

    if (typeof tawkApi.login !== 'function') {
      console.error('Tawk login API is not ready');
      finish();
      return;
    }

    loginStarted = true;

    const loginData: Record<string, string> = {
      userId,
      hash: secureHash,
      name: displayName
    };

    if (phone) {
      loginData['phone'] = phone;
    }

    try {
      tawkApi.login(
        loginData,
        (error: any): void => {
          if (this.isDestroyed) {
            finish();
            return;
          }

          if (error) {
            console.error('Tawk login error:', error);
            finish();
            return;
          }

          console.log('Tawk login successful');

          // Display the widget only after login succeeds.
          try {
            if (typeof tawkApi.showWidget === 'function') {
              tawkApi.showWidget();
            }
          } catch (error) {
            console.error('Tawk showWidget error:', error);
          }

          finish();
        }
      );
    } catch (error) {
      console.error('Tawk login exception:', error);
      finish();
    }
  };

  // If login is already available, reuse the API.
  if (typeof tawkApi.login === 'function') {
    loginTawk();
    return;
  }

  // Register onLoad only once for this initialization.
  const previousOnLoad = tawkApi.onLoad;

  const handleTawkLoad = (): void => {
    if (loadHandlerRegistered) {
      return;
    }

    loadHandlerRegistered = true;

    // Preserve an existing onLoad callback.
    if (typeof previousOnLoad === 'function') {
      try {
        previousOnLoad();
      } catch (error) {
        console.error('Previous Tawk onLoad error:', error);
      }
    }

    loginTawk();
  };

  tawkApi.onLoad = handleTawkLoad;

  // Check if the script already exists.
  const existingScript = document.querySelector(
    'script[src*="embed.tawk.to"]'
  ) as HTMLScriptElement | null;

  if (existingScript) {
    // If the script has loaded but login is still unavailable,
    // wait for Tawk's onLoad callback.
    // Do not insert another script.
    return;
  }

  // Load Tawk only when no existing script is found.
  const script = document.createElement('script');

  script.async = true;
  script.src =
    'https://embed.tawk.to/6a3f7d9bedc6bb1d4b5d0a93/1js405a6q';//testing
    //'https://embed.tawk.to/6a3fb078eafe991d4bfa009f/1js4cim9n';//prod


  script.onerror = (error: Event): void => {
    console.error('Tawk script loading failed:', error);
    finish();
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
