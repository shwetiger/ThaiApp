import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameWebMobileViewComponent } from './game-web-mobile-view.component';

describe('GameWebMobileViewComponent', () => {
  let component: GameWebMobileViewComponent;
  let fixture: ComponentFixture<GameWebMobileViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameWebMobileViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameWebMobileViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
