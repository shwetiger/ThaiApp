import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrViewDialogComponent } from './qr-view-dialog.component';

describe('QrViewDialogComponent', () => {
  let component: QrViewDialogComponent;
  let fixture: ComponentFixture<QrViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
