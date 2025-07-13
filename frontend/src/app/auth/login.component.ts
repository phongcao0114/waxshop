import {Component} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators, FormGroup} from '@angular/forms';
import {AuthService} from './auth.service';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import {ErrorHandlerService} from './error-handler.service';
import {catchError, finalize} from 'rxjs/operators';
import {of, Observable} from 'rxjs';
import {LoginResponse} from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Login form
  form: FormGroup;

  // Register form
  registerForm: FormGroup;
  registerLoading = false;
  registerError: string | null = null;
  registerSuccess: string | null = null;
  phonePattern = /^0[0-9]{9,10}$/;

  // UI state
  showRegister = false;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandlerService
  ) {
    // Login form
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    // Register form
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {validators: this.passwordsMatch});
  }

  // Password match validator for register form
  passwordsMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value ? null : {notMatching: true};
  }

  // Login submit
  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const {email, password} = this.form.value;
    this.auth.login(email!, password!).pipe(
      catchError((error: any) => {
        this.errorHandler.handleAuthError(error);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe((res: LoginResponse | null) => {
      if (res) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (res.user.role === 'ADMIN') {
          this.router.navigate([returnUrl || '/admin/dashboard']);
        } else {
          this.router.navigate([returnUrl || '/']);
        }
      }
    });
  }

  // Register submit
  submitRegister() {
    if (this.registerForm.invalid) return;
    this.registerLoading = true;
    this.registerError = null;
    this.registerSuccess = null;
    const {name, phone, email, password} = this.registerForm.value;
    this.auth.register(email!, password!, name!, phone!).subscribe({
      next: () => {
        this.registerLoading = false;
        this.registerSuccess = 'Registration successful! Please login.';
        setTimeout(() => {
          this.showRegister = false;
          this.registerForm.reset();
        }, 1500);
      },
      error: (err: any) => {
        this.registerLoading = false;
        this.registerError = err.error?.error || 'Registration failed';
      }
    });
  }

  // UI switch
  switchToRegister() {
    this.showRegister = true;
    this.error = null;
    this.success = null;
  }
  switchToLogin() {
    this.showRegister = false;
    this.registerError = null;
    this.registerSuccess = null;
  }

  // Clear error when user starts typing
  onInput() {
    if (this.error) {
      this.error = null;
    }
  }
}
