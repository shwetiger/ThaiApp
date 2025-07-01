import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedchancePageComponent } from './threedchance-page.component';

describe('ThreedchancePageComponent', () => {
  let component: ThreedchancePageComponent;
  let fixture: ComponentFixture<ThreedchancePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreedchancePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedchancePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
