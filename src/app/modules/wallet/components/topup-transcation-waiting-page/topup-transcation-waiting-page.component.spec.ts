import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopupTranscationWaitingPageComponent } from './topup-transcation-waiting-page.component';

describe('TopupTranscationWaitingPageComponent', () => {
  let component: TopupTranscationWaitingPageComponent;
  let fixture: ComponentFixture<TopupTranscationWaitingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopupTranscationWaitingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopupTranscationWaitingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
