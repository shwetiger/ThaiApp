import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodInitialPageComponent } from './twod-initial-page.component';

describe('TwodInitialPageComponent', () => {
  let component: TwodInitialPageComponent;
  let fixture: ComponentFixture<TwodInitialPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwodInitialPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodInitialPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
