import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';

@Component({
  standalone: false,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  form!: FormGroup;
  submitting = false;
  submitted  = false;
  submitError = '';

  subjects = [
    'General Enquiry', 'Ticket Support', 'Group / Corporate Booking',
    'Lost & Found', 'Feedback', 'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:    ['', [Validators.required, Validators.minLength(2)]],
      phone:   ['', [Validators.required, Validators.pattern('^[0-9+\\-\\s]{7,15}$')]],
      email:   ['', [Validators.email]],
      subject: ['General Enquiry'],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
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
      next: () => { this.submitting = false; this.submitted = true; this.form.reset(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
      error: () => { this.submitting = false; this.submitError = 'Something went wrong. Please try again.'; }
    });
  }

  resetForm(): void { this.submitted = false; this.form.reset(); }
}
