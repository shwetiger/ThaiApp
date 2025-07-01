import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotiListComponent } from './noti-list.component';

describe('NotiListComponent', () => {
  let component: NotiListComponent;
  let fixture: ComponentFixture<NotiListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotiListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
