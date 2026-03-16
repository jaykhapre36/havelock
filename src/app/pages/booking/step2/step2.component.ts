import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingStateService } from '../booking-state.service';

@Component({
  standalone: false,
  selector: 'app-bk-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss']
})
export class Step2Component implements OnInit {

  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private stateService: BookingStateService
  ) {}

  ngOnInit(): void {
    const saved = this.stateService.snapshot.visitor;
    this.form = this.fb.group({
      fullName: [saved.fullName || '', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email:    [saved.email    || '', [Validators.required, Validators.email]],
      phone:    [saved.phone    || '', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]]
    });
  }

  f(field: string) { return this.form.get(field); }

  isInvalid(field: string): boolean {
    const ctrl = this.f(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.stateService.patchState({ visitor: this.form.value });
    this.next.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
