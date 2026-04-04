package com.smartcampus.resource;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    // Filtering is done via MongoTemplate in ResourceService
}
