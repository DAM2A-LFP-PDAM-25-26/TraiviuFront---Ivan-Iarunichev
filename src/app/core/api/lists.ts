import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TraiviuList {
  id: string;
  user: { id: string; email: string; displayName: string } | null; // según lo que devuelva
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  // Ajusta esta URL según dónde corras el backend
  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {}

  getListsByUser(userId: string): Observable<TraiviuList[]> {
    return this.http.get<TraiviuList[]>(`${this.apiUrl}/lists/user/${userId}`);
  }

  createList(userId: string, name: string, type: string = 'CUSTOM'): Observable<TraiviuList> {
    return this.http.post<TraiviuList>(`${this.apiUrl}/lists`, {
      userId,
      name,
      type,
    });
  }
}
