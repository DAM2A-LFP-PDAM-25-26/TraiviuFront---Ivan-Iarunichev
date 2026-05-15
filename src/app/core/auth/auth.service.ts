import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, timeout, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

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
  private readonly backendBaseUrl = 'http://192.168.9.33:8085';
  private readonly apiBaseUrl = `${this.backendBaseUrl}/api`;
  private readonly authApiUrl = `${this.apiBaseUrl}/auth`;
  private readonly userApiUrl = `${this.apiBaseUrl}/users`;

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly avatarKeyPrefix = 'auth_avatar_';
  private readonly clanNotificationsKey = 'clan_notifications_enabled';
  private readonly defaultAvatar = 'assets/icon/default-avatar.png';

  private readonly requestTimeoutMs = 10000;
  static readonly LOGIN_ROUTE = '/auth/login';
  static readonly ADMIN_ROUTE = '/admin/dashboard';
  static readonly HOME_ROUTE = '/tabs/catalog';

  private userSubject = new BehaviorSubject<AuthResponse | null>(
    this.getStoredUser()
  );
  user$ = this.userSubject.asObservable();

  private avatarSubject = new BehaviorSubject<string | null>(
    this.getInitialAvatar()
  );
  avatar$ = this.avatarSubject.asObservable();

  private clanNotificationsSubject = new BehaviorSubject<boolean>(
    this.getInitialClanNotificationsValue()
  );
  clanNotificationsEnabled$ = this.clanNotificationsSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkTokenExpiry();
  }

  checkTokenExpiry(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        this.logout();
        this.router.navigateByUrl(AuthService.LOGIN_ROUTE);
      }
    } catch {
      this.logout();
      this.router.navigateByUrl(AuthService.LOGIN_ROUTE);
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.authApiUrl}/login`, body).pipe(
      timeout(this.requestTimeoutMs),
      tap((response: AuthResponse) => {
        this.setSession(response);
      }),
      catchError((error) => this.handleHttpError(error))
    );
  }

  register(
    email: string,
    password: string,
    displayName: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.authApiUrl}/register`, {
        email,
        password,
        displayName,
      })
      .pipe(
        timeout(this.requestTimeoutMs),
        tap((response: AuthResponse) => {
          this.setSession(response);
        }),
        catchError((error) => this.handleHttpError(error))
      );
  }

  uploadAvatar(file: File): Observable<{ avatarUrl: string | null }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() ?? ''}`,
    });

    return this.http
      .post<{ avatarUrl: string | null }>(
        `${this.userApiUrl}/me/avatar`,
        formData,
        { headers }
      )
      .pipe(
        timeout(this.requestTimeoutMs),
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
        catchError((error) => this.handleHttpError(error))
      );
  }

  removeAvatarBackend(): Observable<{ avatarUrl: string | null }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.getToken() ?? ''}`,
    });

    return this.http
      .delete<{ avatarUrl: string | null }>(`${this.userApiUrl}/me/avatar`, {
        headers,
      })
      .pipe(
        timeout(this.requestTimeoutMs),
        tap(() => {
          this.setAvatar(null);
          const current = this.getCurrentUser();
          if (current) {
            const updated: AuthResponse = { ...current, avatarUrl: undefined };
            this.setUser(updated);
          }
        }),
        catchError((error) => this.handleHttpError(error))
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
        { headers }
      )
      .pipe(
        timeout(this.requestTimeoutMs),
        tap((response: AuthResponse) => {
          const currentToken = this.getToken();
          const currentUser = this.getCurrentUser();

          const mergedResponse: AuthResponse = {
            ...currentUser,
            ...response,
            token: response.token || currentToken || '',
            avatarUrl: response.avatarUrl ?? currentUser?.avatarUrl ?? null,
          };

          this.setSession(mergedResponse);
        }),
        catchError((error) => this.handleHttpError(error))
      );
  }

  private setSession(auth: AuthResponse): void {
    this.setToken(auth.token);
    this.setUser(auth);

    const finalAvatar =
      this.resolveAvatarUrl(auth.avatarUrl) || this.defaultAvatar;

    this.avatarSubject.next(finalAvatar);
    localStorage.setItem(this.getAvatarKey(auth.userId), finalAvatar);
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

  logout(): void {
    this.clearToken();
    this.clearUser();
    this.avatarSubject.next(this.defaultAvatar);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired();
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
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
    if (!currentUser) return this.defaultAvatar;
    return (
      this.getStoredAvatarByUserId(currentUser.userId) || this.defaultAvatar
    );
  }

  clearAvatar(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    localStorage.setItem(
      this.getAvatarKey(currentUser.userId),
      this.defaultAvatar
    );
    this.avatarSubject.next(this.defaultAvatar);
  }

  private getInitialAvatar(): string | null {
    const user = this.getStoredUser();
    if (!user) return this.defaultAvatar;

    return (
      this.getStoredAvatarByUserId(user.userId) ||
      this.resolveAvatarUrl(user.avatarUrl) ||
      this.defaultAvatar
    );
  }

  private getAvatarKey(userId: string): string {
    return `${this.avatarKeyPrefix}${userId}`;
  }

  private getStoredAvatarByUserId(userId: string): string | null {
    return localStorage.getItem(this.getAvatarKey(userId));
  }

  private resolveAvatarUrl(url: string | null | undefined): string | null {
    if (!url || !url.trim()) return null;

    const trimmed = url.trim();

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return `${this.backendBaseUrl}${trimmed}`;
    }

    return `${this.backendBaseUrl}/${trimmed}`;
  }

  setClanNotificationsEnabled(enabled: boolean): void {
    localStorage.setItem(this.clanNotificationsKey, String(enabled));
    this.clanNotificationsSubject.next(enabled);
  }

  getClanNotificationsEnabled(): boolean {
    return this.clanNotificationsSubject.value;
  }

  private getInitialClanNotificationsValue(): boolean {
    const raw = localStorage.getItem(this.clanNotificationsKey);
    if (raw === null) {
      localStorage.setItem(this.clanNotificationsKey, 'true');
      return true;
    }
    return raw === 'true';
  }

  private handleHttpError(error: unknown) {
    if ((error as any)?.name === 'TimeoutError') {
      return throwError(() => ({
        error: {
          message:
            'La conexión con el servidor tardó demasiado. En Android revisa IP, WiFi y configuración HTTP.',
        },
      }));
    }

    const httpError = error as HttpErrorResponse;

    if (httpError.status === 0) {
      return throwError(() => ({
        error: {
          message:
            'No se pudo conectar con el servidor. En Android comprueba que el móvil y el PC estén en la misma red y que el backend esté accesible.',
        },
      }));
    }

    return throwError(() => error);
  }
}
