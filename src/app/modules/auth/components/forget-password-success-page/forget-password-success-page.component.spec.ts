import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetPasswordSuccessPageComponent } from './forget-password-success-page.component';

describe('ForgetPasswordSuccessPageComponent', () => {
  let component: ForgetPasswordSuccessPageComponent;
  let fixture: ComponentFixture<ForgetPasswordSuccessPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgetPasswordSuccessPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetPasswordSuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
