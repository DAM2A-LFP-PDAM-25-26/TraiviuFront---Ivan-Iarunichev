import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TraiviuList {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteListResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ListsService {
  private apiUrl = 'http://192.168.9.33:8085/api';

  constructor(private http: HttpClient) {}

  getMyLists(): Observable<TraiviuList[]> {
    return this.http.get<TraiviuList[]>(`${this.apiUrl}/lists/me`);
  }

  createList(name: string, type: string = 'CUSTOM'): Observable<TraiviuList> {
    return this.http.post<TraiviuList>(`${this.apiUrl}/lists`, {
      name,
      type,
    });
  }

  deleteList(listId: string): Observable<DeleteListResponse> {
    return this.http.delete<DeleteListResponse>(`${this.apiUrl}/lists/${listId}`);
  }

  updateListName(listId: string, newName: string): Observable<TraiviuList> {
    return this.http.put<TraiviuList>(`${this.apiUrl}/lists/${listId}`, {
      name: newName,
    });
  }
}
