import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../cart.service';
import { Cart, CartItem } from '../models/cart.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss'],
})
export class CartPageComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  loading = false;
  updatingItemId: string | null = null;
  error = '';
  private sub!: Subscription;

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.isAuthenticated$.subscribe((auth) => {
      if (auth) {
        this.loadCart();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load cart';
        this.loading = false;
      },
    });
  }

  getSubtotal(item: CartItem): number {
    return Number(item.priceSnapshot) * item.quantity;
  }

  getCartTotal(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce(
      (sum, item) => sum + this.getSubtotal(item),
      0,
    );
  }

  getTotalItems(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) {
      this.removeItem(item);
      return;
    }
    this.updateQuantity(item, item.quantity - 1);
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  updateQuantity(item: CartItem, quantity: number): void {
    this.updatingItemId = item.id;
    this.cartService
      .updateCartItem({ productId: item.productId, quantity })
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.updatingItemId = null;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update item';
          this.updatingItemId = null;
        },
      });
  }

  removeItem(item: CartItem): void {
    this.updatingItemId = item.id;
    this.cartService.removeFromCart(item.productId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.updatingItemId = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to remove item';
        this.updatingItemId = null;
      },
    });
  }

  clearCart(): void {
    this.loading = true;
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to clear cart';
        this.loading = false;
      },
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  getProductImage(item: CartItem): string {
    return item.product?.images?.[0] || '';
  }
}
