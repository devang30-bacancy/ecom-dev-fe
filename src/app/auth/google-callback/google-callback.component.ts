import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-callback.component.html',
  styleUrls: ['./google-callback.component.scss'],
})
export class GoogleCallbackComponent implements OnInit {
  loading = true;
  error = '';
  errorCode = '';
  isEmailConflictError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const accessToken = params['accessToken'];
      const refreshToken = params['refreshToken'];
      const error = params['error'];
      const errorCode = params['errorCode'];

      if (error) {
        this.handleError(error, errorCode);
      } else if (accessToken && refreshToken) {
        this.handleGoogleCallback(accessToken, refreshToken);
      } else {
        this.error = 'Invalid callback parameters. Please try again.';
        this.loading = false;
      }
    });
  }

  private handleError(errorMessage: string, errorCode: string) {
    this.loading = false;
    this.error = decodeURIComponent(errorMessage);
    this.errorCode = errorCode;

    if (
      this.error.toLowerCase().includes('email already exists') ||
      this.error.toLowerCase().includes('different provider') ||
      errorCode === '409'
    ) {
      this.isEmailConflictError = true;
    }
  }

  private handleGoogleCallback(accessToken: string, refreshToken: string) {
    try {
      this.authService.setTokens(accessToken, refreshToken);
      this.authService.getCurrentUser().subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = 'Failed to retrieve user information. Please try again.';
          this.loading = false;
          console.error('Error fetching user:', err);
        },
      });
    } catch (error) {
      this.error = 'Failed to process login. Please try again.';
      this.loading = false;
      console.error('Error processing callback:', error);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}

