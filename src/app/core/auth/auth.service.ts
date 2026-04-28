import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8085/api/auth';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly avatarKeyPrefix = 'auth_avatar_';
  private readonly defaultAvatar = 'assets/icon/default-avatar.png';

  private userSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  private avatarSubject = new BehaviorSubject<string | null>(this.getInitialAvatar());
  avatar$ = this.avatarSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((response: AuthResponse) => {
        this.setSession(response);
      })
    );
  }

  register(
    email: string,
    password: string,
    displayName: string
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
        })
      );
  }

  private setSession(auth: AuthResponse): void {
    this.setToken(auth.token);
    this.setUser(auth);

    const avatar = this.getStoredAvatarByUserId(auth.userId) || this.defaultAvatar;
    this.avatarSubject.next(avatar);

    if (!this.getStoredAvatarByUserId(auth.userId)) {
      localStorage.setItem(this.getAvatarKey(auth.userId), this.defaultAvatar);
    }
  }

  private getInitialAvatar(): string | null {
    const user = this.getStoredUser();
    if (!user) {
      return this.defaultAvatar;
    }

    return this.getStoredAvatarByUserId(user.userId) || this.defaultAvatar;
  }

  private getAvatarKey(userId: string): string {
    return `${this.avatarKeyPrefix}${userId}`;
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

    const finalAvatar = url || this.defaultAvatar;
    localStorage.setItem(this.getAvatarKey(currentUser.userId), finalAvatar);
    this.avatarSubject.next(finalAvatar);
  }

  getStoredAvatar(): string | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return this.defaultAvatar;
    }

    return this.getStoredAvatarByUserId(currentUser.userId) || this.defaultAvatar;
  }

  private getStoredAvatarByUserId(userId: string): string | null {
    return localStorage.getItem(this.getAvatarKey(userId));
  }

  clearAvatar(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;

    localStorage.setItem(this.getAvatarKey(currentUser.userId), this.defaultAvatar);
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
