import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  error = '';
  success = '';
  loading = false;
  resetToken: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const { email } = this.forgotPasswordForm.value;
      this.loading = true;
      this.error = '';
      this.success = '';
      this.resetToken = null;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.success = response.message;
          if (response.resetToken) {
            this.resetToken = response.resetToken;
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to send reset token. Please try again.';
          this.loading = false;
        },
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}

