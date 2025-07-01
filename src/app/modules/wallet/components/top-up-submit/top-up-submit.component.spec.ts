import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopUpSubmitComponent } from './top-up-submit.component';

describe('TopUpSubmitComponent', () => {
  let component: TopUpSubmitComponent;
  let fixture: ComponentFixture<TopUpSubmitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopUpSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopUpSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
