import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  private baseUrl = environment.tmdbBaseUrl;
  private apiKey = environment.tmdbApiKey;
  private imageBaseUrl = environment.tmdbImageBaseUrl;

  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES')
      .set('page', '1');

    return this.http.get<any>(`${this.baseUrl}/movie/popular`, { params });
  }

  getTrendingAll(): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES');

    return this.http.get<any>(`${this.baseUrl}/trending/all/week`, { params });
  }

  getNowPlayingMovies(): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES')
      .set('page', '1');

    return this.http.get<any>(`${this.baseUrl}/movie/now_playing`, { params });
  }

  getTopRatedMovies(): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES')
      .set('page', '1');

    return this.http.get<any>(`${this.baseUrl}/movie/top_rated`, { params });
  }

  getMovieDetails(id: number): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES');

    return this.http.get<any>(`${this.baseUrl}/movie/${id}`, { params });
  }

  getTvDetails(id: number): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES');

    return this.http.get<any>(`${this.baseUrl}/tv/${id}`, { params });
  }

  getMovieVideos(id: number): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES');

    return this.http.get<any>(`${this.baseUrl}/movie/${id}/videos`, { params });
  }

  getTvVideos(id: number): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES');

    return this.http.get<any>(`${this.baseUrl}/tv/${id}/videos`, { params });
  }

  searchMulti(query: string): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', 'es-ES')
      .set('query', query)
      .set('page', '1')
      .set('include_adult', 'false');

    return this.http.get<any>(`${this.baseUrl}/search/multi`, { params });
  }

  getPosterUrl(path: string | null): string {
    return path ? `${this.imageBaseUrl}${path}` : 'assets/img/no-poster.png';
  }
}
