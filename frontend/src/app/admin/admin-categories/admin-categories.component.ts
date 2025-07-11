import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, Category } from '../admin.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error = '';
  showModal = false;
  editingCategory: Category | null = null;
  categoryForm: FormGroup;
  toastMessage = '';

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.error = '';

    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.loading = false;
        console.error('Error loading categories:', err);
      }
    });
  }

  openCreateModal() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showModal = true;
  }

  openEditModal(category: Category) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;
      
      if (this.editingCategory) {
        // Update existing category
        this.adminService.updateCategory(this.editingCategory.id, categoryData).subscribe({
          next: (updatedCategory) => {
            const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
            if (index !== -1) {
              this.categories[index] = updatedCategory;
            }
            this.showToast('Category updated successfully');
            this.closeModal();
          },
          error: (err) => {
            this.showToast('Failed to update category');
            console.error('Error updating category:', err);
          }
        });
      } else {
        // Create new category
        this.adminService.createCategory(categoryData).subscribe({
          next: (newCategory) => {
            this.categories.push(newCategory);
            this.showToast('Category created successfully');
            this.closeModal();
          },
          error: (err) => {
            this.showToast('Failed to create category');
            console.error('Error creating category:', err);
          }
        });
      }
    }
  }

  deleteCategory(category: Category) {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.adminService.deleteCategory(category.id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== category.id);
          this.showToast('Category deleted successfully');
        },
        error: (err) => {
          this.showToast('Failed to delete category');
          console.error('Error deleting category:', err);
        }
      });
    }
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
} 