import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTransactionHistoryComponent } from './game-transaction-history.component';

describe('GameTransactionHistoryComponent', () => {
  let component: GameTransactionHistoryComponent;
  let fixture: ComponentFixture<GameTransactionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameTransactionHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTransactionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
