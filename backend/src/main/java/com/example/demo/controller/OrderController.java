package com.example.demo.controller;

import com.example.demo.dto.OrderResponseDTO;
import com.example.demo.dto.PlaceOrderRequestDTO;
import com.example.demo.dto.PlaceOrderResponseDTO;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<PlaceOrderResponseDTO> placeOrder(@RequestBody PlaceOrderRequestDTO request) {
        PlaceOrderResponseDTO response = orderService.placeOrderWithResponse(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<OrderResponseDTO> orders = orderService.getAllOrdersSafe();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/all/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStatus(@PathVariable String status) {
        List<OrderResponseDTO> orders = orderService.getOrdersByStatusSafe(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByUserId(@PathVariable Long userId) {
        List<OrderResponseDTO> orders = orderService.getOrdersByUserIdSafe(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponseDTO>> getCurrentUserOrders() {
        List<OrderResponseDTO> orders = orderService.getCurrentUserOrdersSafe();
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestParam String status) {
        orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{orderId}/delivered")
    public ResponseEntity<?> markOrderDeliveredByUser(@PathVariable Long orderId) {
        orderService.markOrderDeliveredByUser(orderId);
        return ResponseEntity.ok().build();
    }
}
