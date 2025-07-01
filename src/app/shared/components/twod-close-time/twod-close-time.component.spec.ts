import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodCloseTimeComponent } from './twod-close-time.component';

describe('TwodCloseTimeComponent', () => {
  let component: TwodCloseTimeComponent;
  let fixture: ComponentFixture<TwodCloseTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwodCloseTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodCloseTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
