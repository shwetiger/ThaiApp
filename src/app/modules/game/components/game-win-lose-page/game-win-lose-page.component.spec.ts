import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWinLosePageComponent } from './game-win-lose-page.component';

describe('GameWinLosePageComponent', () => {
  let component: GameWinLosePageComponent;
  let fixture: ComponentFixture<GameWinLosePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameWinLosePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameWinLosePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
