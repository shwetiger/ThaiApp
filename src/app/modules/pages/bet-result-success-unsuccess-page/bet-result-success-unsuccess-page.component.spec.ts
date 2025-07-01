import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BetResultSuccessUnsuccessPageComponent } from './bet-result-success-unsuccess-page.component';

describe('BetResultSuccessUnsuccessPageComponent', () => {
  let component: BetResultSuccessUnsuccessPageComponent;
  let fixture: ComponentFixture<BetResultSuccessUnsuccessPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BetResultSuccessUnsuccessPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetResultSuccessUnsuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
