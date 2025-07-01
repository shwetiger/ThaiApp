import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOpenChromeComponent } from './game-open-chrome.component';

describe('GameOpenChromeComponent', () => {
  let component: GameOpenChromeComponent;
  let fixture: ComponentFixture<GameOpenChromeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameOpenChromeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameOpenChromeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
