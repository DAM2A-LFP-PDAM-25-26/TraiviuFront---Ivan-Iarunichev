import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListItemService {

  private apiUrl = 'https://ivani26.iesmontenaranco.com:8000/api/list-items';

  constructor(private http: HttpClient) { }

  addMovieToList(movieData: any): Observable<any> {
    return this.http.post(this.apiUrl, movieData);
  }

  getMoviesFromList(listId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list/${listId}`);
  }

  removeMovieFromList(itemId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}`);
  }
}
