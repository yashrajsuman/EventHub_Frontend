import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../src/environments/environment';
import { AuthService } from './auth.service';

export interface Gig { id: number; title: string; description: string; venue: string; startsAt: string; capacity: number; numberOfDays: number; dailyPay: number; registeredCount: number; spotsLeft: number; }
export interface CreateGig { title: string; description: string; venue: string; startsAt: string; capacity: number; numberOfDays: number; dailyPay: number; }
export interface RegistrationData { name: string; email: string; phoneNumber: string; age: number; gender: string; location: string; height: number; weight: number; education: string; experience: string; picture: string; }
export interface AdminGig extends Gig { registrations: RegistrationData[]; }

@Injectable({ providedIn: 'root' })
export class EventApiService {
  private readonly baseUrl = environment.apiUrl;
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}
  list() { return this.http.get<Gig[]>(`${this.baseUrl}/gigs`); }
  myRegistrationIds() { return this.http.get<number[]>(`${this.baseUrl}/gigs/registrations/mine`, { headers: this.auth.headers() }); }
  verifyAdmin(username: string, password: string) { return this.http.get(`${this.baseUrl}/admin/session`, { headers: this.adminHeaders(username, password), observe: 'response' }); }
  create(gig: CreateGig, username: string, password: string) { return this.http.post<Gig>(`${this.baseUrl}/admin/gigs`, gig, { headers: this.adminHeaders(username, password) }); }
  listForAdmin(username: string, password: string) { return this.http.get<AdminGig[]>(`${this.baseUrl}/admin/gigs`, { headers: this.adminHeaders(username, password) }); }
  update(gigId: number, gig: CreateGig, username: string, password: string) { return this.http.put<Gig>(`${this.baseUrl}/admin/gigs/${gigId}`, gig, { headers: this.adminHeaders(username, password) }); }
  delete(gigId: number, username: string, password: string) { return this.http.delete(`${this.baseUrl}/admin/gigs/${gigId}`, { headers: this.adminHeaders(username, password) }); }
  register(gigId: number) { return this.http.post<Gig>(`${this.baseUrl}/gigs/${gigId}/registrations`, {}, { headers: this.auth.headers() }); }
  private adminHeaders(username: string, password: string) { return new HttpHeaders({ Authorization: `Basic ${btoa(`${username}:${password}`)}` }); }
}
