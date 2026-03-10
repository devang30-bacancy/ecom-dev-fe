import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { CartService } from './cart/cart.service';
import { User, UserRole } from './auth/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  cartItemCount = 0;
  private cartSub!: Subscription;
  private authSub!: Subscription;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.authSub = this.authService.isAuthenticated$.subscribe((auth) => {
      if (auth) {
        this.authService.currentUser$.subscribe((user) => {
          if (user?.roles.includes(UserRole.CUSTOMER)) {
            this.loadCart();
          }
        });
      } else {
        this.cartItemCount = 0;
      }
    });

    this.cartSub = this.cartService.cart$.subscribe((cart) => {
      this.cartItemCount = cart?.items?.length ?? 0;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  private loadCart(): void {
    this.cartService.loadCart().subscribe();
  }

  isCustomer(user: User | null): boolean {
    return !!user?.roles.includes(UserRole.CUSTOMER);
  }

  isSeller(user: User | null): boolean {
    return !!user?.roles.includes(UserRole.SELLER);
  }

  isAdmin(user: User | null): boolean {
    return !!user?.roles.includes(UserRole.ADMIN);
  }

  isShipper(user: User | null): boolean {
    return !!user?.roles.includes(UserRole.SHIPPER);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
