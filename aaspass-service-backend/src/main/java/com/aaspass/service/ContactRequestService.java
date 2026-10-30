package com.aaspass.service;

import com.aaspass.config.security.CurrentUser;
import com.aaspass.dto.request.ContactRequestCreate;
import com.aaspass.dto.response.ContactRequestResponse;
import com.aaspass.entity.ContactRequest;
import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.entity.User;
import com.aaspass.exception.RateLimitedException;
import com.aaspass.repository.ContactRequestRepository;
import com.aaspass.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

/** Handles public contact/feedback submissions: honeypot, throttling, normalization and persistence. */
@Service
public class ContactRequestService {

    private static final Logger log = LoggerFactory.getLogger(ContactRequestService.class);

    /** Max requests per email or IP within {@link #THROTTLE_WINDOW_HOURS}. */
    private static final int THROTTLE_LIMIT = 5;
    private static final long THROTTLE_WINDOW_HOURS = 1;

    private final ContactRequestRepository repository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public ContactRequestService(ContactRequestRepository repository, UserRepository userRepository,
                                 CurrentUser currentUser) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
    }

    @Transactional
    public ContactRequestResponse create(ContactRequestCreate req, String ip) {
        if (req.website() != null && !req.website().isBlank()) {
            log.warn("[CONTACT] honeypot hit from ip={}", ip);
            return new ContactRequestResponse(null, req.type(), ContactRequestStatus.NEW, LocalDateTime.now());
        }

        String email = trimToEmpty(req.email()).toLowerCase(Locale.ROOT);
        LocalDateTime since = LocalDateTime.now().minusHours(THROTTLE_WINDOW_HOURS);
        boolean limited = repository.countByEmailAndCreationDateTimeAfter(email, since) >= THROTTLE_LIMIT
                || (ip != null && repository.countBySubmitterIpAndCreationDateTimeAfter(ip, since) >= THROTTLE_LIMIT);
        if (limited) {
            log.warn("[CONTACT] throttled email={} ip={}", maskEmail(email), ip);
            throw new RateLimitedException("Too many requests, please try again later.");
        }

        ContactRequest entity = new ContactRequest();
        entity.setType(req.type());
        entity.setStatus(ContactRequestStatus.NEW);
        entity.setName(trimToEmpty(req.name()));
        entity.setEmail(email);
        String phone = req.phone() == null ? null : req.phone().trim();
        entity.setPhone(phone == null || phone.isEmpty() ? null : phone);
        entity.setSubject(trimToEmpty(req.subject()));
        entity.setMessage(req.message());
        entity.setSubmitterIp(ip);
        User user = currentUser.optionalUserId().flatMap(userRepository::findById).orElse(null);
        entity.setUser(user);

        ContactRequest saved = repository.save(entity);
        log.info("[CONTACT] saved id={} type={}", saved.getId(), saved.getType());
        return new ContactRequestResponse(saved.getId(), saved.getType(), saved.getStatus(),
                saved.getCreationDateTime());
    }

    /** Null-safe trim (bean validation enforces non-blank, but the service must not rely on it). */
    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    /** Masks an email for logs: first character + "***" + domain, e.g. a***@x.com. */
    static String maskEmail(String email) {
        if (email == null || email.isEmpty()) {
            return "***";
        }
        int at = email.indexOf('@');
        if (at < 0) {
            return email.charAt(0) + "***";
        }
        return (at == 0 ? "" : email.substring(0, 1)) + "***" + email.substring(at);
    }
}
