package com.aaspass.admin.repository;

import com.aaspass.admin.entity.AdminAuditEntry;
import com.aaspass.admin.entity.AuditTargetType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAuditRepository extends JpaRepository<AdminAuditEntry, Long> {

    List<AdminAuditEntry> findByTargetTypeAndTargetIdOrderByIdDesc(AuditTargetType targetType, Long targetId);
}
