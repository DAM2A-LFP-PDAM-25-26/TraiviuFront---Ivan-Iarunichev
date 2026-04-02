import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListDetailPage } from './list-detail.page';

describe('ListDetailPage', () => {
  let component: ListDetailPage;
  let fixture: ComponentFixture<ListDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
