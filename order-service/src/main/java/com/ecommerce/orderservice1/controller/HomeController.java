package com.ecommerce.orderservice1.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public Map<String, String> home() {
        Map<String, String> map = new HashMap<>();
        map.put("service", "Order Service");
        map.put("status", "RUNNING");
        return map;
    }
    
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> map = new HashMap<>();
        map.put("status", "UP");
        return map;
    }
}