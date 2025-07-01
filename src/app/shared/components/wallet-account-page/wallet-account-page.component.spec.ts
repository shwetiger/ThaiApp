import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletAccountPageComponent } from './wallet-account-page.component';

describe('WalletAccountPageComponent', () => {
  let component: WalletAccountPageComponent;
  let fixture: ComponentFixture<WalletAccountPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletAccountPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletAccountPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
