import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodBetConfirmPageComponent } from './twod-bet-confirm-page.component';

describe('TwodBetConfirmPageComponent', () => {
  let component: TwodBetConfirmPageComponent;
  let fixture: ComponentFixture<TwodBetConfirmPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwodBetConfirmPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodBetConfirmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
