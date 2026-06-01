package com.tsl.util;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;

import com.tsl.model.Counter;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class BookingIdGenerator {

    private static final String BOOKING_COUNTER_ID = "booking";

    private final MongoTemplate mongoTemplate;

    public String generate() {
        Query query = new Query(Criteria.where("_id").is(BOOKING_COUNTER_ID));
        Update update = new Update().inc("sequence", 1);

        Counter counter = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true).upsert(true),
                Counter.class);

        long sequence = counter != null ? counter.getSequence() - 1 : 0;
        return formatBookingNumber(sequence);
    }

    static String formatBookingNumber(long sequence) {
        if (sequence < 10) {
            return String.format("TSL-V-%02d", sequence);
        }
        return "TSL-V-" + sequence;
    }
}
