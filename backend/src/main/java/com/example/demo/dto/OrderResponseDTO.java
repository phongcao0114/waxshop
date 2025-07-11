package com.example.demo.dto;

import lombok.Data;

import java.util.List;
import java.math.BigDecimal;

@Data
public class OrderResponseDTO {
    private Long id;
    private String userEmail;
    private String status;
    private List<OrderItemDTO> items;
    private String shippingAddress;
    private BigDecimal totalAmount;
}
