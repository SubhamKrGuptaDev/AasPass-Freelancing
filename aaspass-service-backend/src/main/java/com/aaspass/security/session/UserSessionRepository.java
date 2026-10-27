package com.aaspass.security.session;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    Optional<UserSession> findBySessionId(String sessionId);

    Optional<UserSession> findByRefreshTokenHash(String refreshTokenHash);

    Optional<UserSession> findByPreviousRefreshTokenHash(String previousRefreshTokenHash);

    /** Loads the session by current refresh-token hash holding a row lock, serialising concurrent rotations. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from UserSession s where s.refreshTokenHash = :hash")
    Optional<UserSession> findForUpdateByRefreshTokenHash(@Param("hash") String hash);

    /** Same as {@link #findByPreviousRefreshTokenHash} but holding a row lock. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from UserSession s where s.previousRefreshTokenHash = :hash")
    Optional<UserSession> findForUpdateByPreviousRefreshTokenHash(@Param("hash") String hash);
}
