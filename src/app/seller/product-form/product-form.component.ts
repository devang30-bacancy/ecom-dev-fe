import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../products/product.service';
import { Category, CreateProductDto, UpdateProductDto } from '../../products/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  loading = false;
  error = '';
  success = '';
  isEditMode = false;
  productId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      images: [''],
    });
  }

  ngOnInit() {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = id;
      this.loadProduct(id);
    }
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
      },
    });
  }

  loadProduct(id: string) {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          images: product.images?.join(',') || '',
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load product';
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const formValue = this.productForm.value;
      const productData: CreateProductDto | UpdateProductDto = {
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        stock: formValue.stock,
        categoryId: formValue.categoryId,
        images: formValue.images ? formValue.images.split(',').map((url: string) => url.trim()) : [],
      };

      const request = this.isEditMode && this.productId
        ? this.productService.updateProduct(this.productId, productData)
        : this.productService.createProduct(productData as CreateProductDto);

      request.subscribe({
        next: () => {
          this.success = this.isEditMode ? 'Product updated successfully!' : 'Product created successfully!';
          setTimeout(() => {
            this.router.navigate(['/seller/products']);
          }, 1000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save product';
          this.loading = false;
        },
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

  goBack() {
    this.location.back();
  }
}
