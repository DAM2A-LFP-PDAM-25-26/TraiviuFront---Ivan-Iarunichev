import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaDetailPage } from './media-detail.page';

describe('MediaDetailPage', () => {
  let component: MediaDetailPage;
  let fixture: ComponentFixture<MediaDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
