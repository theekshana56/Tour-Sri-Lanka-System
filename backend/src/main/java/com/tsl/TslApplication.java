package com.tsl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

import com.tsl.config.AppProperties;
import com.tsl.config.CloudinaryProperties;
import com.tsl.config.JwtProperties;

@SpringBootApplication
@EnableMongoAuditing
@EnableAsync
@EnableConfigurationProperties({JwtProperties.class, CloudinaryProperties.class, AppProperties.class})
public class TslApplication {

    public static void main(String[] args) {
        SpringApplication.run(TslApplication.class, args);
    }
}
