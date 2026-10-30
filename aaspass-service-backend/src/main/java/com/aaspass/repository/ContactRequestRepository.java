package com.aaspass.repository;

import com.aaspass.entity.ContactRequest;
import com.aaspass.entity.ContactRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/** Data access for contact requests, including the counts used by the submit throttle. */
@Repository
public interface ContactRequestRepository
        extends JpaRepository<ContactRequest, Long>, JpaSpecificationExecutor<ContactRequest> {

    long countByEmailAndCreationDateTimeAfter(String email, LocalDateTime after);

    long countBySubmitterIpAndCreationDateTimeAfter(String ip, LocalDateTime after);

    long countByStatus(ContactRequestStatus status);
}
