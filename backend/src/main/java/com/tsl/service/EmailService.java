package com.tsl.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.tsl.config.AppProperties;
import com.tsl.model.Booking;
import com.tsl.model.Role;
import com.tsl.repository.UserRepository;
import com.tsl.util.EmailTemplates;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;
    private final UserRepository userRepository;

    @Value("${spring.mail.from:bookings@tsl.lk}")
    private String mailFrom;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendWelcomeEmail(String to, String fullName, String tempPassword) {
        if (mailPassword == null || mailPassword.isBlank() || "placeholder".equals(mailPassword)) {
            log.debug("Skipping welcome email to {} — RESEND_API_KEY not configured", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject("Welcome to TSL Platform");
            helper.setText("""
                    Hello %s,

                    Your account has been created for TSL Platform.

                    Email: %s
                    Temporary Password: %s

                    Please login and change your password.
                    """.formatted(fullName, to, tempPassword), false);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send welcome email to {}", to, ex);
        }
    }

    public void sendBookingReceived(Booking booking) {
        boolean hasPdf = booking.getPdfUrl() != null;
        sendHtml(
                booking.getCustomerEmail(),
                "Booking Received — %s | Tourism Sri Lanka".formatted(booking.getBookingNumber()),
                EmailTemplates.bookingReceived(booking, appProperties.getFrontendUrl(), hasPdf),
                null,
                null);
    }

    public void sendBookingPdfFollowUp(Booking booking, byte[] pdfBytes) {
        sendHtml(
                booking.getCustomerEmail(),
                "Your Booking PDF — %s | Tourism Sri Lanka".formatted(booking.getBookingNumber()),
                EmailTemplates.bookingPdfFollowUp(booking, appProperties.getFrontendUrl()),
                pdfBytes,
                booking.getBookingNumber() + ".pdf");
    }

    public void sendBookingApproved(Booking booking) {
        sendHtml(
                booking.getCustomerEmail(),
                "✅ Booking Confirmed — %s | Your Sri Lanka Trip is ON!".formatted(booking.getBookingNumber()),
                EmailTemplates.bookingApproved(booking, appProperties.getFrontendUrl()),
                null,
                null);
    }

    public void sendBookingRejected(Booking booking) {
        sendHtml(
                booking.getCustomerEmail(),
                "Booking Update — %s | Tourism Sri Lanka".formatted(booking.getBookingNumber()),
                EmailTemplates.bookingRejected(booking),
                null,
                null);
    }

    public void sendNewBookingAlertToAdmin(Booking booking) {
        if (appProperties.getAdminEmails() == null || appProperties.getAdminEmails().isEmpty()) {
            log.warn("No admin emails configured for booking alert {}", booking.getBookingNumber());
            return;
        }
        String dashboardUrl = appProperties.getFrontendUrl() != null
                ? appProperties.getFrontendUrl().replaceAll("/$", "") + "/admin/bookings"
                : "http://localhost:3000/admin/bookings";
        String html = EmailTemplates.newBookingAdminAlert(booking, dashboardUrl);
        for (String adminEmail : appProperties.getAdminEmails()) {
            sendHtml(
                    adminEmail,
                    "🔔 New Booking — %s needs review".formatted(booking.getBookingNumber()),
                    html,
                    null,
                    null);
        }
    }

    public void sendDriverAssignment(Booking booking) {
        if (booking.getAssignedDriverId() == null) {
            return;
        }
        userRepository.findById(booking.getAssignedDriverId()).ifPresent(driver -> {
            if (driver.getRole() != Role.DRIVER || driver.getEmail() == null) {
                return;
            }
            sendHtml(
                    driver.getEmail(),
                    "New Trip Assignment — %s | %s".formatted(
                            booking.getBookingNumber(), booking.getStartDate()),
                    EmailTemplates.driverAssignment(booking),
                    null,
                    null);
        });
    }

    private void sendHtml(String to, String subject, String html, byte[] attachment, String attachmentName) {
        if (mailPassword == null || mailPassword.isBlank() || "placeholder".equals(mailPassword)) {
            log.debug("Skipping email to {} — RESEND_API_KEY not configured", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            boolean multipart = attachment != null;
            MimeMessageHelper helper = new MimeMessageHelper(message, multipart, "UTF-8");
            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            if (attachment != null && attachmentName != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(attachment), "application/pdf");
            }
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send email to {}: {}", to, subject, ex);
        }
    }
}
