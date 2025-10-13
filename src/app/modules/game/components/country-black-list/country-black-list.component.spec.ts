import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryBlackListComponent } from './country-black-list.component';

describe('CountryBlackListComponent', () => {
  let component: CountryBlackListComponent;
  let fixture: ComponentFixture<CountryBlackListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CountryBlackListComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryBlackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
