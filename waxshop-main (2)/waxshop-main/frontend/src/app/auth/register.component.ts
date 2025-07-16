import {Component} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from './auth.service';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  loading = false;
  error: string | null = null;
  success: string | null = null;

  form;

  phonePattern = /^0[0-9]{9,10}$/;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {validators: this.passwordsMatch});
  }

  passwordsMatch(group: any) {
    return group.get('password')?.value === group.get('confirmPassword')?.value ? null : {notMatching: true};
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    this.success = null;
    const {name, phone, email, password} = this.form.value;
    this.auth.register(email!, password!, name!, phone!).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Registration successful! Please login.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.error || 'Registration failed';
      }
    });
  }
}
