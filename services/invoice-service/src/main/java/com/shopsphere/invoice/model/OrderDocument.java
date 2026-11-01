package com.shopsphere.invoice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "orders")
public class OrderDocument {
    @Id
    private String id;
    private String orderNumber;
    private String buyerEmail;
    private String buyerName;
    private Long totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private Address shippingAddress;
    private List<OrderItem> items;

    public static class Address {
        public String fullName;
        public String street;
        public String city;
        public String state;
        public String zipCode;
        public String phone;
        public String country;
    }

    public static class OrderItem {
        public String title;
        public String variantSku;
        public String color;
        public String size;
        public Long price;
        public Integer quantity;
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public String getBuyerEmail() { return buyerEmail; }
    public String getBuyerName() { return buyerName; }
    public Long getTotalAmount() { return totalAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getOrderStatus() { return orderStatus; }
    public Address getShippingAddress() { return shippingAddress; }
    public List<OrderItem> getItems() { return items; }
}
