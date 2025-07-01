import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotRefreshAppbarComponent } from './not-refresh-appbar.component';

describe('NotRefreshAppbarComponent', () => {
  let component: NotRefreshAppbarComponent;
  let fixture: ComponentFixture<NotRefreshAppbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotRefreshAppbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotRefreshAppbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
