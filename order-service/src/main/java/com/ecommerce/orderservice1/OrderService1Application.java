package com.ecommerce.orderservice1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;

@SpringBootApplication
public class OrderService1Application implements CommandLineRunner {
    
    @Autowired
    private DataSource dataSource;
    
   public static void main(String[] args) {
    SpringApplication.run(OrderService1Application.class, args);
    System.out.println("✅ OrderService1 is running on http://localhost:8085"); // CHANGE 8083 to 8085
}
    @Override
    public void run(String... args) throws Exception {
        System.out.println("Database URL: " + dataSource.getConnection().getMetaData().getURL());
    }
}