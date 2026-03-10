import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { CartService } from '../../cart/cart.service';
import { AuthService } from '../../auth/auth.service';
import { Product } from '../models/product.model';
import { UserRole } from '../../auth/models/user.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  addingToCartId: string | null = null;
  addedToCartId: string | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getProducts(this.searchTerm || undefined).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load products';
        this.loading = false;
      },
    });
  }

  onSearch() {
    this.loadProducts();
  }

  isCustomer(): boolean {
    const user = this.authService['currentUserSubject']?.value;
    return !!user?.roles.includes(UserRole.CUSTOMER);
  }

  addToCart(event: Event, product: Product) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/products' },
      });
      return;
    }

    if (!this.isCustomer()) return;

    this.addingToCartId = product.id;
    this.cartService
      .addToCart({ productId: product.id, quantity: 1 })
      .subscribe({
        next: () => {
          this.addingToCartId = null;
          this.addedToCartId = product.id;
          setTimeout(() => (this.addedToCartId = null), 2500);
        },
        error: () => {
          this.addingToCartId = null;
        },
      });
  }
}
