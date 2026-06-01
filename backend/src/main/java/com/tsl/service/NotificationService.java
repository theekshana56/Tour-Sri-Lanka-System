package com.tsl.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.tsl.dto.response.PriceQuoteBreakdown;
import com.tsl.dto.response.PriceQuoteResponse;
import com.tsl.model.Booking;
import com.tsl.model.Place;
import com.tsl.repository.BookingRepository;
import com.tsl.repository.PlaceRepository;
import com.tsl.util.PdfGenerator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final EmailService emailService;
    private final WhatsAppService whatsAppService;
    private final PdfGenerator pdfGenerator;
    private final CloudinaryService cloudinaryService;
    private final PricingService pricingService;
    private final PlaceRepository placeRepository;
    private final BookingRepository bookingRepository;

    @Async
    public void notifyBookingCreated(Booking booking) {
        try {
            emailService.sendBookingReceived(booking);
        } catch (Exception ex) {
            log.error("Failed to send booking received email for {}", booking.getBookingNumber(), ex);
        }
        try {
            emailService.sendNewBookingAlertToAdmin(booking);
        } catch (Exception ex) {
            log.error("Failed to send admin alert for {}", booking.getBookingNumber(), ex);
        }
        try {
            whatsAppService.sendBookingReceived(booking.getCustomerWhatsapp(), booking);
        } catch (Exception ex) {
            log.error("Failed to send WhatsApp received for {}", booking.getBookingNumber(), ex);
        }
        try {
            generateAndAttachPdf(booking, true);
        } catch (Exception ex) {
            log.error("Failed to generate PDF for {}", booking.getBookingNumber(), ex);
        }
    }

    @Async
    public void notifyBookingApproved(Booking booking) {
        try {
            if (booking.getPdfUrl() == null) {
                booking = generateAndAttachPdf(booking, false);
            }
        } catch (Exception ex) {
            log.error("Failed to generate PDF on approval for {}", booking.getBookingNumber(), ex);
        }
        try {
            emailService.sendBookingApproved(booking);
        } catch (Exception ex) {
            log.error("Failed to send approval email for {}", booking.getBookingNumber(), ex);
        }
        try {
            emailService.sendDriverAssignment(booking);
        } catch (Exception ex) {
            log.error("Failed to send driver assignment for {}", booking.getBookingNumber(), ex);
        }
        try {
            whatsAppService.sendBookingApproved(booking.getCustomerWhatsapp(), booking);
        } catch (Exception ex) {
            log.error("Failed to send WhatsApp approval for {}", booking.getBookingNumber(), ex);
        }
    }

    @Async
    public void notifyBookingRejected(Booking booking) {
        try {
            emailService.sendBookingRejected(booking);
        } catch (Exception ex) {
            log.error("Failed to send rejection email for {}", booking.getBookingNumber(), ex);
        }
        try {
            whatsAppService.sendBookingRejected(booking.getCustomerWhatsapp(), booking);
        } catch (Exception ex) {
            log.error("Failed to send WhatsApp rejection for {}", booking.getBookingNumber(), ex);
        }
    }

    /**
     * Generates PDF, uploads to Cloudinary, updates booking.pdfUrl.
     *
     * @param sendFollowUpEmail when true and PDF was newly created, emails customer with attachment
     */
    private Booking generateAndAttachPdf(Booking booking, boolean sendFollowUpEmail) {
        if (booking.getPdfUrl() != null) {
            return booking;
        }

        List<Place> places = fetchPlaces(booking);
        PriceQuoteBreakdown breakdown = resolvePriceBreakdown(booking);

        byte[] pdfBytes = pdfGenerator.generateBookingPdf(booking, places, breakdown);
        String pdfUrl = cloudinaryService.uploadPdf(pdfBytes, booking.getBookingNumber() + ".pdf");
        if (pdfUrl == null) {
            return booking;
        }

        booking.setPdfUrl(pdfUrl);
        Booking saved = bookingRepository.save(booking);

        if (sendFollowUpEmail) {
            try {
                emailService.sendBookingPdfFollowUp(saved, pdfBytes);
            } catch (Exception ex) {
                log.error("Failed to send PDF follow-up for {}", saved.getBookingNumber(), ex);
            }
        }
        return saved;
    }

    private List<Place> fetchPlaces(Booking booking) {
        if (booking.getSelectedPlaceIds() == null || booking.getSelectedPlaceIds().isEmpty()) {
            return List.of();
        }
        List<Place> places = new ArrayList<>();
        for (String placeId : booking.getSelectedPlaceIds()) {
            placeRepository.findById(placeId).ifPresent(places::add);
        }
        return places;
    }

    private PriceQuoteBreakdown resolvePriceBreakdown(Booking booking) {
        try {
            PriceQuoteResponse quote = pricingService.calculatePrice(
                    booking.getVehicleType().name(),
                    booking.getFromDistrict(),
                    booking.getToDistrict(),
                    booking.getNumberOfDays(),
                    booking.getPassengerCount(),
                    booking.getPreferredCurrency() != null ? booking.getPreferredCurrency() : "USD");
            return quote.getBreakdown();
        } catch (Exception ex) {
            log.warn("Could not resolve price breakdown for PDF {}", booking.getBookingNumber(), ex);
            return null;
        }
    }
}
