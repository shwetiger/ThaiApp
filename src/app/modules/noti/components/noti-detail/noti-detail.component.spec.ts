import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotiDetailComponent } from './noti-detail.component';

describe('NotiDetailComponent', () => {
  let component: NotiDetailComponent;
  let fixture: ComponentFixture<NotiDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotiDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotiDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
