import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCategoryTransferComponent } from './game-category-transfer.component';

describe('GameCategoryTransferComponent', () => {
  let component: GameCategoryTransferComponent;
  let fixture: ComponentFixture<GameCategoryTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameCategoryTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameCategoryTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
