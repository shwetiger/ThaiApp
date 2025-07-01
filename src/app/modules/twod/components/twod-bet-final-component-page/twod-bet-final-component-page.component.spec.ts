import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodBetFinalComponentPageComponent } from './twod-bet-final-component-page.component';

describe('TwodBetFinalComponentPageComponent', () => {
  let component: TwodBetFinalComponentPageComponent;
  let fixture: ComponentFixture<TwodBetFinalComponentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwodBetFinalComponentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodBetFinalComponentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
