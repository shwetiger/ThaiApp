import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAppbarComponent } from './not-appbar.component';

describe('NotAppbarComponent', () => {
  let component: NotAppbarComponent;
  let fixture: ComponentFixture<NotAppbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotAppbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAppbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
