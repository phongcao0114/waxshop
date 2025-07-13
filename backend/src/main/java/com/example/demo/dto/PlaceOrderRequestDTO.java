package com.example.demo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PlaceOrderRequestDTO {
    private String shippingAddress;
    private String shippingCity;
    private String shippingPostalCode;
    private String shippingCountry;
    private String phoneNumber;
    private String paymentMethod;
    private List<Long> productIds; // IDs of products to order from cart
    private BigDecimal totalAmount;
}
