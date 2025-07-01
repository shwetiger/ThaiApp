import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawPendingComponent } from './withdraw-pending.component';

describe('WithdrawPendingComponent', () => {
  let component: WithdrawPendingComponent;
  let fixture: ComponentFixture<WithdrawPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawPendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
