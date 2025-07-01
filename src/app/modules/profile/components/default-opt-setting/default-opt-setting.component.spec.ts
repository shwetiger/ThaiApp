import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultOptSettingComponent } from './default-opt-setting.component';

describe('DefaultOptSettingComponent', () => {
  let component: DefaultOptSettingComponent;
  let fixture: ComponentFixture<DefaultOptSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultOptSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultOptSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
