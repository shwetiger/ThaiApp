import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwodLiveComponent } from './twod-live.component';

describe('TwodLiveComponent', () => {
  let component: TwodLiveComponent;
  let fixture: ComponentFixture<TwodLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwodLiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TwodLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
