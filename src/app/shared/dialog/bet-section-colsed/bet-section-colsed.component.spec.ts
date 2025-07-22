import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BetSectionColsedComponent } from './bet-section-colsed.component';

describe('BetSectionColsedComponent', () => {
  let component: BetSectionColsedComponent;
  let fixture: ComponentFixture<BetSectionColsedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BetSectionColsedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetSectionColsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
