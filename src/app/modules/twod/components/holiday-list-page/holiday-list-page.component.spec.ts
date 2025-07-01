import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayListPageComponent } from './holiday-list-page.component';

describe('HolidayListPageComponent', () => {
  let component: HolidayListPageComponent;
  let fixture: ComponentFixture<HolidayListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HolidayListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidayListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
