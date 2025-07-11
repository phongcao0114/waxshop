package com.example.demo.service;

import com.example.demo.dto.OrderItemDTO;
import com.example.demo.dto.OrderResponseDTO;
import com.example.demo.dto.PlaceOrderRequestDTO;
import com.example.demo.dto.PlaceOrderResponseDTO;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userRepository.findByEmail(userEmail).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public Order placeOrder(PlaceOrderRequestDTO request) {
        // 1. Get the current user
        User user = getCurrentUser();
        // 2. Get the list of selected product IDs from the request
        List<Long> selectedProductIds = request.getProductIds();
        // 3. Validate that at least one product is selected
        if (selectedProductIds == null || selectedProductIds.isEmpty()) {
            throw new IllegalArgumentException("No products selected for order");
        }
        // 4. Retrieve cart items for the user that match the selected product IDs
        List<CartItem> cartItems = cartItemRepository.findByUser(user)
                .stream()
                .filter(item -> selectedProductIds.contains(item.getProduct().getId()))
                .toList();
        // 5. Validate that matching cart items exist
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("No matching cart items found for selected products");
        }
        // 6. Create a new Order entity and set its properties
        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress());
        order.setTotalAmount(request.getTotalAmount());
        // 7. Save the order to generate its ID
        order = orderRepository.save(order);
        // 8. For each cart item, check stock, update product stock, and create an OrderItem
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            // 8a. Check if there is enough stock for the product
            if (cartItem.getQuantity() > product.getStock()) {
                throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
            }
            // 8b. Deduct the ordered quantity from the product's stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
            // 8c. Create and save an OrderItem for this product
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice());
            orderItemRepository.save(orderItem);
        }
        // 9. Remove the processed cart items from the user's cart
        cartItemRepository.deleteAllByIdInBatch(cartItems.stream().map(CartItem::getId).toList());
        // 10. Return the created order
        return order;
    }

    @Transactional
    public PlaceOrderResponseDTO placeOrderWithResponse(PlaceOrderRequestDTO request) {
        Order order = placeOrder(request);
        return new PlaceOrderResponseDTO(order.getId(), "Order placed successfully");
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderRepository.findByUser(user);
    }

    public List<OrderResponseDTO> getAllOrdersSafe() {
        return orderRepository.findAll().stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setUserEmail(order.getUser().getEmail());
            dto.setStatus(order.getStatus());
            dto.setShippingAddress(order.getShippingAddress());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductId(item.getProduct().getId());
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                itemDTO.setProductImage(item.getProduct().getImageUrl());
                return itemDTO;
            }).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getOrdersByUserIdSafe(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return orderRepository.findByUser(user).stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setUserEmail(order.getUser().getEmail());
            dto.setStatus(order.getStatus());
            dto.setShippingAddress(order.getShippingAddress());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductId(item.getProduct().getId());
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                itemDTO.setProductImage(item.getProduct().getImageUrl());
                return itemDTO;
            }).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getOrdersByStatusSafe(String status) {
        return orderRepository.findByStatus(status).stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setUserEmail(order.getUser().getEmail());
            dto.setStatus(order.getStatus());
            dto.setShippingAddress(order.getShippingAddress());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductId(item.getProduct().getId());
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                itemDTO.setProductImage(item.getProduct().getImageUrl());
                return itemDTO;
            }).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getCurrentUserOrdersSafe() {
        User user = getCurrentUser();
        return orderRepository.findByUser(user).stream().map(order -> {
            OrderResponseDTO dto = new OrderResponseDTO();
            dto.setId(order.getId());
            dto.setUserEmail(order.getUser().getEmail());
            dto.setStatus(order.getStatus());
            dto.setShippingAddress(order.getShippingAddress());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setItems(order.getItems().stream().map(item -> {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductId(item.getProduct().getId());
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                itemDTO.setProductImage(item.getProduct().getImageUrl());
                return itemDTO;
            }).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());
    }

    public boolean isOrderOwner(Long orderId, String email) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return order.getUser().getEmail().equals(email);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }

    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus("CANCELLED");
        orderRepository.save(order);
    }

    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        orderRepository.save(order);
    }

    @Transactional
    public void markOrderDeliveredByUser(Long orderId) {
        String userEmail = getCurrentUser().getEmail();
        if (!isOrderOwner(orderId, userEmail)) {
            throw new IllegalArgumentException("You can only mark your own orders as delivered");
        }
        updateOrderStatus(orderId, "DELIVERED");
    }
}
