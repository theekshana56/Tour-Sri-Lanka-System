package com.tsl.util;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import org.springframework.stereotype.Component;

import com.tsl.config.AppProperties;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.tsl.dto.response.PriceQuoteBreakdown;
import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;
import com.tsl.model.Place;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class PdfGenerator {

    private final AppProperties appProperties;

    private static final DeviceRgb HEADER_GREEN = new DeviceRgb(26, 60, 46);
    private static final DeviceRgb HIGHLIGHT_BG = new DeviceRgb(245, 230, 200);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generateBookingPdf(Booking booking, List<Place> places, PriceQuoteBreakdown breakdown) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.setMargins(36, 36, 48, 36);

            addHeader(document);
            addReferenceSection(document, booking);
            addCustomerSection(document, booking);
            addTripDetailsTable(document, booking);
            addPlacesSection(document, booking, places);
            addPriceBreakdown(document, booking, breakdown);
            addFooter(document, booking);

            document.close();
            return baos.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate booking PDF", ex);
        }
    }

    private void addHeader(Document document) {
        Table header = new Table(UnitValue.createPercentArray(new float[]{1}))
                .useAllAvailableWidth();
        Cell cell = new Cell()
                .setBackgroundColor(HEADER_GREEN)
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setPadding(16);
        cell.add(new Paragraph("TSL — Tourism Sri Lanka")
                .setFontColor(ColorConstants.WHITE)
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4));
        cell.add(new Paragraph("Your Adventure Awaits")
                .setFontColor(ColorConstants.WHITE)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER));
        header.addCell(cell);
        document.add(header);
        document.add(new Paragraph("\n"));
    }

    private void addReferenceSection(Document document, Booking booking) {
        String trackUrl = buildTrackUrl(booking.getBookingNumber());
        Table section = new Table(UnitValue.createPercentArray(new float[]{2, 1}))
                .useAllAvailableWidth();

        Cell left = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        left.add(new Paragraph("BOOKING CONFIRMED")
                .setBackgroundColor(new DeviceRgb(13, 115, 119))
                .setFontColor(ColorConstants.WHITE)
                .setBold()
                .setPadding(6)
                .setFontSize(10)
                .setWidth(120));
        left.add(new Paragraph(booking.getBookingNumber())
                .setFontSize(22)
                .setBold()
                .setMarginTop(8));

        Cell right = new Cell()
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setTextAlignment(TextAlignment.RIGHT);
        try {
            byte[] qrBytes = generateQrCode(trackUrl);
            Image qr = new Image(ImageDataFactory.create(qrBytes)).scaleToFit(150, 150);
            right.add(qr);
        } catch (Exception ex) {
            log.warn("QR code generation failed for {}", booking.getBookingNumber(), ex);
        }

        section.addCell(left);
        section.addCell(right);
        document.add(section);
        document.add(new Paragraph("\n"));
    }

    private void addCustomerSection(Document document, Booking booking) {
        Table cols = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth();

        Cell left = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        left.add(labelValue("Customer Name", booking.getCustomerName()));
        left.add(labelValue("Email", booking.getCustomerEmail()));
        left.add(labelValue("WhatsApp", booking.getCustomerWhatsapp()));

        Cell right = new Cell().setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);
        String created = booking.getCreatedAt() != null
                ? booking.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"))
                : "—";
        right.add(labelValue("Booking Date", created));
        right.add(labelValue("Status", EmailTemplates.statusLabel(booking.getStatus())));

        cols.addCell(left);
        cols.addCell(right);
        document.add(cols);
        document.add(new Paragraph("\n"));
    }

    private void addTripDetailsTable(Document document, Booking booking) {
        document.add(new Paragraph("Trip Details").setBold().setFontSize(14));
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setMarginTop(8);

        addDetailRow(table, "Pickup Location", booking.getPickupLocation());
        addDetailRow(table, "Drop Location", booking.getDropLocation());
        addDetailRow(table, "From District", booking.getFromDistrict());
        addDetailRow(table, "To District", booking.getToDistrict());
        addDetailRow(table, "Start Date", booking.getStartDate() != null
                ? booking.getStartDate().format(DATE_FMT) : "—");
        addDetailRow(table, "End Date", booking.getEndDate() != null
                ? booking.getEndDate().format(DATE_FMT) : "—");
        addDetailRow(table, "Duration", booking.getNumberOfDays() + " days");
        addDetailRow(table, "Passengers", String.valueOf(booking.getPassengerCount()));
        addDetailRow(table, "Vehicle Type", booking.getVehicleType() != null
                ? booking.getVehicleType().name() : "—");

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addPlacesSection(Document document, Booking booking, List<Place> places) {
        document.add(new Paragraph("Selected Places").setBold().setFontSize(14));
        List<String> names = places != null && !places.isEmpty()
                ? places.stream().map(Place::getName).toList()
                : booking.getSelectedPlaceNames();

        if (names == null || names.isEmpty()) {
            document.add(new Paragraph("—").setFontSize(11));
        } else {
            IntStream.range(0, names.size()).forEach(i ->
                    document.add(new Paragraph((i + 1) + ". " + names.get(i)).setFontSize(11)));
        }
        document.add(new Paragraph("\n"));
    }

    private void addPriceBreakdown(Document document, Booking booking, PriceQuoteBreakdown breakdown) {
        document.add(new Paragraph("Price Breakdown").setBold().setFontSize(14));

        Table box = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .useAllAvailableWidth()
                .setBackgroundColor(HIGHLIGHT_BG)
                .setBorder(new SolidBorder(HEADER_GREEN, 1))
                .setMarginTop(8);

        if (breakdown != null) {
            addPriceRow(box, "Base Rate", formatLkr(breakdown.getBaseCost()));
            addPriceRow(box, "Passenger Adjustment", formatLkr(breakdown.getPassengerExtra()));
            addPriceRow(box, "Zone Factor", "× " + breakdown.getZoneMultiplier());
            addPriceRow(box, "Seasonal Adjustment", "× " + breakdown.getSeasonalMultiplier());
        }

        addPriceRow(box, "TOTAL (LKR)", formatLkr(booking.getTotalPriceLKR()));
        String foreign = booking.getPreferredCurrency() + " " + formatMoney(booking.getTotalPriceForeign());
        addPriceRow(box, "TOTAL (" + booking.getPreferredCurrency() + ")", foreign);
        addPriceRow(box, "Exchange rate", EmailTemplates.lkrPerUnitCurrency(booking));

        document.add(box);
        document.add(new Paragraph("\n"));
    }

    private void addFooter(Document document, Booking booking) {
        String notice = booking.getStatus() == BookingStatus.PENDING
                ? "This booking is pending admin confirmation. You'll receive updates via email and WhatsApp."
                : "Thank you for choosing TSL. Safe travels!";
        document.add(new Paragraph("For support: support@tsl.lk | +94 11 234 5678 | www.tsl.lk")
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY));
        document.add(new Paragraph(notice)
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(8)
                .setItalic());
    }

    private Paragraph labelValue(String label, String value) {
        return new Paragraph(label + ": " + (value != null ? value : "—"))
                .setFontSize(10)
                .setMarginBottom(4);
    }

    private void addDetailRow(Table table, String field, String details) {
        table.addCell(new Cell().add(new Paragraph(field).setBold().setFontSize(10))
                .setBackgroundColor(new DeviceRgb(240, 240, 240))
                .setPadding(6));
        table.addCell(new Cell().add(new Paragraph(details != null ? details : "—").setFontSize(10))
                .setPadding(6));
    }

    private void addPriceRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold().setFontSize(10)).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER).setPadding(8));
        table.addCell(new Cell().add(new Paragraph(value).setFontSize(10)).setBorder(com.itextpdf.layout.borders.Border.NO_BORDER).setPadding(8).setTextAlignment(TextAlignment.RIGHT));
    }

    private String formatLkr(BigDecimal amount) {
        return amount != null ? "LKR " + amount.setScale(2, RoundingMode.HALF_UP).toPlainString() : "—";
    }

    private String formatMoney(BigDecimal amount) {
        return amount != null ? amount.setScale(2, RoundingMode.HALF_UP).toPlainString() : "0.00";
    }

    private String buildTrackUrl(String bookingNumber) {
        String base = appProperties.getFrontendUrl() != null
                ? appProperties.getFrontendUrl().replaceAll("/$", "")
                : "http://localhost:3000";
        return base + "/track/" + bookingNumber;
    }

    private byte[] generateQrCode(String content) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix matrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 150, 150, Map.of());
        ByteArrayOutputStream pngStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", pngStream);
        return pngStream.toByteArray();
    }
}
