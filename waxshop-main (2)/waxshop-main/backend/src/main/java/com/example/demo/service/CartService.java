package com.example.demo.service;

import com.example.demo.dto.CartItemRequestDTO;
import com.example.demo.dto.CartItemResponseDTO;
import com.example.demo.entity.CartItem;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    private void validateStock(Product product, int quantity) {
        if (quantity > product.getStock()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock.");
        }
    }

    @Transactional
    public void addItemToCart(CartItemRequestDTO request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId()).orElseThrow();
        Optional<CartItem> existing = cartItemRepository.findByUserAndProductId(user, product.getId());
        int requestedQuantity = request.getQuantity();
        int currentQuantity = existing.map(CartItem::getQuantity).orElse(0);
        int totalQuantity = currentQuantity + requestedQuantity;
        validateStock(product, totalQuantity);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(totalQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(requestedQuantity);
            cartItemRepository.save(item);
        }
    }

    public List<CartItemResponseDTO> getCartItems() {
        User user = getCurrentUser();
        List<CartItem> items = cartItemRepository.findByUser(user);
        return items.stream()
                .<CartItemResponseDTO>map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateCartItem(Long productId, int quantity) {
        User user = getCurrentUser();
        CartItem item = cartItemRepository.findByUserAndProductId(user, productId).orElseThrow();
        Product product = item.getProduct();
        validateStock(product, quantity);
        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    @Transactional
    public void updateCartItemByEmailAndProductId(Long productId, int quantity) {
        User user = getCurrentUser();
        CartItem item = cartItemRepository.findByUserAndProductId(user, productId).orElseThrow();
        Product product = item.getProduct();
        validateStock(product, quantity);
        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    @Transactional
    public void removeCartItem(Long productId) {
        User user = getCurrentUser();
        // Check if the product exists before attempting to delete from cart
        productRepository.findById(productId).orElseThrow(() -> new IllegalArgumentException("Product not found."));
        cartItemRepository.deleteByUserAndProductId(user, productId);
    }

    @Transactional
    public void removeAllCartItemsForCurrentUser() {
        User user = getCurrentUser();
        cartItemRepository.deleteAllByUser(user);
    }

    @Transactional
    public void deleteCartItemsByIds(List<Long> cartItemIds) {
        if (cartItemIds != null && !cartItemIds.isEmpty()) {
            cartItemRepository.deleteAllByIdInBatch(cartItemIds);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private CartItemResponseDTO toDTO(CartItem item) {
        CartItemResponseDTO dto = new CartItemResponseDTO();
        dto.setId(item.getId());
        Product product = item.getProduct();
        dto.setProductId(product.getId());
        dto.setProductName(product.getName());
        dto.setProductImage(product.getImageUrl());
        dto.setProductPrice(product.getPrice() != null ? product.getPrice().doubleValue() : 0.0);
        dto.setQuantity(item.getQuantity());
        return dto;
    }
}
