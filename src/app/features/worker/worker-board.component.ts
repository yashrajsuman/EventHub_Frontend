import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventApiService, Gig } from '../../core/api/event-api.service';

@Component({ selector: 'app-worker-board', standalone: true, imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe, CurrencyPipe, RouterLink], templateUrl: './worker-board.component.html', styleUrl: './worker-board.component.css' })
export class WorkerBoardComponent implements OnInit {
  gigs: Gig[] = []; loading = true; submitting = false; registrationComplete = false; notice = ''; selectedGig?: Gig; picturePreview = ''; pictureError = '';
  dateFilter: 'all' | 'today' | 'tomorrow' = 'all';
  payOrder: 'default' | 'low' | 'high' = 'default';
  readonly registrationForm;

  constructor(private readonly api: EventApiService, fb: FormBuilder) {
    this.registrationForm = fb.nonNullable.group({
      name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+() -]{7,20}$/)]],
      age: [18, [Validators.required, Validators.min(1)]], gender: ['', Validators.required], location: ['', Validators.required], height: [0, [Validators.required, Validators.min(1)]],
      weight: [0, [Validators.required, Validators.min(1)]], education: ['', Validators.required], experience: ['', Validators.required], picture: ['', Validators.required]
    });
  }

  ngOnInit() { this.load(); }
  load() { this.loading = true; this.api.list().subscribe({ next: gigs => { this.gigs = gigs; this.loading = false; }, error: () => { this.notice = 'Unable to load gigs. Please try again shortly.'; this.loading = false; } }); }
  get filteredGigs() {
    const today = this.dateKey(new Date()); const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const target = this.dateFilter === 'today' ? today : this.dateKey(tomorrowDate);
    const filtered = this.gigs.filter(gig => this.dateFilter === 'all' || this.dateKey(new Date(gig.startsAt)) === target);
    return filtered.sort((a, b) => this.payOrder === 'low' ? a.dailyPay - b.dailyPay : this.payOrder === 'high' ? b.dailyPay - a.dailyPay : a.startsAt.localeCompare(b.startsAt));
  }
  private dateKey(date: Date) { return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; }
  choose(gig: Gig) { this.selectedGig = gig; this.submitting = false; this.registrationComplete = false; this.picturePreview = ''; this.pictureError = ''; this.registrationForm.reset({ name: '', email: '', phoneNumber: '', age: 18, gender: '', location: '', height: 0, weight: 0, education: '', experience: '', picture: '' }); }
  close() { this.selectedGig = undefined; this.registrationComplete = false; }
  isInvalid(field: string) { const control = this.registrationForm.get(field); return !!control && control.invalid && control.touched; }
  fieldError(field: string) {
    const control = this.registrationForm.get(field);
    if (!control?.invalid || !control.touched) return '';
    const label = ({ name: 'Full name', email: 'Email address', phoneNumber: 'Phone number', age: 'Age', gender: 'Gender', location: 'Location', height: 'Height', weight: 'Weight', education: 'Education', experience: 'Experience', picture: 'Profile picture' } as Record<string, string>)[field];
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('pattern')) return 'Enter a valid phone number.';
    if (control.hasError('min')) return `${label} must be greater than zero.`;
    return `${label} is required.`;
  }
  onPictureSelected(event: Event) {
    const picture = (event.target as HTMLInputElement).files?.[0]; this.pictureError = '';
    if (!picture) return;
    if (!picture.type.startsWith('image/')) { this.clearPicture(); this.pictureError = 'Please choose an image file.'; return; }
    if (picture.size > 2_000_000) { this.clearPicture(); this.pictureError = 'Please choose an image smaller than 2 MB.'; return; }
    const reader = new FileReader();
    reader.onload = () => { const image = String(reader.result); this.picturePreview = image; this.registrationForm.controls.picture.setValue(image); this.registrationForm.controls.picture.markAsTouched(); };
    reader.readAsDataURL(picture);
  }
  private clearPicture() { this.picturePreview = ''; this.registrationForm.controls.picture.setValue(''); this.registrationForm.controls.picture.markAsTouched(); }
  register() {
    if (!this.selectedGig || this.submitting) return;
    if (this.registrationForm.invalid) { this.registrationForm.markAllAsTouched(); return; }
    this.submitting = true;
    this.api.register(this.selectedGig.id, this.registrationForm.getRawValue()).subscribe({
      next: updated => { this.gigs = this.gigs.map(g => g.id === updated.id ? updated : g); this.submitting = false; this.registrationComplete = true; },
      error: err => { this.notice = err.error?.message ?? 'Registration could not be completed.'; this.submitting = false; }
    });
  }
}
