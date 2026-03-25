import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClansPage } from './clans.page';

describe('ClansPage', () => {
  let component: ClansPage;
  let fixture: ComponentFixture<ClansPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClansPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
