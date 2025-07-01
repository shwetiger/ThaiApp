import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DreamBookPageComponent } from './dream-book-page.component';

describe('DreamBookPageComponent', () => {
  let component: DreamBookPageComponent;
  let fixture: ComponentFixture<DreamBookPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DreamBookPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DreamBookPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
