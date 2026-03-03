import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthUser } from '../models/authUser';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'auth_user';

  private userSubject = new BehaviorSubject<AuthUser | null>(
    this.getUserFromStorage()
  );
  user$ = this.userSubject.asObservable();

  private apiUrl = 'http://localhost:3000/login';

  constructor(private http: HttpClient) {}

  /** LOGIN */
  login(
    email: string,
    password: string
  ): Observable<{ message: string; praticien: AuthUser }> {
    return this.http
      .post<{ message: string; praticien: AuthUser }>(this.apiUrl, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          this.setUser(res.praticien);
        })
      );
  }

  /** LOGOUT */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.userSubject.next(null);
  }

  /** SET USER */
  private setUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.userSubject.next(user);
  }

  /** GET USER (mémoire prioritaire) */
  getUser(): AuthUser | null {
    return this.userSubject.value;
  }

  /** GET USER depuis storage */
  private getUserFromStorage(): AuthUser | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? (JSON.parse(data) as AuthUser) : null;
  }

  /** CONNECTÉ ? */
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }
}
