package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;

// Dynamic filtering is handled via MongoTemplate in ResourceService
public interface ResourceRepository extends MongoRepository<Resource, String> {
}
