import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, Product, Category } from '../admin.service';
import { environment } from '../../environment';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  showModal = false;
  editingProduct: Product | null = null;
  productForm: FormGroup;
  toastMessage = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';

    // Load categories first
    this.adminService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Load products from the API
        this.adminService.getProducts().subscribe({
          next: (products) => {
            // Ensure categoryId is set for each product from nested category if present
            this.products = products.map(p => ({
              ...p,
              categoryId: p.categoryId ?? (p.category ? p.category.id : undefined)
            }));
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to load products';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedImage = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      categoryId: product.categoryId
    });
    this.imagePreview = product.imageUrl;
    this.selectedImage = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedImage = null;
    this.imagePreview = null;
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      // Ensure correct types for backend
      productData.categoryId = Number(productData.categoryId);
      productData.price = Number(productData.price);
      productData.stock = Number(productData.stock);
      const formData = new FormData();
      // Add product data as Blob with application/json type
      const dtoBlob = new Blob([JSON.stringify(productData)], { type: 'application/json' });
      formData.append('dto', dtoBlob);
      // Add image if selected
      if (this.selectedImage) {
        formData.append('imageFile', this.selectedImage);
      }
      if (this.editingProduct) {
        // Update existing product
        this.adminService.updateProduct(this.editingProduct.id, formData).subscribe({
          next: (updatedProduct) => {
            // Ensure categoryId is set from the category object if not present
            const productWithCategoryId = {
              ...updatedProduct,
              categoryId: updatedProduct.categoryId ?? (updatedProduct.category ? updatedProduct.category.id : undefined)
            };
            const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
            if (index !== -1) {
              this.products[index] = productWithCategoryId;
            }
            this.showToast('Product updated successfully');
            this.closeModal();
          },
          error: (err) => {
            this.showToast('Failed to update product');
            console.error('Error updating product:', err);
          }
        });
      } else {
        // Create new product
        this.adminService.createProduct(formData).subscribe({
          next: (newProduct) => {
            // Ensure categoryId is set from the category object if not present
            const productWithCategoryId = {
              ...newProduct,
              categoryId: newProduct.categoryId ?? (newProduct.category ? newProduct.category.id : undefined)
            };
            this.products.push(productWithCategoryId);
            this.showToast('Product created successfully');
            this.closeModal();
          },
          error: (err) => {
            this.showToast('Failed to create product');
            console.error('Error creating product:', err);
          }
        });
      }
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.adminService.deleteProduct(product.id).subscribe({
        next: (res: any) => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.showToast(res && res.message ? res.message : 'Product deleted successfully');
        },
        error: (err) => {
          let msg = 'Failed to delete product';
          if (err && err.error && err.error.error) {
            msg = err.error.error;
          } else if (err && err.error && err.error.message) {
            msg = err.error.message;
          }
          this.showToast(msg);
          console.error('Error deleting product:', err);
        }
      });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  getCategoryNameForProduct(product: Product): string {
    // First try to get category name from the categories list using categoryId
    if (product.categoryId) {
      const category = this.categories.find(c => c.id === product.categoryId);
      if (category) {
        return category.name;
      }
    }
    
    // If categoryId is not available or not found, try to use the category object directly
    if (product.category) {
      return product.category.name;
    }
    
    return 'Unknown';
  }

  getImageUrl(product: Product): string {
    if (product.imageUrl && product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    if (product.imageUrl) {
      return environment.backendUrl + product.imageUrl;
    }
    return ''; // No fallback image
  }

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
} 