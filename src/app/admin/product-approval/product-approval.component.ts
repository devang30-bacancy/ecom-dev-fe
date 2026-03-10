import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../products/product.service';
import { Product, ProductStatus } from '../../products/models/product.model';

@Component({
  selector: 'app-product-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-approval.component.html',
  styleUrls: ['./product-approval.component.scss'],
})
export class ProductApprovalComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  success = '';
  ProductStatus = ProductStatus;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getAllProducts().subscribe({
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

  approveProduct(id: string) {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.productService.approveProduct(id).subscribe({
      next: () => {
        this.success = 'Product approved successfully!';
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to approve product';
        this.loading = false;
      },
    });
  }

  rejectProduct(id: string) {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.productService.rejectProduct(id).subscribe({
      next: () => {
        this.success = 'Product rejected successfully!';
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to reject product';
        this.loading = false;
      },
    });
  }

  toggleProductStatus(id: string) {
    this.loading = true;
    this.error = '';
    this.success = '';
    this.productService.toggleProductStatus(id).subscribe({
      next: () => {
        this.success = 'Product status updated successfully!';
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update product status';
        this.loading = false;
      },
    });
  }
}
