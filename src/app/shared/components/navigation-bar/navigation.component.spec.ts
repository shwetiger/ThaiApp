import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNavigationBarComponent } from './navigation.component';

describe('AppNavigationBarComponent', () => {
  let component: AppNavigationBarComponent;
  let fixture: ComponentFixture<AppNavigationBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppNavigationBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavigationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
