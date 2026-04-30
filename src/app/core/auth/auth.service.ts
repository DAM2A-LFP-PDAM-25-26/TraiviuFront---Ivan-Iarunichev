import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8085/api/auth';
  private readonly userApiUrl = 'http://localhost:8085/api/users';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly avatarKeyPrefix = 'auth_avatar_';
  private readonly clanNotificationsKey = 'clan_notifications_enabled';
  private readonly defaultAvatar = 'assets/icon/default-avatar.png';
  private readonly backendBaseUrl = 'http://localhost:8085';

  private userSubject = new BehaviorSubject<AuthResponse | null>(
    this.getStoredUser(),
  );
  user$ = this.userSubject.asObservable();

  private avatarSubject = new BehaviorSubject<string | null>(
    this.getInitialAvatar(),
  );
  avatar$ = this.avatarSubject.asObservable();

  private clanNotificationsSubject = new BehaviorSubject<boolean>(
    this.getInitialClanNotificationsValue(),
  );
  clanNotificationsEnabled$ = this.clanNotificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((response: AuthResponse) => {
        this.setSession(response);
      }),
    );
  }

  register(
    email: string,
    password: string,
    displayName: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        email,
        password,
        displayName,
      })
      .pipe(
        tap((response: AuthResponse) => {
          this.setSession(response);
        }),
      );
  }

  private resolveAvatarUrl(url: string | null | undefined): string | null {
    if (!url || !url.trim()) {
      return null;
    }

    const trimmed = url.trim();

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return `${this.backendBaseUrl}${trimmed}`;
    }

    return `${this.backendBaseUrl}/${trimmed}`;
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string | null }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() ?? ''}`,
      // NO ponemos Content-Type aquí, lo hace el navegador
    });

    return this.http
      .post<{
        avatarUrl: string | null;
      }>(`${this.userApiUrl}/me/avatar`, formData, { headers })
      .pipe(
        tap((res) => {
          const resolvedAvatar = this.resolveAvatarUrl(res.avatarUrl);
          this.setAvatar(resolvedAvatar);

          const current = this.getCurrentUser();
          if (current) {
            const updated: AuthResponse = {
              ...current,
              avatarUrl: resolvedAvatar ?? undefined,
            };
            this.setUser(updated);
          }
        }),
      );
  }

  updateMe(displayName: string, email: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() ?? ''}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<AuthResponse>(
        `${this.userApiUrl}/me`,
        { displayName, email },
        { headers },
      )
      .pipe(
        tap((response: AuthResponse) => {
          const currentToken = this.getToken();

          const mergedResponse: AuthResponse = {
            ...response,
            token: response.token || currentToken || '',
            avatarUrl:
              response.avatarUrl ?? this.getCurrentUser()?.avatarUrl ?? null,
          };

          this.setSession(mergedResponse);
        }),
      );
  }

  removeAvatarBackend(): Observable<{ avatarUrl: string | null }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() ?? ''}`,
    });

    return this.http
      .delete<{
        avatarUrl: string | null;
      }>(`${this.userApiUrl}/me/avatar`, { headers })
      .pipe(
        tap(() => {
          this.setAvatar(null);
          const current = this.getCurrentUser();
          if (current) {
            const updated: AuthResponse = { ...current, avatarUrl: undefined };
            this.setUser(updated);
          }
        }),
      );
  }

  private setSession(auth: AuthResponse): void {
    this.setToken(auth.token);
    this.setUser(auth);

    const avatarFromBackend = this.resolveAvatarUrl(auth.avatarUrl);
    const storedAvatar = this.getStoredAvatarByUserId(auth.userId);

    const finalAvatar = avatarFromBackend || storedAvatar || this.defaultAvatar;

    this.avatarSubject.next(finalAvatar);
    localStorage.setItem(this.getAvatarKey(auth.userId), finalAvatar);
  }

  private getInitialAvatar(): string | null {
    const user = this.getStoredUser();
    if (!user) {
      return this.defaultAvatar;
    }

    const backendAvatar = this.resolveAvatarUrl(user.avatarUrl);
    return (
      backendAvatar ||
      this.getStoredAvatarByUserId(user.userId) ||
      this.defaultAvatar
    );
  }

  private getAvatarKey(userId: string): string {
    return `${this.avatarKeyPrefix}${userId}`;
  }

  private getInitialClanNotificationsValue(): boolean {
    const raw = localStorage.getItem(this.clanNotificationsKey);

    if (raw === null) {
      localStorage.setItem(this.clanNotificationsKey, 'true');
      return true;
    }

    return raw === 'true';
  }

  setClanNotificationsEnabled(enabled: boolean): void {
    localStorage.setItem(this.clanNotificationsKey, String(enabled));
    this.clanNotificationsSubject.next(enabled);
  }

  getClanNotificationsEnabled(): boolean {
    return this.clanNotificationsSubject.value;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  setUser(user: AuthResponse): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  getStoredUser(): AuthResponse | null {
    const rawUser = localStorage.getItem(this.userKey);
    return rawUser ? JSON.parse(rawUser) : null;
  }

  getCurrentUser(): AuthResponse | null {
    return this.userSubject.value;
  }

  clearUser(): void {
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  setAvatar(url: string | null): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    const finalAvatar = this.resolveAvatarUrl(url) || this.defaultAvatar;
    localStorage.setItem(this.getAvatarKey(currentUser.userId), finalAvatar);
    this.avatarSubject.next(finalAvatar);
  }

  getStoredAvatar(): string | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.defaultAvatar;
    }

    return (
      this.getStoredAvatarByUserId(currentUser.userId) || this.defaultAvatar
    );
  }

  private getStoredAvatarByUserId(userId: string): string | null {
    return localStorage.getItem(this.getAvatarKey(userId));
  }

  clearAvatar(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    localStorage.setItem(
      this.getAvatarKey(currentUser.userId),
      this.defaultAvatar,
    );
    this.avatarSubject.next(this.defaultAvatar);
  }

  logout(): void {
    this.clearToken();
    this.clearUser();
    this.avatarSubject.next(this.defaultAvatar);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
