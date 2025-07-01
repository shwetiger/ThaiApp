import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodBetComponent } from './twod-bet.component';

describe('TwodBetComponent', () => {
  let component: TwodBetComponent;
  let fixture: ComponentFixture<TwodBetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwodBetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodBetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
