package com.example.demo.service;

import com.example.demo.dto.CategoryDTO;
import com.example.demo.entity.Category;
import com.example.demo.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class CategoryServiceTest {
    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getAllCategories_ReturnsList() {
        Category cat = new Category();
        cat.setId(1L);
        cat.setName("TestCat");
        when(categoryRepository.findAll()).thenReturn(Arrays.asList(cat));
        List<CategoryDTO> result = categoryService.getAllCategories();
        assertEquals(1, result.size());
        assertEquals("TestCat", result.get(0).getName());
    }

    @Test
    void getCategory_ReturnsCategory() {
        Category cat = new Category();
        cat.setId(2L);
        cat.setName("Cat2");
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(cat));
        CategoryDTO dto = categoryService.getCategory(2L);
        assertEquals("Cat2", dto.getName());
    }

    @Test
    void getCategory_NotFound_Throws() {
        when(categoryRepository.findById(99L)).thenReturn(java.util.Optional.empty());
        assertThrows(java.util.NoSuchElementException.class, () -> categoryService.getCategory(99L));
    }

    @Test
    void createCategory_SavesAndReturns() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("NewCat");
        Category cat = new Category();
        cat.setId(3L);
        cat.setName("NewCat");
        when(categoryRepository.save(any(Category.class))).thenReturn(cat);
        CategoryDTO result = categoryService.createCategory(dto);
        assertEquals("NewCat", result.getName());
    }

    @Test
    void updateCategory_UpdatesAndReturns() {
        Category cat = new Category();
        cat.setId(4L);
        cat.setName("Old");
        when(categoryRepository.findById(4L)).thenReturn(Optional.of(cat));
        when(categoryRepository.save(any(Category.class))).thenReturn(cat);
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Updated");
        CategoryDTO result = categoryService.updateCategory(4L, dto);
        assertEquals("Updated", result.getName());
    }

    @Test
    void updateCategory_NotFound_Throws() {
        when(categoryRepository.findById(99L)).thenReturn(java.util.Optional.empty());
        com.example.demo.dto.CategoryDTO dto = new com.example.demo.dto.CategoryDTO();
        assertThrows(java.util.NoSuchElementException.class, () -> categoryService.updateCategory(99L, dto));
    }

    @Test
    void deleteCategory_Deletes() {
        categoryService.deleteCategory(5L);
        verify(categoryRepository, times(1)).deleteById(5L);
    }
}

