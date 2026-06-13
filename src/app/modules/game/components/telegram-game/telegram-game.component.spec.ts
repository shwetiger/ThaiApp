import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TelegramGameComponent } from './telegram-game.component';

describe('TelegramGameComponent', () => {
  let component: TelegramGameComponent;
  let fixture: ComponentFixture<TelegramGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TelegramGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TelegramGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
