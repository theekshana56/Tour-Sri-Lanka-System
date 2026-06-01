package com.tsl.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;

public final class EmailTemplates {

    private static final String BRAND_GREEN = "#1a3c2e";
    private static final String ACCENT_SAND = "#f5e6c8";
    private static final String CTA_TEAL = "#0d7377";

    private EmailTemplates() {
    }

    public static String bookingReceived(Booking booking, String frontendUrl, boolean hasPdf) {
        String trackUrl = trackUrl(frontendUrl, booking.getBookingNumber());
        String pdfNote = hasPdf
                ? "<p>Your booking PDF is attached to this email.</p>"
                : "<p><em>Your PDF confirmation will be sent in a follow-up email shortly.</em></p>";
        return wrap(
                "Booking Received",
                """
                <p style="font-size:18px;">Thank you, <strong>%s</strong>! Your booking has been received.</p>
                <p style="font-size:28px;font-weight:bold;color:%s;margin:16px 0;">%s</p>
                %s
                <table style="width:100%%;border-collapse:collapse;margin:20px 0;">
                  %s
                </table>
                <p>We'll review your booking and confirm within <strong>24 hours</strong>.</p>
                <p style="text-align:center;margin:24px 0;">
                  <a href="%s" style="background:%s;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Track Your Booking</a>
                </p>
                """
                        .formatted(
                                escape(booking.getCustomerName()),
                                BRAND_GREEN,
                                escape(booking.getBookingNumber()),
                                pdfNote,
                                tripSummaryRows(booking),
                                trackUrl,
                                CTA_TEAL));
    }

    public static String bookingPdfFollowUp(Booking booking, String frontendUrl) {
        return wrap(
                "Your Booking PDF",
                """
                <p>Hi <strong>%s</strong>,</p>
                <p>Your booking confirmation PDF for <strong>%s</strong> is ready and attached to this email.</p>
                <p style="text-align:center;margin:24px 0;">
                  <a href="%s" style="background:%s;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">Track Booking</a>
                </p>
                """
                        .formatted(
                                escape(booking.getCustomerName()),
                                escape(booking.getBookingNumber()),
                                trackUrl(frontendUrl, booking.getBookingNumber()),
                                CTA_TEAL));
    }

    public static String bookingApproved(Booking booking, String frontendUrl) {
        String pdfLink = booking.getPdfUrl() != null
                ? "<p><a href=\"" + escapeAttr(booking.getPdfUrl()) + "\">Download your booking PDF</a></p>"
                : "";
        return wrap(
                "Booking Confirmed",
                """
                <p style="font-size:20px;">🎉 Your Sri Lanka trip is <strong>ON</strong>!</p>
                <p style="font-size:26px;font-weight:bold;color:%s;">%s</p>
                <table style="width:100%%;border-collapse:collapse;margin:16px 0;">
                  %s
                  %s
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Driver</strong></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%s</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Driver Phone</strong></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%s</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Pickup</strong></td>
                      <td style="padding:8px;border-bottom:1px solid #eee;">%s</td></tr>
                  <tr><td style="padding:8px;"><strong>Drop-off</strong></td>
                      <td style="padding:8px;">%s</td></tr>
                </table>
                %s
                <p><strong>Save this email</strong> — show it to your driver on pickup day.</p>
                <p style="text-align:center;"><a href="%s">Track booking online</a></p>
                """
                        .formatted(
                                BRAND_GREEN,
                                escape(booking.getBookingNumber()),
                                row("Route", booking.getFromDistrict() + " → " + booking.getToDistrict()),
                                row("Dates", booking.getStartDate() + " to " + booking.getEndDate()),
                                escape(nullToDash(booking.getAssignedDriverName())),
                                escape(nullToDash(booking.getAssignedDriverPhone())),
                                escape(booking.getPickupLocation()),
                                escape(booking.getDropLocation()),
                                pdfLink,
                                trackUrl(frontendUrl, booking.getBookingNumber())));
    }

    public static String bookingRejected(Booking booking) {
        return wrap(
                "Booking Update",
                """
                <p>Dear <strong>%s</strong>,</p>
                <p>We're sorry — we couldn't confirm booking <strong>%s</strong> at this time.</p>
                <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:20px 0;">
                  <strong>Reason:</strong><br/>%s
                </div>
                <p>Please contact us to reschedule: <a href="mailto:support@tsl.lk">support@tsl.lk</a></p>
                <p>Would you like to try alternative dates? Reply to this email and our team will help.</p>
                """
                        .formatted(
                                escape(booking.getCustomerName()),
                                escape(booking.getBookingNumber()),
                                escape(booking.getRejectionReason() != null
                                        ? booking.getRejectionReason()
                                        : "Not specified")));
    }

