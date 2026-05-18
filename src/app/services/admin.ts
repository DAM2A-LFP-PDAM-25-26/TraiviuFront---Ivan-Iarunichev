import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: string;
  blocked: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface AdminClan {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
  status: string;
  membersCount: number;
}

export interface AdminClanMember {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  joinedAt: string;
}

export interface AdminUserUpdateRequest {
  email: string;
  displayName: string;
  role: string;
  blocked: boolean;
}

export interface AdminClanUpdateRequest {
  name: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private readonly baseUrl = 'https://ivani26.iesmontenaranco.com:8000/api/admin';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.authService.getToken() ?? ''}`,
        'Content-Type': 'application/json',
      }),
    };
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`, this.headers());
  }

  createUser(request: AdminUserUpdateRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(
      `${this.baseUrl}/users`,
      request,
      this.headers()
    );
  }

  updateUser(id: string, request: AdminUserUpdateRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(
      `${this.baseUrl}/users/${id}`,
      request,
      this.headers()
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`, this.headers());
  }

  getClans(): Observable<AdminClan[]> {
    return this.http.get<AdminClan[]>(`${this.baseUrl}/clans`, this.headers());
  }

  updateClan(id: string, request: AdminClanUpdateRequest): Observable<AdminClan> {
    return this.http.put<AdminClan>(
      `${this.baseUrl}/clans/${id}`,
      request,
      this.headers()
    );
  }

  deleteClan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clans/${id}`, this.headers());
  }

  getClanMembers(clanId: string): Observable<AdminClanMember[]> {
    return this.http.get<AdminClanMember[]>(
      `${this.baseUrl}/clans/${clanId}/members`,
      this.headers()
    );
  }

  removeClanMember(clanId: string, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/clans/${clanId}/members/${userId}`,
      this.headers()
    );
  }
}
