import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialVideoPageComponent } from './tutorial-video-page.component';

describe('TutorialVideoPageComponent', () => {
  let component: TutorialVideoPageComponent;
  let fixture: ComponentFixture<TutorialVideoPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorialVideoPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorialVideoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
