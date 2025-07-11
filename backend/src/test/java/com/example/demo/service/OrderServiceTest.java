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
        user = new User();
        user.setId(1);
        user.setEmail("user@example.com");
        user.setPassword("pass");
        order = new Order();
        order.setId(1L);
        order.setUser(user);
        order.setStatus("PENDING");
        order.setDate(LocalDateTime.now());
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@example.com");
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
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(orderRepository.findByUser(user)).thenReturn(Arrays.asList(order));
        List<Order> result = orderService.getOrdersByUserId(1L);
        assertEquals(1, result.size());
        assertEquals(order.getId(), result.get(0).getId());
    }

    @Test
    void cancelOrder_SetsStatusCancelled() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        orderService.cancelOrder(1L);
        assertEquals("CANCELLED", order.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void updateOrderStatus_UpdatesStatus() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        orderService.updateOrderStatus(1L, "SHIPPED");
        assertEquals("SHIPPED", order.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void placeOrder_Success() {
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Collections.singletonList(1L));
        req.setPaymentMethod("CARD");
        req.setShippingAddress("addr");
        req.setShippingCity("city");
        req.setShippingPostalCode("123");
        req.setShippingCountry("country");
        req.setPhoneNumber("123");
        req.setShippingFee(BigDecimal.ONE);
        req.setTotalAmount(BigDecimal.TEN);
        Product product = new Product();
        product.setId(1L);
        product.setStock(10);
        product.setPrice(BigDecimal.TEN);
        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserEmail("user@example.com")).thenReturn(Collections.singletonList(cartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(new OrderItem());
        orderService.placeOrder(req);
        verify(orderRepository).save(any(Order.class));
        verify(productRepository).save(any(Product.class));
        verify(orderItemRepository).save(any(OrderItem.class));
        verify(cartItemRepository).deleteAllByIdInBatch(anyList());
    }

    @Test
    void placeOrder_NoProducts_Throws() {
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Collections.emptyList());
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        assertThrows(IllegalArgumentException.class, () -> orderService.placeOrder(req));
    }

    @Test
    void placeOrder_NoMatchingCartItems_Throws() {
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Collections.singletonList(1L));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserEmail("user@example.com")).thenReturn(Collections.emptyList());
        assertThrows(IllegalStateException.class, () -> orderService.placeOrder(req));
    }

    @Test
    void placeOrder_NotEnoughStock_Throws() {
        PlaceOrderRequestDTO req = new PlaceOrderRequestDTO();
        req.setProductIds(Collections.singletonList(1L));
        Product product = new Product();
        product.setId(1L);
        product.setStock(1);
        CartItem cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(cartItemRepository.findByUserEmail("user@example.com")).thenReturn(Collections.singletonList(cartItem));
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
        when(cartItemRepository.findByUserEmail("user@example.com")).thenReturn(Collections.singletonList(cartItem));
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
        when(userRepository.findById(2)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> orderService.getOrdersByUserIdSafe(2L));
    }

    @Test
    void isOrderOwner_TrueAndFalse() {
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

