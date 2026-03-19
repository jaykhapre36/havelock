import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingStateService } from '../booking-state.service';
import { AuthService } from '../../../services/auth.service';

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
  prefilled = false;

  constructor(
    private fb: FormBuilder,
    private stateService: BookingStateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const saved = this.stateService.snapshot.visitor;
    const user  = this.authService.getCurrentUser();

    const fullName = saved.fullName || user?.name  || '';
    const email    = saved.email    || user?.email || '';
    const phone    = saved.phone    || user?.phone || '';

    this.prefilled = true;

    this.form = this.fb.group({
      fullName: [{ value: fullName, disabled: true }, [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email:    [{ value: email,    disabled: true }, [Validators.required, Validators.email]],
      phone:    [{ value: phone,    disabled: true }, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]]
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
    this.stateService.patchState({ visitor: this.form.getRawValue() });
    this.next.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
