package com.shopsphere.invoice.repository;

import com.shopsphere.invoice.model.OrderDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface OrderRepository extends MongoRepository<OrderDocument, String> {
    Optional<OrderDocument> findByOrderNumber(String orderNumber);
}
