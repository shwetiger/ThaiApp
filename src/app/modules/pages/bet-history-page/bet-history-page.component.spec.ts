import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BetHistoryPageComponent } from './bet-history-page.component';

describe('BetHistoryPageComponent', () => {
  let component: BetHistoryPageComponent;
  let fixture: ComponentFixture<BetHistoryPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BetHistoryPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetHistoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
