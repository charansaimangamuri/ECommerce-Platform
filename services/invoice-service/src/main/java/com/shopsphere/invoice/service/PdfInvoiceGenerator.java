package com.shopsphere.invoice.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.shopsphere.invoice.model.OrderDocument;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class PdfInvoiceGenerator {

    public byte[] generateInvoicePdf(OrderDocument order) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Header & Brand Title
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new Color(79, 70, 229));
            Paragraph brand = new Paragraph("ShopSphere", brandFont);
            brand.setAlignment(Element.ALIGN_LEFT);
            document.add(brand);

            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Paragraph subtitle = new Paragraph("Official Tax Invoice & Delivery Manifest\nGSTIN: 29ABCDE1234F1Z5\n\n", subtitleFont);
            document.add(subtitle);

            // 2. Order Metadata & Shipping Details Table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);

            Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font regular = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Left: Billed To
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            leftCell.addElement(new Paragraph("BILLED TO:", bold));
            leftCell.addElement(new Paragraph(order.getBuyerName(), bold));
            if (order.getShippingAddress() != null) {
                leftCell.addElement(new Paragraph(order.getShippingAddress().street, regular));
                leftCell.addElement(new Paragraph(order.getShippingAddress().city + ", " + order.getShippingAddress().state + " - " + order.getShippingAddress().zipCode, regular));
                leftCell.addElement(new Paragraph("Phone: " + order.getShippingAddress().phone, regular));
            }
            metaTable.addCell(leftCell);

            // Right: Invoice Info
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(new Paragraph("INVOICE DETAILS:", bold));
            rightCell.addElement(new Paragraph("Invoice Number: INV-" + order.getOrderNumber(), regular));
            rightCell.addElement(new Paragraph("Order Number: " + order.getOrderNumber(), bold));
            rightCell.addElement(new Paragraph("Payment Method: " + order.getPaymentMethod(), regular));
            rightCell.addElement(new Paragraph("Payment Status: " + order.getPaymentStatus(), regular));
            metaTable.addCell(rightCell);

            document.add(metaTable);
            document.add(new Paragraph("\n"));

            // 3. Itemized Products Table
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{4f, 2f, 1f, 2f, 2f});

            // Table Headers
            String[] headers = {"Item Description", "SKU", "Qty", "Unit Price", "Total"};
            for (String header : headers) {
                PdfPCell hCell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                hCell.setBackgroundColor(new Color(79, 70, 229));
                hCell.setPadding(6);
                hCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemsTable.addCell(hCell);
            }

            NumberFormat currency = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));

            // Table Rows
            if (order.getItems() != null) {
                for (OrderDocument.OrderItem item : order.getItems()) {
                    PdfPCell titleCell = new PdfPCell(new Phrase(item.title, regular));
                    titleCell.setPadding(6);
                    itemsTable.addCell(titleCell);

                    PdfPCell skuCell = new PdfPCell(new Phrase(item.variantSku != null ? item.variantSku : "-", regular));
                    skuCell.setPadding(6);
                    skuCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    itemsTable.addCell(skuCell);

                    PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.quantity), regular));
                    qtyCell.setPadding(6);
                    qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    itemsTable.addCell(qtyCell);

                    PdfPCell priceCell = new PdfPCell(new Phrase("Rs. " + item.price, regular));
                    priceCell.setPadding(6);
                    priceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    itemsTable.addCell(priceCell);

                    PdfPCell totalItemCell = new PdfPCell(new Phrase("Rs. " + (item.price * item.quantity), bold));
                    totalItemCell.setPadding(6);
                    totalItemCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    itemsTable.addCell(totalItemCell);
                }
            }

            document.add(itemsTable);
            document.add(new Paragraph("\n"));

            // 4. Grand Total Summary Card
            Paragraph totalPara = new Paragraph("Grand Total Paid: Rs. " + order.getTotalAmount() + " (Inclusive of all taxes)", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(79, 70, 229)));
            totalPara.setAlignment(Element.ALIGN_RIGHT);
            document.add(totalPara);

            // 5. Footer Notice
            Paragraph footer = new Paragraph("\n\nThank you for shopping on ShopSphere! This is a computer-generated tax invoice and requires no physical signature.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}
