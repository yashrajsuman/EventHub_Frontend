import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthState { token: string; email: string; emailVerified: boolean; profileComplete: boolean; }
export interface UserProfile { email: string; emailVerified: boolean; profileComplete: boolean; name: string; phoneNumber: string; age: number; gender: string; location: string; height: number; weight: number; education: string; experience: string; picture: string; aadhaarDocument: string; }
interface AuthResponse extends AuthState { }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiUrl;
  private readonly stored = localStorage.getItem('eventhub-session');
  readonly state = new BehaviorSubject<AuthState | null>(this.stored ? JSON.parse(this.stored) : null);
  constructor(private readonly http: HttpClient) {}
  signUp(data: { email: string; password: string; termsAccepted: boolean }) { return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signup`, data); }
  verifyOtp(email: string, otp: string) { return this.http.post<AuthResponse>(`${this.baseUrl}/auth/verify-otp`, { email, otp }).pipe(tap(r => this.store(r))); }
  signIn(email: string, password: string) { return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signin`, { email, password }).pipe(tap(r => { if (r.token) this.store(r); })); }
  forgotPassword(email: string) { return this.http.post<{ message: string }>(`${this.baseUrl}/auth/forgot-password`, { email }); }
  resetPassword(email: string, otp: string, password: string) { return this.http.post<{ message: string }>(`${this.baseUrl}/auth/reset-password`, { email, otp, password }); }
  profile() { return this.http.get<UserProfile>(`${this.baseUrl}/auth/profile`, { headers: this.headers() }).pipe(tap(p => { const current = this.state.value; if (current) this.store({ ...current, profileComplete: p.profileComplete }); })); }
  saveProfile(profile: Omit<UserProfile, 'email' | 'emailVerified' | 'profileComplete'>) { return this.http.put<UserProfile>(`${this.baseUrl}/auth/profile`, profile, { headers: this.headers() }).pipe(tap(p => { const current = this.state.value; if (current) this.store({ ...current, profileComplete: p.profileComplete }); })); }
  headers() { return new HttpHeaders({ Authorization: `Bearer ${this.state.value?.token ?? ''}` }); }
  signOut() { localStorage.removeItem('eventhub-session'); this.state.next(null); }
  private store(r: AuthState) { const value = { token: r.token, email: r.email, emailVerified: r.emailVerified, profileComplete: r.profileComplete }; localStorage.setItem('eventhub-session', JSON.stringify(value)); this.state.next(value); }
}
