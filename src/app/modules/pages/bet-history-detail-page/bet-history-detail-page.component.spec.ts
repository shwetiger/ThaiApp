import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BetHistoryDetailPageComponent } from './bet-history-detail-page.component';

describe('BetHistoryDetailPageComponent', () => {
  let component: BetHistoryDetailPageComponent;
  let fixture: ComponentFixture<BetHistoryDetailPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BetHistoryDetailPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetHistoryDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
