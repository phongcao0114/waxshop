package com.example.demo.service;

import com.example.demo.dto.CartItemRequestDTO;
import com.example.demo.dto.CartItemResponseDTO;
import com.example.demo.entity.CartItem;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class CartServiceTest {
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private Authentication authentication;
    @InjectMocks
    private CartService cartService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        when(authentication.getName()).thenReturn("user@example.com");
    }

    @Test
    void addItemToCart_NewItem_Success() {
        Product product = new Product();
        product.setId(1L);
        product.setStock(10);
        CartItemRequestDTO req = new CartItemRequestDTO();
        req.setProductId(1L);
        req.setQuantity(2);
        User user = new User();
        user.setEmail("user@example.com");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserAndProductId(user, 1L)).thenReturn(Optional.empty());
        cartService.addItemToCart(req);
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void getCartItems_ReturnsList() {
        CartItem item = new CartItem();
        Product product = new Product();
        product.setId(1L);
        item.setProduct(product);
        item.setId(1L);
        item.setQuantity(2);
        User user = new User();
        user.setEmail("user@example.com");
        item.setUser(user);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(Arrays.asList(item));
        List<CartItemResponseDTO> result = cartService.getCartItems();
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getProductId());
    }

    @Test
    void updateCartItem_UpdatesQuantity() {
        Product product = new Product();
        product.setId(1L);
        product.setStock(10);
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(2);
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserAndProductId(user, 1L)).thenReturn(Optional.of(item));
        cartService.updateCartItem(1L, 5);
        verify(cartItemRepository).save(item);
        assertEquals(5, item.getQuantity());
    }

    @Test
    void removeCartItem_Deletes() {
        Product product = new Product();
        product.setId(1L);
        User user = new User();
        user.setEmail("user@example.com");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        cartService.removeCartItem(1L);
        verify(cartItemRepository).deleteByUserAndProductId(user, 1L);
    }

    @Test
    void updateCartItemByEmailAndProductId_UpdatesQuantity() {
        Product product = new Product();
        product.setId(2L);
        product.setStock(10);
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(2);
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserAndProductId(user, 2L)).thenReturn(Optional.of(item));
        cartService.updateCartItemByEmailAndProductId(2L, 7);
        verify(cartItemRepository).save(item);
        assertEquals(7, item.getQuantity());
    }

    @Test
    void updateCartItemByEmailAndProductId_NotFound_Throws() {
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserAndProductId(user, 2L)).thenReturn(Optional.empty());
        assertThrows(java.util.NoSuchElementException.class, () -> cartService.updateCartItemByEmailAndProductId(2L, 1));
    }

    @Test
    void updateCartItem_StockExceeded_Throws() {
        Product product = new Product();
        product.setId(1L);
        product.setStock(2);
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(2);
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserAndProductId(user, 1L)).thenReturn(Optional.of(item));
        assertThrows(IllegalArgumentException.class, () -> cartService.updateCartItem(1L, 5));
    }

    @Test
    void removeAllCartItemsForCurrentUser_DeletesAll() {
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        cartService.removeAllCartItemsForCurrentUser();
        verify(cartItemRepository).deleteAllByUser(user);
    }

    @Test
    void deleteCartItemsByIds_DeletesBatch() {
        List<Long> ids = java.util.Arrays.asList(1L, 2L);
        cartService.deleteCartItemsByIds(ids);
        verify(cartItemRepository).deleteAllByIdInBatch(ids);
    }

    @Test
    void deleteCartItemsByIds_NullOrEmpty_DoesNothing() {
        cartService.deleteCartItemsByIds(null);
        cartService.deleteCartItemsByIds(java.util.Collections.emptyList());
        verify(cartItemRepository, never()).deleteAllByIdInBatch(any());
    }

    @Test
    void addItemToCart_StockExceeded_Throws() {
        Product product = new Product();
        product.setId(1L);
        product.setStock(2);
        CartItemRequestDTO req = new CartItemRequestDTO();
        req.setProductId(1L);
        req.setQuantity(5);
        User user = new User();
        user.setEmail("user@example.com");
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserAndProductId(user, 1L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> cartService.addItemToCart(req));
    }

    @Test
    void updateCartItem_NotFound_Throws() {
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserAndProductId(user, 1L)).thenReturn(Optional.empty());
        assertThrows(java.util.NoSuchElementException.class, () -> cartService.updateCartItem(1L, 1));
    }

    @Test
    void addItemToCart_ProductNotFound_Throws() {
        CartItemRequestDTO req = new CartItemRequestDTO();
        req.setProductId(99L);
        req.setQuantity(1);
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        assertThrows(java.util.NoSuchElementException.class, () -> cartService.addItemToCart(req));
    }

    @Test
    void removeCartItem_ProductNotFound_Throws() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        assertThrows(IllegalArgumentException.class, () -> cartService.removeCartItem(99L));
    }

    @Test
    void getCurrentUser_UserNotFound_Throws() {
        when(userRepository.findByEmail("nouser@example.com")).thenReturn(Optional.empty());
        CartService service = new CartService();
        org.springframework.test.util.ReflectionTestUtils.setField(service, "userRepository", userRepository);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("nouser@example.com");
        SecurityContextHolder.getContext().setAuthentication(authentication);
        assertThrows(IllegalArgumentException.class, () -> {
            org.springframework.test.util.ReflectionTestUtils.invokeMethod(service, "getCurrentUser");
        });
    }
}
