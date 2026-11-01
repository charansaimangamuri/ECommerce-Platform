package com.shopsphere.invoice.controller;

import com.shopsphere.invoice.model.OrderDocument;
import com.shopsphere.invoice.repository.OrderRepository;
import com.shopsphere.invoice.service.PdfInvoiceGenerator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*") // Allows Next.js on port 3000 to download invoices
public class InvoiceController {

    private final OrderRepository orderRepository;
    private final PdfInvoiceGenerator pdfInvoiceGenerator;

    public InvoiceController(OrderRepository orderRepository, PdfInvoiceGenerator pdfInvoiceGenerator) {
        this.orderRepository = orderRepository;
        this.pdfInvoiceGenerator = pdfInvoiceGenerator;
    }

    @GetMapping("/{orderNumber}/pdf")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String orderNumber) {
        OrderDocument order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with number: " + orderNumber));

        byte[] pdfBytes = pdfInvoiceGenerator.generateInvoicePdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + orderNumber + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
