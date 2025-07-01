import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDepositErrorComponent } from './game-deposit-error.component';

describe('GameDepositErrorComponent', () => {
  let component: GameDepositErrorComponent;
  let fixture: ComponentFixture<GameDepositErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameDepositErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameDepositErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
