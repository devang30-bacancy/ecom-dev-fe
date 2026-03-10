import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { CartService } from '../../cart/cart.service';
import { AuthService } from '../../auth/auth.service';
import { Product } from '../models/product.model';
import { UserRole } from '../../auth/models/user.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error = '';
  selectedImage = '';
  quantity = 1;
  addingToCart = false;
  cartSuccess = false;
  cartError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private location: Location,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    this.error = '';
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage =
          product.images && product.images.length > 0 ? product.images[0] : '';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load product';
        this.loading = false;
      },
    });
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  increaseQty() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  isCustomer(): boolean {
    const user = this.authService['currentUserSubject']?.value;
    return !!user?.roles.includes(UserRole.CUSTOMER);
  }

  isAuthenticated(): boolean {
    return !!this.authService.getAccessToken();
  }

  addToCart() {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    if (!this.isCustomer()) {
      this.cartError = 'Only customers can add items to cart.';
      return;
    }

    if (!this.product) return;

    this.addingToCart = true;
    this.cartError = '';
    this.cartSuccess = false;

    this.cartService
      .addToCart({ productId: this.product.id, quantity: this.quantity })
      .subscribe({
        next: () => {
          this.addingToCart = false;
          this.cartSuccess = true;
          setTimeout(() => (this.cartSuccess = false), 3000);
        },
        error: (err) => {
          this.cartError = err.error?.message || 'Failed to add to cart';
          this.addingToCart = false;
        },
      });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goBack() {
    this.location.back();
  }
}
