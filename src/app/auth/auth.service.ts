import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of, share, finalize } from 'rxjs';
import { User, LoginResponse, RefreshTokenResponse } from './models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private accessTokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private refreshTokenRequest$: Observable<RefreshTokenResponse | null> | null = null;

  public accessToken$ = this.accessTokenSubject.asObservable();
  public refreshToken$ = this.refreshTokenSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadTokensFromStorage();
    this.checkAuthStatus();
  }

  register(email: string, password: string, roles?: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, {
      email,
      password,
      roles,
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, {
      email,
    });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, {
      token,
      password,
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    }).pipe(
      tap((response) => {
        this.setTokens(response.accessToken, response.refreshToken);
        this.setCurrentUser(response.user);
        this.isAuthenticated$.next(true);
      }),
    );
  }

  refreshToken(): Observable<RefreshTokenResponse | null> {
    const refreshToken = this.refreshTokenSubject.value;
    if (!refreshToken) {
      return of(null);
    }

    if (this.refreshTokenRequest$) {
      return this.refreshTokenRequest$;
    }

    this.refreshTokenRequest$ = this.http
      .post<RefreshTokenResponse>(`${this.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          this.setTokens(response.accessToken, response.refreshToken);
        }),
        catchError(() => {
          this.logout();
          return of(null);
        }),
        finalize(() => {
          this.refreshTokenRequest$ = null;
        }),
        share()
      );

    return this.refreshTokenRequest$;
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        this.clearAuth();
        this.router.navigate(['/login']);
        return of(null);
      }),
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.setCurrentUser(user);
      }),
    );
  }

  getAccessToken(): string | null {
    return this.accessTokenSubject.value;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessTokenSubject.next(accessToken);
    this.refreshTokenSubject.next(refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    this.isAuthenticated$.next(true);
  }

  private setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private loadTokensFromStorage() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const currentUser = localStorage.getItem('currentUser');

    if (accessToken) {
      this.accessTokenSubject.next(accessToken);
    }
    if (refreshToken) {
      this.refreshTokenSubject.next(refreshToken);
    }
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        this.currentUserSubject.next(user);
        this.isAuthenticated$.next(true);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
  }

  private checkAuthStatus() {
    const accessToken = this.accessTokenSubject.value;
    const refreshToken = this.refreshTokenSubject.value;

    if (!accessToken && refreshToken) {
      this.refreshToken().subscribe({
        next: (response) => {
          if (response) {
            this.getCurrentUser().subscribe();
          } else {
            this.clearAuth();
          }
        },
        error: () => {
          this.clearAuth();
        },
      });
    } else if (accessToken) {
      this.getCurrentUser().subscribe({
        error: () => {
          // Interceptor handles 401s and refreshes or logs out
        }
      });
    }
  }

  private clearAuth() {
    this.accessTokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticated$.next(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }
}

