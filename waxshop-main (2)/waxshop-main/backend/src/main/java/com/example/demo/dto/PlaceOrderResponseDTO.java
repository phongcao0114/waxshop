package com.example.demo.dto;

import lombok.Data;

@Data
public class PlaceOrderResponseDTO {
    private Long orderId;
    private String message;

    public PlaceOrderResponseDTO() {
    }

    public PlaceOrderResponseDTO(Long orderId, String message) {
        this.orderId = orderId;
        this.message = message;
    }
}
