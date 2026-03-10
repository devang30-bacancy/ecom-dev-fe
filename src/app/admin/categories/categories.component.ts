import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../products/product.service';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../products/models/product.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  editingCategory: Category | null = null;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required]],
      slug: [''],
      isActive: [true],
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load categories';
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const formValue = this.categoryForm.value;
      const categoryData: CreateCategoryDto | UpdateCategoryDto = {
        name: formValue.name,
        slug: formValue.slug,
        isActive: formValue.isActive,
      };

      const request = this.editingCategory
        ? this.productService.updateCategory(this.editingCategory.id, categoryData as UpdateCategoryDto)
        : this.productService.createCategory(categoryData as CreateCategoryDto);

      request.subscribe({
        next: () => {
          this.success = this.editingCategory ? 'Category updated successfully!' : 'Category created successfully!';
          this.categoryForm.reset({ isActive: true });
          this.editingCategory = null;
          this.loadCategories();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to save category';
          this.loading = false;
        },
      });
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
    });
  }

  cancelEdit() {
    this.editingCategory = null;
    this.categoryForm.reset({ isActive: true });
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.productService.deleteCategory(id).subscribe({
        next: () => {
          this.success = 'Category deleted successfully!';
          this.loadCategories();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to delete category';
        },
      });
    }
  }
}
