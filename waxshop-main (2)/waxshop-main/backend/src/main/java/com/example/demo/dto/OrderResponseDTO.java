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
    private String shippingCity;
    private String shippingPostalCode;
    private String shippingCountry;
    private String phoneNumber;
    private String paymentMethod;
    private BigDecimal totalAmount;
}
