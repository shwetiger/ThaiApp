import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWinLoseComponent } from './game-win-lose.component';

describe('GameWinLoseComponent', () => {
  let component: GameWinLoseComponent;
  let fixture: ComponentFixture<GameWinLoseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameWinLoseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameWinLoseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
