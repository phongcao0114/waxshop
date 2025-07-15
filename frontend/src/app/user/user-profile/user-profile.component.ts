import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
}

interface UserProfileUpdate {
  name: string;
  phone: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = false;
  saving = false;
  error = '';
  success = '';
  
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  showPasswordSection = false;
  phonePattern = /^0[0-9]{9,10}$/;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.error = '';
    
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<UserProfile>(`${environment.backendUrl}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          name: profile.name,
          phone: profile.phone
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile.';
        this.loading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;
    
    this.saving = true;
    this.error = '';
    this.success = '';
    
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const updateData: UserProfileUpdate = this.profileForm.value;
    
    this.http.put<UserProfile>(`${environment.backendUrl}/api/users/profile`, updateData, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.success = 'Profile updated successfully!';
        this.saving = false;
        
        // Update the user data in auth service if needed
        this.auth.user$.subscribe(currentUser => {
          if (currentUser) {
            // Update the stored user data with new profile info
            const updatedUser = { ...currentUser, name: updatedProfile.name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        });
        
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to update profile. Please try again.';
        this.saving = false;
        console.error('Error updating profile:', err);
      }
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;
    
    this.saving = true;
    this.error = '';
    this.success = '';
    
    const { currentPassword, newPassword } = this.passwordForm.value;
    
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.put(`${environment.backendUrl}/api/users/profile/password`, {
      currentPassword,
      newPassword
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => {
        this.success = 'Password updated successfully!';
        this.passwordForm.reset();
        this.showPasswordSection = false;
        this.saving = false;
        
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update password. Please check your current password.';
        this.saving = false;
        console.error('Error updating password:', err);
      }
    });
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  togglePasswordSection() {
    this.showPasswordSection = !this.showPasswordSection;
    if (this.showPasswordSection) {
      this.passwordForm.reset();
    }
  }

  clearMessages() {
    this.error = '';
    this.success = '';
  }

  onFormInput() {
    this.clearMessages();
  }
} 