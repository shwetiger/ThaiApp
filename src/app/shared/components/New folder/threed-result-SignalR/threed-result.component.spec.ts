import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedResultComponent } from './threed-result.component';

describe('ThreedResultComponent', () => {
  let component: ThreedResultComponent;
  let fixture: ComponentFixture<ThreedResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreedResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
