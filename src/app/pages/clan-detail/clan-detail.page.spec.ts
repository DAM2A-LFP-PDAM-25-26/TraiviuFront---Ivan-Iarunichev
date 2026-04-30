import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClanDetailPage } from './clan-detail.page';

describe('ClanDetailPage', () => {
  let component: ClanDetailPage;
  let fixture: ComponentFixture<ClanDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClanDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
