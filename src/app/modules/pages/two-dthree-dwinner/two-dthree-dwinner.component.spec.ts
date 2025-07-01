import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoDThreeDWinnerComponent } from './two-dthree-dwinner.component';

describe('TwoDThreeDWinnerComponent', () => {
  let component: TwoDThreeDWinnerComponent;
  let fixture: ComponentFixture<TwoDThreeDWinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoDThreeDWinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoDThreeDWinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
