import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  showPassword = false;
  showConfirm = false;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      phone:    ['', [Validators.required, Validators.pattern('^[0-9+\\-\\s]{10,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm:  ['', Validators.required],
      agree:    [false, Validators.requiredTrue]
    }, { validators: this.passwordMatch });
  }

  passwordMatch(group: AbstractControl) {
    const pw = group.get('password')?.value;
    const cf = group.get('confirm')?.value;
    return pw === cf ? null : { mismatch: true };
  }

  f(field: string) { return this.form.get(field); }

  isInvalid(field: string): boolean {
    const ctrl = this.f(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  get mismatch(): boolean {
    return !!(this.form.errors?.['mismatch'] && this.f('confirm')?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    // Mock registration — navigate to login after 1s
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/auth/login']);
    }, 1000);
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirm(): void  { this.showConfirm  = !this.showConfirm;  }
}
