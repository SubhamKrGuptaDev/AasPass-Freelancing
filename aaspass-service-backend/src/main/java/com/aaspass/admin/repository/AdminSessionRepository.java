package com.aaspass.admin.repository;

import com.aaspass.admin.entity.AdminSession;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminSessionRepository extends JpaRepository<AdminSession, Long> {

    Optional<AdminSession> findBySessionId(String sessionId);

    /** Loads the session by current refresh-token hash holding a row lock, serialising concurrent rotations. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AdminSession s where s.refreshTokenHash = :hash")
    Optional<AdminSession> findForUpdateByRefreshTokenHash(@Param("hash") String hash);

    /** Loads the session by previous refresh-token hash holding a row lock (replay detection). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AdminSession s where s.previousRefreshTokenHash = :hash")
    Optional<AdminSession> findForUpdateByPreviousRefreshTokenHash(@Param("hash") String hash);
}
