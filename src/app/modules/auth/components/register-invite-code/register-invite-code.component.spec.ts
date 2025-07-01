import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInviteCodeComponent } from './register-invite-code.component';

describe('RegisterInviteCodeComponent', () => {
  let component: RegisterInviteCodeComponent;
  let fixture: ComponentFixture<RegisterInviteCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterInviteCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterInviteCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
