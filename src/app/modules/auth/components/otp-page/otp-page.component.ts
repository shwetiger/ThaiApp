import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CodeInputComponent } from 'angular-code-input';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OTP_PAGE_SERVICES } from './services';
import { OtpFacadeService, OtpPageState } from './services/otp-facade.service';
import { CommonService } from 'src/app/shared/service/common.service';

@Component({
  selector: 'app-otp-page',
  templateUrl: './otp-page.component.html',
  styleUrls: ['./otp-page.component.scss'],
  providers: OTP_PAGE_SERVICES
})
export class OtpPageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('codeInput') codeInput!: CodeInputComponent;
  
  pageState$!: Observable<OtpPageState>;
  
  private destroy$ = new Subject<void>();
  
  private otpCode: string = '';
  
  constructor(
    private facade: OtpFacadeService,
    public common: CommonService
  ) {
    this.pageState$ = this.facade.pageState$;
  }
    
  ngOnInit(): void {
    this.facade.initialize()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('Initialize OTP page failed:', error);
        }
      });
  }
  
  ngAfterViewInit(): void {
    // 视图初始化后重置输入框（清除上次残留的验证码）
    setTimeout(() => {
      this.codeInput?.reset();
    });
  }
  
  ngOnDestroy(): void {
    this.facade.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCodeCompleted(code: string): void {
    this.otpCode = code;  // 保存输入的 OTP 值
    if (code.length > 0) {
      this.facade.clearError();
    }
  }
  
  onKeyup(): void {
    this.facade.clearError();
  }
  

  onSubmit(): void {

    const code = this.otpCode;
    
    const validation = this.facade.validateOtpInput(code);
    
    if (!validation.valid) {
      validation.errorKey && this.facade.showError(validation.errorKey);
      return;
    }
    
    this.facade.verifyOtp(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            console.log('OTP verification successful');
          }
        },
        error: (error) => {
          console.error('OTP verification error:', error);
        }
      });
  }
  
  onResend(): void {
    this.codeInput?.reset();
    this.otpCode = '';
    
    this.facade.resendOtp()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('Resend OTP error:', error);
        }
      });
  }
  
  onGoBack(): void {
    this.facade.goBack();
  }
}
