import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWalletComponent } from './game-wallet.component';

describe('GameWalletComponent', () => {
  let component: GameWalletComponent;
  let fixture: ComponentFixture<GameWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
