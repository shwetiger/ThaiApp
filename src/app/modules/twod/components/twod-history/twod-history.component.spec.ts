import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodHistoryComponent } from './twod-history.component';

describe('TwodHistoryComponent', () => {
  let component: TwodHistoryComponent;
  let fixture: ComponentFixture<TwodHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwodHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
