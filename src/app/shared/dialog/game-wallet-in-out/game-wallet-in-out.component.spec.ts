import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWalletInOutComponent } from './game-wallet-in-out.component';

describe('GameWalletInOutComponent', () => {
  let component: GameWalletInOutComponent;
  let fixture: ComponentFixture<GameWalletInOutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameWalletInOutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameWalletInOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
