import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadSuccessComponent } from './fileupload-success.component';

describe('FileUploadSuccessComponent', () => {
  let component: FileUploadSuccessComponent;
  let fixture: ComponentFixture<FileUploadSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileUploadSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
