package com.example.demo.service;

import com.example.demo.entity.Order;
import com.example.demo.entity.User;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.dto.OrderResponseDTO;
import com.example.demo.dto.PlaceOrderRequestDTO;
import com.example.demo.dto.PlaceOrderResponseDTO;
import com.example.demo.entity.CartItem;
import com.example.demo.entity.OrderItem;
import com.example.demo.entity.Product;
import com.example.demo.repository.CartItemRepository;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.repository.ProductRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Collections;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyList;

class OrderServiceTest {
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;
    @InjectMocks
    private OrderService orderService;

    private User user;
    private Order order;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@example.com");
        user = new User();
        user.setId(1L);
        user.setEmail("user@example.com");
        order = new Order();
        order.setId(1L);
        order.setUser(user);
        order.setStatus("PENDING");
    }

    @Test
    void getAllOrders_ReturnsList() {
        when(orderRepository.findAll()).thenReturn(Arrays.asList(order));
        List<Order> result = orderService.getAllOrders();
        assertEquals(1, result.size());
        assertEquals(order.getId(), result.get(0).getId());
    }

    @Test
    void getOrdersByUserId_ReturnsList() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(orderRepository.findByUser(user)).thenReturn(Arrays.asList(order));
        List<Order> result = orderService.getOrdersByUserId(1L);
        assertEquals(1, result.size());
        assertEquals(order.getId(), result.get(0).getId());
    }

    @Test
    void cancelOrder_SetsStatusCancelled() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        order.setItems(new java.util.ArrayList<>()); // Ensure items is not null
        orderService.cancelOrder(1L);
        assertEquals("CANCELLED", order.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void cancelOrder_RestoresStock() {
        // Create a product with initial stock
        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product");
        product.setStock(5); // Initial stock
        
        // Create an order item
        OrderItem orderItem = new OrderItem();
        orderItem.setId(1L);
        orderItem.setProduct(product);
        orderItem.setQuantity(2);
        
        // Set up the order with items
        order.setItems(Arrays.asList(orderItem));
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        // Cancel the order
        orderService.cancelOrder(1L);
        
        // Verify stock was restored (5 + 2 = 7)
        assertEquals(7, product.getStock());
        verify(productRepository).save(product);
        assertEquals("CANCELLED", order.getStatus());
    }

    @Test
    void cancelOrder_AlreadyCancelled_DoesNotRestoreStock() {
        // Set order as already cancelled
        order.setStatus("CANCELLED");
        
        Product product = new Product();
        product.setId(1L);
        product.setStock(5);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(1L);
        orderItem.setProduct(product);
        orderItem.setQuantity(2);
        
        order.setItems(Arrays.asList(orderItem));
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        
        // Cancel the order again
        orderService.cancelOrder(1L);
        
        // Verify stock was not changed
        assertEquals(5, product.getStock());
        assertEquals("CANCELLED", order.getStatus());
    }

    @Test
    void updateOrderStatus_UpdatesStatus() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        orderService.updateOrderStatus(1L, "SHIPPED");
        assertEquals("SHIPPED", order.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void updateOrderStatus_ToCancelled_RestoresStock() {
        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product");
        product.setStock(5);
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(1L);
        orderItem.setProduct(product);
        orderItem.setQuantity(2);
        
        order.setItems(Arrays.asList(orderItem));
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        // Change status to CANCELLED
        orderService.updateOrderStatus(1L, "CANCELLED");
        
        // Verify stock was restored
        assertEquals(7, product.getStock());
        verify(productRepository).save(product);
        assertEquals("CANCELLED", order.getStatus());
    }

    @Test
    void updateOrderStatus_FromCancelled_DeductsStock() {
        // Set order as cancelled
        order.setStatus("CANCELLED");
        
        Product product = new Product();
        product.setId(1L);
        product.setName("Test Product");
        product.setStock(7); // Stock was previously restored
        
        OrderItem orderItem = new OrderItem();
        orderItem.setId(1L);
        orderItem.setProduct(product);
        orderItem.setQuantity(2);
        
        order.setItems(Arrays.asList(orderItem));
        
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        
        // Change status back to PENDING
        orderService.updateOrderStatus(1L, "PENDING");
        
        // Verify stock was deducted again
        assertEquals(5, product.getStock());
        verify(productRepository).save(product);
        assertEquals("PENDING", order.getStatus());
    }

    @Test
    void placeOrder_Success() {
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Arrays.asList(1L, 2L));
        CartItem cartItem1 = new CartItem();
        Product product1 = new Product(); product1.setId(1L); product1.setStock(10); product1.setPrice(BigDecimal.TEN);
        cartItem1.setProduct(product1); cartItem1.setQuantity(1);
        CartItem cartItem2 = new CartItem();
        Product product2 = new Product(); product2.setId(2L); product2.setStock(10); product2.setPrice(BigDecimal.TEN);
        cartItem2.setProduct(product2); cartItem2.setQuantity(2);
        when(cartItemRepository.findByUser(user)).thenReturn(Arrays.asList(cartItem1, cartItem2));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));
        Order order = new Order();
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        Order result = orderService.placeOrder(req);
        assertNotNull(result);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void placeOrder_NoProducts_Throws() {
        User user = new User();
        user.setEmail("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Collections.emptyList());
        assertThrows(IllegalArgumentException.class, () -> orderService.placeOrder(req));
    }

    @Test
    void placeOrder_UserNotFound_Throws() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Arrays.asList(1L));
        assertThrows(IllegalArgumentException.class, () -> orderService.placeOrder(req));
    }

    @Test
    void placeOrderWithResponse_Success() {
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Collections.singletonList(1L));
        Product product = new Product();
        product.setId(1L);
        product.setStock(10);
        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setProduct(product);
        cartItem.setQuantity(1);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUser(user)).thenReturn(Collections.singletonList(cartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> {
            Order o = i.getArgument(0);
            o.setId(99L);
            return o;
        });
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(new OrderItem());
        PlaceOrderResponseDTO resp = orderService.placeOrderWithResponse(req);
        assertEquals(99L, resp.getOrderId());
        assertEquals("Order placed successfully", resp.getMessage());
    }

    @Test
    void getAllOrdersSafe_ReturnsList() {
        OrderItem item = new OrderItem();
        Product product = new Product();
        product.setId(1L);
        product.setName("prod");
        product.setImageUrl("img");
        item.setId(1L);
        item.setProduct(product);
        item.setQuantity(2);
        item.setPrice(BigDecimal.TEN);
        order.setItems(Collections.singletonList(item));
        when(orderRepository.findAll()).thenReturn(Collections.singletonList(order));
        List<OrderResponseDTO> result = orderService.getAllOrdersSafe();
        assertEquals(1, result.size());
        assertEquals("user@example.com", result.get(0).getUserEmail());
        assertEquals(1, result.get(0).getItems().size());
    }

    @Test
    void getOrdersByUserIdSafe_UserNotFound_Throws() {
        when(userRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> orderService.getOrdersByUserIdSafe(2L));
    }

    @Test
    void isOrderOwner_TrueAndFalse() {
        user.setEmail("user@example.com");
        order.setUser(user);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        assertTrue(orderService.isOrderOwner(1L, "user@example.com"));
        assertFalse(orderService.isOrderOwner(1L, "other@example.com"));
        when(orderRepository.findById(2L)).thenReturn(Optional.empty());
        assertFalse(orderService.isOrderOwner(2L, "user@example.com"));
    }

    @Test
    void deleteOrder_CallsRepo() {
        orderService.deleteOrder(1L);
        verify(orderRepository).deleteById(1L);
    }

    @Test
    void cancelOrder_OrderNotFound_Throws() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> orderService.cancelOrder(99L));
    }
}
