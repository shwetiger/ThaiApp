import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodDreamBookComponent } from './twod-dream-book.component';

describe('TwodDreamBookComponent', () => {
  let component: TwodDreamBookComponent;
  let fixture: ComponentFixture<TwodDreamBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwodDreamBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodDreamBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
