import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminGig, EventApiService } from '../../core/api/event-api.service';

@Component({ selector: 'app-admin-portal', standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './admin-portal.component.html', styleUrl: './admin-portal.component.css' })
export class AdminPortalComponent {
  signedIn = false; notice = ''; events: AdminGig[] = []; editingId?: number; viewingRegistrations?: AdminGig;
  private credentials?: { username: string; password: string };
  readonly loginForm; readonly gigForm;
  constructor(private readonly api: EventApiService, fb: FormBuilder) {
    this.loginForm = fb.nonNullable.group({ username: ['', Validators.required], password: ['', Validators.required] });
    this.gigForm = fb.nonNullable.group({ title: ['', Validators.required], description: ['', Validators.required], venue: ['', Validators.required], startsAt: ['', Validators.required], capacity: [10, [Validators.required, Validators.min(1)]], numberOfDays: [1, [Validators.required, Validators.min(1)]], dailyPay: [1000, [Validators.required, Validators.min(1)] ] });
  }
  signIn() { if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; } const credentials = this.loginForm.getRawValue(); this.api.verifyAdmin(credentials.username, credentials.password).subscribe({ next: () => { this.credentials = credentials; this.signedIn = true; this.notice = ''; this.loadEvents(); }, error: () => this.notice = 'Invalid administrator username or password.' }); }
  loadEvents() { if (!this.credentials) return; this.api.listForAdmin(this.credentials.username, this.credentials.password).subscribe({ next: events => this.events = events, error: () => this.notice = 'Unable to load events.' }); }
  save() { if (this.gigForm.invalid || !this.credentials) { this.gigForm.markAllAsTouched(); return; } const gig = this.gigForm.getRawValue(); const request = this.editingId ? this.api.update(this.editingId, gig, this.credentials.username, this.credentials.password) : this.api.create(gig, this.credentials.username, this.credentials.password); request.subscribe({ next: saved => { this.notice = this.editingId ? `“${saved.title}” has been updated.` : `“${saved.title}” is now open to workers.`; this.cancelEdit(); this.loadEvents(); }, error: err => this.notice = err.error?.message ?? 'Unable to save this event.' }); }
  edit(event: AdminGig) { this.editingId = event.id; this.viewingRegistrations = undefined; this.gigForm.setValue({ title: event.title, description: event.description, venue: event.venue, startsAt: event.startsAt.slice(0, 16), capacity: event.capacity, numberOfDays: event.numberOfDays, dailyPay: event.dailyPay }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  cancelEdit() { this.editingId = undefined; this.gigForm.reset({ title: '', description: '', venue: '', startsAt: '', capacity: 10, numberOfDays: 1, dailyPay: 1000 }); }
  remove(event: AdminGig) { if (!this.credentials || !window.confirm(`Delete “${event.title}”? This also removes its registrations.`)) return; this.api.delete(event.id, this.credentials.username, this.credentials.password).subscribe({ next: () => { this.notice = `“${event.title}” has been deleted.`; if (this.viewingRegistrations?.id === event.id) this.viewingRegistrations = undefined; this.loadEvents(); }, error: () => this.notice = 'Unable to delete this event.' }); }
  showRegistrations(event: AdminGig) { this.viewingRegistrations = event; }
  signOut() { this.signedIn = false; this.credentials = undefined; this.events = []; this.editingId = undefined; this.viewingRegistrations = undefined; this.loginForm.reset({ username: '', password: '' }); this.cancelEdit(); }
}
