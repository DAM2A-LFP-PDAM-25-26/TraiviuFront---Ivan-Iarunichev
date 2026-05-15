import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private readonly apiUrl = 'http://192.168.9.33:8085/api/clans';

  constructor(private http: HttpClient) {}

  getMyClans(): Observable<Clan[]> {
    return this.http.get<Clan[]>(`${this.apiUrl}/my`);
  }

  searchClans(query: string): Observable<Clan[]> {
    return this.http.get<Clan[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }

  createClan(body: CreateClanRequest): Observable<Clan> {
    return this.http.post<Clan>(this.apiUrl, body);
  }

  joinClan(body: JoinClanRequest): Observable<Clan> {
    return this.http.post<Clan>(`${this.apiUrl}/join`, body);
  }

  leaveClan(clanId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${clanId}/leave`, {});
  }

  updateClanNotifications(
    clanId: string,
    body: UpdateClanNotificationsRequest,
  ): Observable<Clan> {
    return this.http.patch<Clan>(
      `${this.apiUrl}/${clanId}/notifications`,
      body,
    );
  }

  getClanMembers(clanId: string): Observable<ClanMember[]> {
    return this.http.get<ClanMember[]>(`${this.apiUrl}/${clanId}/members`);
  }

  getClanMessages(clanId: string): Observable<ClanMessage[]> {
    return this.http.get<ClanMessage[]>(`${this.apiUrl}/${clanId}/messages`);
  }

  sendMessage(clanId: string, content: string): Observable<ClanMessage> {
    return this.http.post<ClanMessage>(`${this.apiUrl}/${clanId}/messages`, {
      content,
    });
  }

  getClanById(clanId: string): Observable<Clan> {
    return this.http.get<Clan>(`${this.apiUrl}/${clanId}`);
  }

  getClanFeed(clanId: string): Observable<ClanActivityItem[]> {
    return this.http.get<ClanActivityItem[]>(`${this.apiUrl}/${clanId}/feed`);
  }

  recommendToClan(
    clanId: string,
    payload: ClanRecommendationRequest,
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${clanId}/recommendations`,
      payload,
    );
  }
}
