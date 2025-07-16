package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(nullable = false)
    private Integer stock;
    
    @Column(length = 100)
    private String dimensions;
    
    @Column(length = 50)
    private String weight;
    
    @Column(length = 50)
    private String size;
    
    @Column(length = 100)
    private String material;
    
    @Column(name = "product_use", length = 50)
    private String productUse;
    
    @Column(length = 100)
    private String warranty;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}
