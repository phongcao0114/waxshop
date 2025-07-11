package com.example.demo.dto;

import lombok.Data;

@Data
public class UserProfileDTO {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String role;
}

