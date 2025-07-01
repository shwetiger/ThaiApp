import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameListTransferComponent } from './game-list-transfer.component';

describe('GameListTransferComponent', () => {
  let component: GameListTransferComponent;
  let fixture: ComponentFixture<GameListTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameListTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameListTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
