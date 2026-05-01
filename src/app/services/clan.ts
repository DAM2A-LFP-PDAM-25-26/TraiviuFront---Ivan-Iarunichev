import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Clan,
  ClanActivityItem,
  ClanMember,
  ClanMessage,
  CreateClanRequest,
  JoinClanRequest,
  UpdateClanNotificationsRequest,
} from '../models/clan.model';
import { AuthService } from '../core/auth/auth.service';

export interface ClanRecommendationRequest {
  externalApiId: string;
  title: string;
  year: string;
  posterUrl: string | null;
  mediaType: 'movie' | 'tv';
}

@Injectable({
  providedIn: 'root',
})
export class ClansService {
  private readonly apiUrl = 'http://192.168.1.34:8085/api/clans'

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token =
      this.authService.getToken?.() || localStorage.getItem('token') || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getMyClans(): Observable<Clan[]> {
    return this.http.get<Clan[]>(`${this.apiUrl}/my`, {
      headers: this.getHeaders(),
    });
  }

  searchClans(query: string): Observable<Clan[]> {
    return this.http.get<Clan[]>(`${this.apiUrl}/search`, {
      headers: this.getHeaders(),
      params: {
        q: query,
      },
    });
  }

  createClan(body: CreateClanRequest): Observable<Clan> {
    return this.http.post<Clan>(this.apiUrl, body, {
      headers: this.getHeaders(),
    });
  }

  joinClan(body: JoinClanRequest): Observable<Clan> {
    return this.http.post<Clan>(`${this.apiUrl}/join`, body, {
      headers: this.getHeaders(),
    });
  }

  leaveClan(clanId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${clanId}/leave`,
      {},
      {
        headers: this.getHeaders(),
      },
    );
  }

  updateClanNotifications(
    clanId: string,
    body: UpdateClanNotificationsRequest,
  ): Observable<Clan> {
    return this.http.patch<Clan>(
      `${this.apiUrl}/${clanId}/notifications`,
      body,
      {
        headers: this.getHeaders(),
      },
    );
  }

  getClanMembers(clanId: string): Observable<ClanMember[]> {
    return this.http.get<ClanMember[]>(`${this.apiUrl}/${clanId}/members`, {
      headers: this.getHeaders(),
    });
  }

  getClanMessages(clanId: string): Observable<ClanMessage[]> {
    return this.http.get<ClanMessage[]>(`${this.apiUrl}/${clanId}/messages`, {
      headers: this.getHeaders(),
    });
  }

  sendMessage(clanId: string, content: string): Observable<ClanMessage> {
    return this.http.post<ClanMessage>(
      `${this.apiUrl}/${clanId}/messages`,
      { content },
      { headers: this.getHeaders() },
    );
  }

  getClanById(clanId: string): Observable<Clan> {
    return this.http.get<Clan>(`${this.apiUrl}/${clanId}`, {
      headers: this.getHeaders(),
    });
  }

  getClanFeed(clanId: string): Observable<ClanActivityItem[]> {
    return this.http.get<ClanActivityItem[]>(`${this.apiUrl}/${clanId}/feed`, {
      headers: this.getHeaders(),
    });
  }

  recommendToClan(
    clanId: string,
    payload: ClanRecommendationRequest,
  ): Observable<void> {
    const token = this.authService.getToken() ?? '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<void>(
      `${this.apiUrl}/${clanId}/recommendations`,
      payload,
      { headers },
    );
  }
}
