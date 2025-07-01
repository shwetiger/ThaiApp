import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckingPersonalInfoComponent } from './checking-personal-info.component';

describe('CheckingPersonalInfoComponent', () => {
  let component: CheckingPersonalInfoComponent;
  let fixture: ComponentFixture<CheckingPersonalInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckingPersonalInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckingPersonalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
