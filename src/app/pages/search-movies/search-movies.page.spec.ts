import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchMoviesPage } from './search-movies.page';

describe('SearchMoviesPage', () => {
  let component: SearchMoviesPage;
  let fixture: ComponentFixture<SearchMoviesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMoviesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
