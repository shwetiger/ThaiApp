import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDepositSuccessComponent } from './game-deposit-success.component';

describe('GameDepositSuccessComponent', () => {
  let component: GameDepositSuccessComponent;
  let fixture: ComponentFixture<GameDepositSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameDepositSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameDepositSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
