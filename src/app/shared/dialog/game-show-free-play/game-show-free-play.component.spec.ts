import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameShowFreePlayComponent } from './game-show-free-play.component';

describe('GameShowFreePlayComponent', () => {
  let component: GameShowFreePlayComponent;
  let fixture: ComponentFixture<GameShowFreePlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameShowFreePlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameShowFreePlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
