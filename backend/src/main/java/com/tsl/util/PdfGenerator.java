package com.tsl.util;

import java.io.ByteArrayOutputStream;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;

@Component
public class PdfGenerator {

    public byte[] generateBookingConfirmation(String bookingId, String customerName) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("TSL Booking Confirmation"));
            document.add(new Paragraph("Booking ID: " + bookingId));
            document.add(new Paragraph("Customer: " + customerName));

            byte[] qrBytes = generateQrCode(bookingId);
            Image qrImage = new Image(ImageDataFactory.create(qrBytes)).scaleToFit(120, 120);
            document.add(qrImage);

            document.close();
            return baos.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate booking PDF", ex);
        }
    }

    private byte[] generateQrCode(String content) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix matrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 200, 200, Map.of());
        ByteArrayOutputStream pngStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", pngStream);
        return pngStream.toByteArray();
    }
}
