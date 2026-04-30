import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectClanPage } from './select-clan.page';

describe('SelectClanPage', () => {
  let component: SelectClanPage;
  let fixture: ComponentFixture<SelectClanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectClanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
