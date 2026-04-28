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
  private readonly avatarKey = 'auth_avatar';

  private userSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  private avatarSubject = new BehaviorSubject<string | null>(this.getStoredAvatar());
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
    if (url) {
      localStorage.setItem(this.avatarKey, url);
    } else {
      localStorage.removeItem(this.avatarKey);
    }

    this.avatarSubject.next(url);
  }

  getStoredAvatar(): string | null {
    return localStorage.getItem(this.avatarKey);
  }

  clearAvatar(): void {
    localStorage.removeItem(this.avatarKey);
    this.avatarSubject.next(null);
  }

  logout(): void {
    this.clearToken();
    this.clearUser();
    this.clearAvatar();
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
