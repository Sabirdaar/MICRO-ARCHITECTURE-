package com.ecommerce.orderservice1.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {  // ADDED: public
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String productId;
    private Integer quantity;
    private Double price;
}