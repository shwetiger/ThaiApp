import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedInitialPageComponent } from './threed-initial-page.component';

describe('ThreedInitialPageComponent', () => {
  let component: ThreedInitialPageComponent;
  let fixture: ComponentFixture<ThreedInitialPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreedInitialPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedInitialPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
