import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppPhonePickerComponent } from './app-phone-picker.component';

describe('AppPhonePickerComponent', () => {
  let component: AppPhonePickerComponent;
  let fixture: ComponentFixture<AppPhonePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppPhonePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPhonePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
