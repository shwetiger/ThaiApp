import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawMyAccontComponent } from './withdraw-my-accont.component';

describe('WithdrawMyAccontComponent', () => {
  let component: WithdrawMyAccontComponent;
  let fixture: ComponentFixture<WithdrawMyAccontComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawMyAccontComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawMyAccontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
