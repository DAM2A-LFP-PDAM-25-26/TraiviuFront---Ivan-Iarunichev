import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectListPage } from './select-list.page';

describe('SelectListPage', () => {
  let component: SelectListPage;
  let fixture: ComponentFixture<SelectListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
