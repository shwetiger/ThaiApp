import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamecategoryComponent } from './gamecategory.component';

describe('GamecategoryComponent', () => {
  let component: GamecategoryComponent;
  let fixture: ComponentFixture<GamecategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamecategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamecategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
