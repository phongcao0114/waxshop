package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import com.example.demo.dto.ProductDTO;
import com.example.demo.entity.Category;

class ProductServiceTest {
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @InjectMocks
    private ProductService productService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllProducts_ReturnsList() {
        Product p = new Product();
        p.setId(1L);
        p.setName("TestProduct");
        when(productRepository.findAll()).thenReturn(Arrays.asList(p));
        List<Product> result = productService.getAllProducts();
        assertEquals(1, result.size());
        assertEquals("TestProduct", result.get(0).getName());
    }

    @Test
    void getProductById_ReturnsProduct() {
        Product p = new Product();
        p.setId(2L);
        p.setName("Prod2");
        when(productRepository.findById(2L)).thenReturn(Optional.of(p));
        Product result = productService.getProductById(2L);
        assertEquals("Prod2", result.getName());
    }

    @Test
    void getProductsByCategory_ReturnsPage() {
        Product p = new Product();
        p.setId(3L);
        p.setName("CatProd");
        Page<Product> page = new PageImpl<>(Arrays.asList(p));
        when(productRepository.findByCategoryId(eq(1L), any(PageRequest.class))).thenReturn(page);
        Page<Product> result = productService.getProductsByCategory(1L, 0, 10);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void searchProducts_ReturnsPage() {
        Product p = new Product();
        p.setId(4L);
        p.setName("Laptop");
        Page<Product> page = new PageImpl<>(Arrays.asList(p));
        when(productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(eq("laptop"), eq("laptop"), any(PageRequest.class))).thenReturn(page);
        Page<Product> result = productService.searchProducts("laptop", 0, 10);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void addProduct_Success() throws Exception {
        ProductDTO dto = new ProductDTO();
        dto.name = "NewProduct";
        dto.price = java.math.BigDecimal.TEN;
        dto.stock = 5;
        dto.description = "desc";
        dto.categoryId = 1;
        dto.imageUrl = null;
        Category cat = new Category();
        cat.setId(1L);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true); // Simulate no file upload
        Product saved = new Product();
        saved.setId(10L);
        saved.setName("NewProduct");
        when(productRepository.save(any(Product.class))).thenReturn(saved);
        Product result = productService.addProduct(dto, file);
        assertEquals("NewProduct", result.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void addProduct_CategoryNotFound_Throws() {
        ProductDTO dto = new ProductDTO();
        dto.categoryId = 99;
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> productService.addProduct(dto, file));
    }

    @Test
    void updateProduct_Success() throws Exception {
        ProductDTO dto = new ProductDTO();
        dto.name = "Updated";
        dto.price = java.math.BigDecimal.ONE;
        dto.stock = 2;
        dto.description = "desc";
        dto.categoryId = 1;
        dto.imageUrl = "img.png";
        Product prod = new Product();
        prod.setId(1L);
        Category cat = new Category();
        cat.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(prod));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(productRepository.save(any(Product.class))).thenReturn(prod);
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        Product result = productService.updateProduct(1L, dto, file);
        assertEquals("Updated", result.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void updateProduct_ProductNotFound_Throws() {
        ProductDTO dto = new ProductDTO();
        dto.categoryId = 1;
        when(productRepository.findById(1L)).thenReturn(Optional.empty());
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> productService.updateProduct(1L, dto, file));
    }

    @Test
    void updateProduct_CategoryNotFound_Throws() {
        ProductDTO dto = new ProductDTO();
        dto.categoryId = 2;
        Product prod = new Product();
        prod.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(prod));
        when(categoryRepository.findById(2L)).thenReturn(Optional.empty());
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> productService.updateProduct(1L, dto, file));
    }

    @Test
    void deleteProduct_Success() {
        Product prod = new Product();
        prod.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(prod));
        productService.deleteProduct(1L);
        verify(productRepository).delete(prod);
    }

    @Test
    void deleteProduct_ProductNotFound_Throws() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> productService.deleteProduct(99L));
    }
}

