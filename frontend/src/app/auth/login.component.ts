import {Component} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from './auth.service';
import {Router, RouterLink, ActivatedRoute} from '@angular/router';
import {ErrorHandlerService} from './error-handler.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';

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

  form;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandlerService
  ) {
    // Move form initialization here to ensure fb is initialized
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = null;
    
    const {email, password} = this.form.value;
    
    this.auth.login(email!, password!).pipe(
      catchError(error => {
        // Let the error handler service handle the error display
        this.errorHandler.handleAuthError(error);
        return of(null);
      }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(res => {
      if (res) {
        // Get return URL from query params, or default based on role
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        
        if (res.user.role === 'ADMIN') {
          this.router.navigate([returnUrl || '/admin/dashboard']);
        } else {
          this.router.navigate([returnUrl || '/']);
        }
      }
    });
  }

  // Clear error when user starts typing
  onInput() {
    if (this.error) {
      this.error = null;
    }
  }
}
