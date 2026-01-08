package com.ecommerce.orderservice1.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String userId;
    private LocalDateTime orderDate = LocalDateTime.now();
    private Double totalAmount;
    private String status = "PENDING";
    private String shippingAddress;
    
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();
    
    @PrePersist
    public void calculateTotal() {
        if (this.totalAmount == null && items != null) {
            this.totalAmount = items.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        }
    }
}