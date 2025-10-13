import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ThreedBetFinalConfirmPageComponent } from './threed-bet-final-confirm-page.component';

describe('ThreedBetFinalConfirmPageComponent', () => {
  let component: ThreedBetFinalConfirmPageComponent;
  let fixture: ComponentFixture<ThreedBetFinalConfirmPageComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThreedBetFinalConfirmPageComponent]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedBetFinalConfirmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
