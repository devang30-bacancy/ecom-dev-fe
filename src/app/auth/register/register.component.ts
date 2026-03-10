import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserRole } from '../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  UserRole = UserRole;
  availableRoles = [UserRole.CUSTOMER, UserRole.SELLER, UserRole.ADMIN];
  selectedRoles: UserRole[] = [UserRole.CUSTOMER];
  error = '';
  success = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      roles: [[UserRole.CUSTOMER], [Validators.required]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  passwordsDoNotMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword;
  }

  isRoleSelected(role: UserRole): boolean {
    return this.selectedRoles.includes(role);
  }

  getRoleLabel(role: UserRole): string {
    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  toggleRole(role: UserRole) {
    const index = this.selectedRoles.indexOf(role);
    if (index > -1) {
      this.selectedRoles.splice(index, 1);
    } else {
      this.selectedRoles.push(role);
    }
    this.registerForm.patchValue({ roles: this.selectedRoles });
    this.registerForm.get('roles')?.markAsTouched();
  }

  onSubmit() {
    if (this.registerForm.valid && !this.passwordsDoNotMatch() && this.selectedRoles.length > 0) {
      const { email, password } = this.registerForm.value;
      this.loading = true;
      this.error = '';
      this.success = '';

      this.authService.register(email, password, this.selectedRoles).subscribe({
        next: () => {
          this.success = 'Registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed. Please try again.';
          this.loading = false;
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}

