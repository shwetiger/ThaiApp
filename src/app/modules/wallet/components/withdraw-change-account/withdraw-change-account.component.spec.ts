import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawChangeAccountComponent } from './withdraw-change-account.component';

describe('WithdrawChangeAccountComponent', () => {
  let component: WithdrawChangeAccountComponent;
  let fixture: ComponentFixture<WithdrawChangeAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawChangeAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawChangeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
