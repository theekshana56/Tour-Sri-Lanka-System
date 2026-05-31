package com.tsl.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

@Component
public class BookingIdGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final AtomicInteger sequence = new AtomicInteger(1);

    public String generate() {
        String datePart = LocalDate.now().format(DATE_FORMAT);
        int seq = sequence.getAndIncrement();
        return String.format("TSL-%s-%04d", datePart, seq);
    }
}
