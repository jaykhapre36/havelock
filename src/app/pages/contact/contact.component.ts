import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { ParkInfoService } from '../../services/park-info.service';
import { ParkInfo } from '../../models/park-info.model';

@Component({
  standalone: false,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  form!: FormGroup;
  parkInfo: ParkInfo | null = null;
  submitting = false;
  submitted  = false;
  submitError = '';

  subjects = [
    'General Enquiry', 'Ticket Support', 'Group / Corporate Booking',
    'Lost & Found', 'Feedback', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private parkInfoService: ParkInfoService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:    ['', [Validators.required, Validators.minLength(2)]],
      email:   ['', [Validators.required, Validators.email]],
      phone:   ['', [Validators.pattern('^[0-9+\\-\\s]{7,15}$')]],
      subject: ['General Enquiry'],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.parkInfoService.getParkInfo().subscribe(data => this.parkInfo = data);
  }

  f(field: string) { return this.form.get(field); }

  isInvalid(field: string): boolean {
    const ctrl = this.f(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    this.submitError = '';
    this.contactService.submitForm(this.form.value).subscribe({
      next: () => { this.submitting = false; this.submitted = true; this.form.reset(); },
      error: ()  => { this.submitting = false; this.submitError = 'Something went wrong. Please try again.'; }
    });
  }

  resetForm(): void { this.submitted = false; this.form.reset(); }

  getWhatsappUrl(number: string): string {
    return 'https://wa.me/' + number.replace(/\D/g, '');
  }
}
