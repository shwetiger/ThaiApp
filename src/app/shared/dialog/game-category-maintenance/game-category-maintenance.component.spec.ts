import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCategoryMaintenanceComponent } from './game-category-maintenance.component';

describe('GameCategoryMaintenanceComponent', () => {
  let component: GameCategoryMaintenanceComponent;
  let fixture: ComponentFixture<GameCategoryMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameCategoryMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameCategoryMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
