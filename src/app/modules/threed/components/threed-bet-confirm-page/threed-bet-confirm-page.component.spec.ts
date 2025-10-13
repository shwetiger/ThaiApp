import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedBetConfirmPageComponent } from './threed-bet-confirm-page.component';

describe('ThreedBetConfirmPageComponent', () => {
  let component: ThreedBetConfirmPageComponent;
  let fixture: ComponentFixture<ThreedBetConfirmPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThreedBetConfirmPageComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedBetConfirmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
