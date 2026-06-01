package com.tsl.service;

import com.tsl.model.Booking;

public interface WhatsAppService {

    void sendBookingReceived(String whatsappNumber, Booking booking);

    void sendBookingApproved(String whatsappNumber, Booking booking);

    void sendBookingRejected(String whatsappNumber, Booking booking);
}
