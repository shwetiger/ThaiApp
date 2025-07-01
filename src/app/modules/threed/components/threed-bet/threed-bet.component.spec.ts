import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedBetComponent } from './threed-bet.component';

describe('ThreedBetComponent', () => {
  let component: ThreedBetComponent;
  let fixture: ComponentFixture<ThreedBetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreedBetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedBetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
