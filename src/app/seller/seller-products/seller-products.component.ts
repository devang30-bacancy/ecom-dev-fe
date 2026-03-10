import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../products/product.service';
import { Product } from '../../products/models/product.model';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './seller-products.component.html',
  styleUrls: ['./seller-products.component.scss'],
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  success = '';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getMyProducts().subscribe({
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

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.loading = true;
      this.error = '';
      this.success = '';
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.success = 'Product deleted successfully!';
          this.loadProducts();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to delete product';
          this.loading = false;
        },
      });
    }
  }
}
