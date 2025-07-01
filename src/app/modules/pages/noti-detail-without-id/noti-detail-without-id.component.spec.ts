import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotiDetailWithoutIdComponent } from './noti-detail-without-id.component';

describe('NotiDetailWithoutIdComponent', () => {
  let component: NotiDetailWithoutIdComponent;
  let fixture: ComponentFixture<NotiDetailWithoutIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotiDetailWithoutIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotiDetailWithoutIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
