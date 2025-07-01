import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BetSectionDialogComponent } from './bet-section-dialog.component';

describe('BetSectionDialogComponent', () => {
  let component: BetSectionDialogComponent;
  let fixture: ComponentFixture<BetSectionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BetSectionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetSectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
