import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, UserProfile } from '../admin.service';
import { AdminStatsRefreshService } from '../../shared/admin-stats-refresh.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AdminUsersComponent implements OnInit {
  users: UserProfile[] = [];
  userForm: FormGroup;
  loading = true;
  saving = false;
  error = '';
  toastMessage = '';
  showModal = false;
  editingUser: UserProfile | null = null;

  phonePattern = /^0[0-9]{9,10}$/;

  constructor(
    private adminService: AdminService, 
    private fb: FormBuilder,
    private statsRefresh: AdminStatsRefreshService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['USER', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadUsers();
    
    // Listen to email changes to trigger validation
    this.userForm.get('email')?.valueChanges.subscribe((email) => {
      if (email && !this.editingUser) {
        const emailExists = this.checkEmailExists(email);
        const emailControl = this.userForm.get('email');
        if (emailExists) {
          emailControl?.setErrors({ ...emailControl.errors, emailExists: true });
        } else {
          // Remove emailExists error but keep other validations
          const errors = emailControl?.errors;
          if (errors) {
            delete errors['emailExists'];
            emailControl?.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      }
    });
  }

  // Check if email already exists in the current users list
  checkEmailExists(email: string): boolean {
    if (!email || this.editingUser) return false;
    return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Custom validator for email existence
  emailExistsValidator() {
    return (control: any) => {
      if (!control.value) return null;
      return this.checkEmailExists(control.value) ? { emailExists: true } : null;
    };
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Error loading users:', err);
      }
    });
  }

  showAddUserForm() {
    this.editingUser = null;
    
    // Restore password validators when adding new user
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
      phone: ''
    });
    this.showModal = true;
  }

  editUser(user: UserProfile) {
    this.editingUser = user;
    
    // Clear password validators when editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '', // Don't show password when editing
      confirmPassword: '', // Don't show confirm password when editing
      role: user.role,
      phone: user.phone || ''
    });
    this.showModal = true;
  }

  saveUser() {
    if (this.userForm.valid) {
      this.saving = true;
      const userData = this.userForm.value;
      
      if (this.editingUser) {
        // Update existing user
        this.adminService.updateUser(this.editingUser.id, userData).subscribe({
          next: (updatedUser) => {
            const index = this.users.findIndex(u => u.id === this.editingUser!.id);
            if (index !== -1) {
              this.users[index] = updatedUser;
            }
            this.showToast('User updated successfully');
            this.closeModal();
            this.statsRefresh.triggerRefresh();
            this.saving = false;
          },
          error: (err) => {
            this.showToast('Failed to update user');
            console.error('Error updating user:', err);
            this.saving = false;
          }
        });
      } else {
        // Create new user
        this.adminService.registerAdmin(userData).subscribe({
          next: (newUser) => {
            // Convert User to UserProfile for display
            // const userProfile: UserProfile = {
            //   id: newUser.id,
            //   email: newUser.email,
            //   name: newUser.name,
            //   role: newUser.role,
            //   phone: userData.phone
            // };
            // this.users.push(userProfile);
            this.loadUsers();
            this.showToast('User created successfully');
            this.closeModal();
            this.statsRefresh.triggerRefresh();
            this.saving = false;
          },
          error: (err) => {
            this.saving = false;
            // Handle specific error messages from backend
            const errorMessage = err.error?.error || 'Failed to create user';
            this.showToast(errorMessage);
            console.error('Error creating user:', err);
          }
        });
      }
    }
  }

  deleteUser(user: UserProfile) {
    if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.showToast('User deleted successfully');
          this.statsRefresh.triggerRefresh();
        },
        error: (err) => {
          this.showToast('Failed to delete user');
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
    
    // Restore password validators when closing modal
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.userForm.get('confirmPassword')?.updateValueAndValidity();
    
    this.userForm.reset();
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  getRoleClass(role: string): string {
    return role === 'ADMIN' ? 'role-admin' : 'role-user';
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
} 