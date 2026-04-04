package com.smartcampus.resource;

// AvailabilityWindows are embedded inside Resource documents.
// All window operations go through ResourceRepository + MongoTemplate.
// This interface is intentionally empty and kept for backward compatibility
// with any import that may reference it during the transition.
// It is NOT registered as a Spring bean.
public interface AvailabilityWindowRepository {
}
