import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameAccountLoginComponent } from './game-account-login.component';

describe('GameAccountLoginComponent', () => {
  let component: GameAccountLoginComponent;
  let fixture: ComponentFixture<GameAccountLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameAccountLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameAccountLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