    public static String newBookingAdminAlert(Booking booking, String adminDashboardUrl) {
        return """
                <html><body style="font-family:Arial,sans-serif;color:#333;">
                <h2>🔔 New Booking — %s</h2>
                <p><strong>Customer:</strong> %s (%s)</p>
                <p><strong>Route:</strong> %s → %s</p>
                <p><strong>Dates:</strong> %s to %s (%d days)</p>
                <p><strong>Passengers:</strong> %d | <strong>Vehicle:</strong> %s</p>
                <p><strong>Total:</strong> LKR %s</p>
                <p><a href="%s">Review in admin dashboard</a></p>
                </body></html>
                """
                .formatted(
                        escape(booking.getBookingNumber()),
                        escape(booking.getCustomerName()),
                        escape(booking.getCustomerEmail()),
                        escape(booking.getFromDistrict()),
                        escape(booking.getToDistrict()),
                        booking.getStartDate(),
                        booking.getEndDate(),
                        booking.getNumberOfDays(),
                        booking.getPassengerCount(),
                        booking.getVehicleType(),
                        booking.getTotalPriceLKR(),
                        adminDashboardUrl);
    }

    public static String driverAssignment(Booking booking) {
        String waLink = whatsappLink(booking.getCustomerWhatsapp());
        return wrap(
                "New Trip Assignment",
                """
                <p>Hi, you have been assigned to booking <strong>%s</strong>.</p>
                <table style="width:100%%;border-collapse:collapse;">
                  %s
                  %s
                  %s
                  %s
                  %s
                  %s
                  %s
                </table>
                <p><strong>Customer:</strong> %s<br/>
                <strong>WhatsApp:</strong> <a href="%s">%s</a></p>
                """
                        .formatted(
                                escape(booking.getBookingNumber()),
                                row("Start Date", String.valueOf(booking.getStartDate())),
                                row("Pickup", booking.getPickupLocation()),
                                row("Drop-off", booking.getDropLocation()),
                                row("Duration", booking.getNumberOfDays() + " days"),
                                row("Passengers", String.valueOf(booking.getPassengerCount())),
                                row("Total (LKR)", String.valueOf(booking.getTotalPriceLKR())),
                                row("Status", booking.getStatus().name()),
                                escape(booking.getCustomerName()),
                                waLink,
                                escape(booking.getCustomerWhatsapp())));
    }

    private static String wrap(String title, String body) {
        return """
                <!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
                <body style="margin:0;padding:0;background:%s;font-family:Georgia,serif;">
                <div style="max-width:600px;margin:0 auto;background:#fff;">
                  <div style="background:%s;color:#fff;padding:24px;text-align:center;">
                    <h1 style="margin:0;font-size:24px;">TSL — Tourism Sri Lanka</h1>
                    <p style="margin:8px 0 0;opacity:0.9;">Your Adventure Awaits 🌴</p>
                  </div>
                  <div style="padding:32px 24px;font-family:Arial,sans-serif;color:#333;line-height:1.6;">
                    %s
                  </div>
                  <div style="background:%s;padding:20px;text-align:center;font-size:12px;color:#666;font-family:Arial,sans-serif;">
                    <p style="margin:0;">support@tsl.lk | +94 11 234 5678 | www.tsl.lk</p>
                    <p style="margin:8px 0 0;">Discover the pearl of the Indian Ocean with TSL</p>
                  </div>
                </div></body></html>
                """
                .formatted(ACCENT_SAND, BRAND_GREEN, body, ACCENT_SAND);
    }

    private static String tripSummaryRows(Booking booking) {
        return row("Route", booking.getFromDistrict() + " → " + booking.getToDistrict())
                + row("Dates", booking.getStartDate() + " to " + booking.getEndDate())
                + row("Passengers", String.valueOf(booking.getPassengerCount()))
                + row("Vehicle", booking.getVehicleType().name())
                + row("Total (LKR)", String.valueOf(booking.getTotalPriceLKR()))
                + row("Status", booking.getStatus().name());
    }

    private static String row(String label, String value) {
        return """
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #eee;width:40%%;"><strong>%s</strong></td>
                  <td style="padding:8px;border-bottom:1px solid #eee;">%s</td>
                </tr>
                """.formatted(escape(label), escape(value));
    }

    private static String trackUrl(String frontendUrl, String bookingNumber) {
        String base = frontendUrl != null ? frontendUrl.replaceAll("/$", "") : "http://localhost:3000";
        return base + "/track/" + bookingNumber;
    }

    private static String whatsappLink(String number) {
        if (number == null) {
            return "#";
        }
        String digits = number.replaceAll("[^0-9]", "");
        return "https://wa.me/" + digits;
    }

    private static String escape(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private static String escapeAttr(String text) {
        return escape(text);
    }

    private static String nullToDash(String value) {
        return value != null ? value : "—";
    }

    public static String lkrPerUnitCurrency(Booking booking) {
        if (booking.getExchangeRateUsed() == null
                || booking.getExchangeRateUsed().compareTo(BigDecimal.ZERO) == 0) {
            return "N/A";
        }
        BigDecimal lkrPerUnit = BigDecimal.ONE.divide(
                booking.getExchangeRateUsed(), 2, RoundingMode.HALF_UP);
        return "1 %s = %s LKR".formatted(
                booking.getPreferredCurrency() != null ? booking.getPreferredCurrency() : "USD",
                lkrPerUnit.toPlainString());
    }

    public static String statusLabel(BookingStatus status) {
        return status != null ? status.name() : "PENDING";
    }
}
