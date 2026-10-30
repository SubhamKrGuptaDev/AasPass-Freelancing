package com.aaspass.admin.service;

import com.aaspass.admin.dto.AdminContactRequestDetail;
import com.aaspass.admin.dto.AdminContactRequestSummary;
import com.aaspass.admin.dto.ContactRequestUpdate;
import com.aaspass.admin.dto.PageResponse;
import com.aaspass.admin.entity.AdminAuditAction;
import com.aaspass.admin.entity.AuditTargetType;
import com.aaspass.entity.ContactRequest;
import com.aaspass.entity.ContactRequestStatus;
import com.aaspass.exception.BadRequestException;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.ContactRequestRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Admin inbox for contact, feedback and complaint submissions. Every change is audited. */
@Service
public class AdminContactRequestService {

    static final int MAX_PAGE_SIZE = 100;

    private final ContactRequestRepository repository;
    private final AdminMapper mapper;
    private final AdminAuditService auditService;
    private final Clock clock;

    public AdminContactRequestService(ContactRequestRepository repository, AdminMapper mapper,
                                      AdminAuditService auditService, Clock clock) {
        this.repository = repository;
        this.mapper = mapper;
        this.auditService = auditService;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminContactRequestSummary> search(String q, String status, String type,
                                                           int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "creationDateTime").and(Sort.by(Sort.Direction.DESC, "id")));
        return PageResponse.of(repository
                .findAll(AdminContactRequestSpecs.filter(q, status, type), pageable)
                .map(mapper::toContactRequestSummary));
    }

    @Transactional(readOnly = true)
    public AdminContactRequestDetail get(Long id) {
        return mapper.toContactRequestDetail(load(id));
    }

    /**
     * Applies a status and/or note change. A blank note clears the note; entering RESOLVED stamps
     * {@code resolvedAt} and leaving it clears the stamp.
     */
    @Transactional
    public AdminContactRequestDetail update(Long id, ContactRequestUpdate update, Long adminId) {
        if (update == null || (update.status() == null && update.adminNote() == null)) {
            throw new BadRequestException("Nothing to update");
        }
        ContactRequest request = load(id);
        StringBuilder details = new StringBuilder();

        ContactRequestStatus old = request.getStatus();
        ContactRequestStatus next = update.status();
        if (next != null && next != old) {
            request.setStatus(next);
            if (next == ContactRequestStatus.RESOLVED) {
                request.setResolvedAt(LocalDateTime.ofInstant(clock.instant(), ZoneId.systemDefault()));
            } else if (old == ContactRequestStatus.RESOLVED) {
                request.setResolvedAt(null);
            }
            details.append("status ").append(old).append(" -> ").append(next);
        }
        if (update.adminNote() != null) {
            request.setAdminNote(update.adminNote().isBlank() ? null : update.adminNote().trim());
            if (details.length() > 0) {
                details.append(", ");
            }
            details.append("note updated");
        }
        request.setHandledByAdminId(adminId);
        repository.saveAndFlush(request);
        if (details.length() > 0) {
            auditService.record(adminId, AdminAuditAction.UPDATE_CONTACT_REQUEST, AuditTargetType.CONTACT_REQUEST,
                    id, details.toString());
        }
        return mapper.toContactRequestDetail(request);
    }

    private ContactRequest load(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Contact request", "id", null);
        }
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact request", "id", id));
    }
}
