import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, UserRole } from '../auth/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  hasAdminRole$!: Observable<boolean>;
  hasSellerRole$!: Observable<boolean>;
  hasCustomerRole$!: Observable<boolean>;
  currentUser$!: Observable<User | null>;
  sidebarOpen = true;
  UserRole = UserRole; // Expose enum to template

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.currentUser$ = this.authService.currentUser$;
    this.hasAdminRole$ = this.authService.currentUser$.pipe(
      map((user) => user?.roles.includes(UserRole.ADMIN) || false),
    );
    this.hasSellerRole$ = this.authService.currentUser$.pipe(
      map((user) => user?.roles.includes(UserRole.SELLER) || false),
    );
    this.hasCustomerRole$ = this.authService.currentUser$.pipe(
      map((user) => user?.roles.includes(UserRole.CUSTOMER) || false),
    );
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  hasRole(user: User | null, role: UserRole): boolean {
    return user?.roles.includes(role) || false;
  }
}

