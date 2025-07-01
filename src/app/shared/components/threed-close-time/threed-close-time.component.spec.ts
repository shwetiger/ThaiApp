import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedCloseTimeComponent } from './threed-close-time.component';

describe('ThreedCloseTimeComponent', () => {
  let component: ThreedCloseTimeComponent;
  let fixture: ComponentFixture<ThreedCloseTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreedCloseTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedCloseTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
