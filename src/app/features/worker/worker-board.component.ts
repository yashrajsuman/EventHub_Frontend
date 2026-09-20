import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventApiService, Gig } from '../../core/api/event-api.service';
import { AuthService } from '../../core/api/auth.service';

@Component({ selector: 'app-worker-board', standalone: true, imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe, RouterLink], templateUrl: './worker-board.component.html', styleUrl: './worker-board.component.css' })
export class WorkerBoardComponent implements OnInit {
  gigs: Gig[] = []; loading = true; submitting = false; registrationComplete = false; notice = ''; selectedGig?: Gig; registeredGigIds = new Set<number>();
  dateFilter: 'all' | 'today' | 'tomorrow' = 'all';
  payOrder: 'default' | 'low' | 'high' = 'default';
  constructor(private readonly api: EventApiService, public readonly auth: AuthService, private readonly router: Router) { }

  ngOnInit() { this.load(); if (this.auth.state.value) this.api.myRegistrationIds().subscribe({ next: ids => this.registeredGigIds = new Set(ids) }); }
  load() { this.loading = true; this.api.list().subscribe({ next: gigs => { this.gigs = gigs; this.loading = false; }, error: () => { this.notice = 'Unable to load gigs. Please try again shortly.'; this.loading = false; } }); }
  get filteredGigs() {
    const today = this.dateKey(new Date()); const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const target = this.dateFilter === 'today' ? today : this.dateKey(tomorrowDate);
    const filtered = this.gigs.filter(gig => this.dateFilter === 'all' || this.dateKey(new Date(gig.startsAt)) === target);
    return filtered.sort((a, b) => this.payOrder === 'low' ? a.dailyPay - b.dailyPay : this.payOrder === 'high' ? b.dailyPay - a.dailyPay : a.startsAt.localeCompare(b.startsAt));
  }
  private dateKey(date: Date) { return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; }
  choose(gig: Gig) { this.selectedGig = gig; this.submitting = false; this.registrationComplete = false; }
  close() { this.selectedGig = undefined; this.registrationComplete = false; }
  register() {
    if (!this.selectedGig || this.submitting) return;
    if (!this.auth.state.value) { this.router.navigateByUrl('/auth'); return; }
    this.submitting = true;
    this.auth.profile().subscribe({
      next: profile => {
        if (!profile.profileComplete) { this.submitting = false; this.router.navigateByUrl('/profile'); return; }
        this.api.register(this.selectedGig!.id).subscribe({
          next: updated => { this.gigs = this.gigs.map(g => g.id === updated.id ? updated : g); this.registeredGigIds.add(updated.id); this.submitting = false; this.registrationComplete = true; },
          error: err => { this.notice = err.error?.message ?? 'Registration could not be completed.'; this.submitting = false; }
        });
      },
      error: () => { this.submitting = false; this.notice = 'Unable to verify your profile. Please sign in again.'; }
    });
  }
}
