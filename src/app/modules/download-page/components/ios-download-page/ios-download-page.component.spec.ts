import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IosDownloadPageComponent } from './ios-download-page.component';

describe('IosDownloadPageComponent', () => {
  let component: IosDownloadPageComponent;
  let fixture: ComponentFixture<IosDownloadPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IosDownloadPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosDownloadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
