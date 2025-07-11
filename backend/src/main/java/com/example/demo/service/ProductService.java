package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public Product addProduct(ProductDTO dto, MultipartFile imageFile) {
        Category category = categoryRepository.findById(dto.categoryId.longValue())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        Product product = new Product();
        product.setName(dto.name);
        product.setPrice(dto.price);
        product.setStock(dto.stock);
        product.setDescription(dto.description);
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            String uploadDir = resolveUploadDir();
            ensureDirectoryExists(uploadDir);
            try {
                imageFile.transferTo(new java.io.File(uploadDir, fileName));
                product.setImageUrl("/uploads/" + fileName);
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to save image: " + e.getMessage(), e);
            }
        } else {
            product.setImageUrl(dto.imageUrl);
        }
        product.setCategory(category);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductDTO dto, MultipartFile imageFile) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        Category category = categoryRepository.findById(dto.categoryId.longValue())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        product.setName(dto.name);
        product.setPrice(dto.price);
        product.setStock(dto.stock);
        product.setDescription(dto.description);
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
            String uploadDir = resolveUploadDir();
            ensureDirectoryExists(uploadDir);
            try {
                imageFile.transferTo(new java.io.File(uploadDir, fileName));
                product.setImageUrl("/uploads/" + fileName);
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to save image: " + e.getMessage(), e);
            }
        } else if (dto.imageUrl != null) {
            product.setImageUrl(dto.imageUrl);
        }
        product.setCategory(category);
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    public Page<Product> getProductsByCategory(Long categoryId, int page, int size) {
        return productRepository.findByCategoryId(categoryId, PageRequest.of(page, size));
    }

    public Page<Product> searchProducts(String query, int page, int size) {
        return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, PageRequest.of(page, size));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        productRepository.delete(product);
    }

    private String resolveUploadDir() {
        return new java.io.File("uploads").getAbsolutePath();
    }

    private void ensureDirectoryExists(String dirPath) {
        java.io.File dir = new java.io.File(dirPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
}
