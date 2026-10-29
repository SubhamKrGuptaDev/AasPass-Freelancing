package com.aaspass.repository;

import com.aaspass.entity.UserProfilePicture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfilePictureRepository extends JpaRepository<UserProfilePicture, Long> {

    Optional<UserProfilePicture> findByUserId(Long userId);

    /** @return number of rows removed (0 when the user had no picture) */
    @Modifying
    @Query("DELETE FROM UserProfilePicture p WHERE p.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
