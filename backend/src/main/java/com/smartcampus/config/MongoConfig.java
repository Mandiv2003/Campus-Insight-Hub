package com.smartcampus.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.time.LocalTime;
import java.util.List;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create(mongoUri);
    }

    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory() {
        return new SimpleMongoClientDatabaseFactory(mongoClient(), "smartcampus");
    }

    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(List.of(
                new LocalTimeReadConverter(),
                new LocalTimeWriteConverter()
        ));
    }

    @ReadingConverter
    static class LocalTimeReadConverter implements Converter<Document, LocalTime> {
        @Override
        public LocalTime convert(Document source) {
            int hour   = source.getInteger("hour",   0);
            int minute = source.getInteger("minute", 0);
            int second = source.getInteger("second", 0);
            return LocalTime.of(hour, minute, second);
        }
    }

    @WritingConverter
    static class LocalTimeWriteConverter implements Converter<LocalTime, Document> {
        @Override
        public Document convert(LocalTime source) {
            return new Document("hour",   source.getHour())
                    .append("minute", source.getMinute())
                    .append("second", source.getSecond())
                    .append("nano",   source.getNano());
        }
    }
}
