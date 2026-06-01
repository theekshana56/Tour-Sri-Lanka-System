package com.tsl.service;

import org.springframework.stereotype.Service;

import com.tsl.config.AppProperties;
import com.tsl.model.Booking;
import com.tsl.model.BookingStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Stub implementation that logs WhatsApp messages to the console.
 *
 * <p>TODO: Integrate Twilio WhatsApp API for production:
 * <ol>
 *   <li>Add dependency: com.twilio.sdk:twilio</li>
 *   <li>Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM (+14155238886 sandbox)</li>
 *   <li>Replace this bean with a TwilioWhatsAppService implementing {@link WhatsAppService}</li>
 *   <li>Use Message.creator(new PhoneNumber("whatsapp:" + to), new PhoneNumber(from), body).create()</li>
 * </ol>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppServiceStubImpl implements WhatsAppService {

    private final AppProperties appProperties;

    @Override
    public void sendBookingReceived(String whatsappNumber, Booking booking) {
        logMessage(whatsappNumber, formatReceived(booking));
    }

    @Override
    public void sendBookingApproved(String whatsappNumber, Booking booking) {
        logMessage(whatsappNumber, formatApproved(booking));
    }

    @Override
    public void sendBookingRejected(String whatsappNumber, Booking booking) {
        logMessage(whatsappNumber, formatRejected(booking));
    }

    private void logMessage(String whatsappNumber, String body) {
        log.info("[WHATSAPP STUB] To: {}\n{}", whatsappNumber, body);
    }

    private String formatReceived(Booking booking) {
        return """
                *TSL Tourism Sri Lanka*
                📩 Booking Received!
                Booking #: %s
                Trip: %s → %s
                Dates: %s - %s (%d days)
                Passengers: %d
                Total: LKR %s (%s %s)
                Track: %s/track/%s
                We'll confirm your booking within 24 hours."""
                .formatted(
                        booking.getBookingNumber(),
                        booking.getFromDistrict(),
                        booking.getToDistrict(),
                        booking.getStartDate(),
                        booking.getEndDate(),
                        booking.getNumberOfDays(),
                        booking.getPassengerCount(),
                        formatMoney(booking.getTotalPriceLKR()),
                        booking.getPreferredCurrency(),
                        formatMoney(booking.getTotalPriceForeign()),
                        trackBaseUrl(),
                        booking.getBookingNumber());
    }

    private String formatApproved(Booking booking) {
        String driverLine = booking.getAssignedDriverName() != null
                ? "Driver: %s | %s".formatted(booking.getAssignedDriverName(), booking.getAssignedDriverPhone())
                : "Driver: To be assigned";
        return """
                *TSL Tourism Sri Lanka*
                ✅ Booking Confirmed!
                Booking #: %s
                Trip: %s → %s
                Dates: %s - %s (%d days)
                Passengers: %d
                Total: LKR %s (%s %s)
                %s
                Track: %s/track/%s"""
                .formatted(
                        booking.getBookingNumber(),
                        booking.getFromDistrict(),
                        booking.getToDistrict(),
                        booking.getStartDate(),
                        booking.getEndDate(),
                        booking.getNumberOfDays(),
                        booking.getPassengerCount(),
                        formatMoney(booking.getTotalPriceLKR()),
                        booking.getPreferredCurrency(),
                        formatMoney(booking.getTotalPriceForeign()),
                        driverLine,
                        trackBaseUrl(),
                        booking.getBookingNumber());
    }

    private String formatRejected(Booking booking) {
        return """
                *TSL Tourism Sri Lanka*
                Booking Update
                Booking #: %s
                Status: %s
                Reason: %s
                Contact support@tsl.lk to reschedule."""
                .formatted(
                        booking.getBookingNumber(),
                        BookingStatus.REJECTED,
                        booking.getRejectionReason() != null ? booking.getRejectionReason() : "Not specified");
    }

    private String trackBaseUrl() {
        String url = appProperties.getFrontendUrl();
        return url != null ? url.replaceAll("/$", "") : "http://localhost:3000";
    }

    private static String formatMoney(java.math.BigDecimal amount) {
        return amount != null ? amount.toPlainString() : "0";
    }
}
