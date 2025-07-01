import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSplashScreenAdsComponent } from './app-splash-screen-ads.component';

describe('AppSplashScreenAdsComponent', () => {
  let component: AppSplashScreenAdsComponent;
  let fixture: ComponentFixture<AppSplashScreenAdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppSplashScreenAdsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppSplashScreenAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
