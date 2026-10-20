package com.aaspass.repository;

import com.aaspass.entity.SocialMediaLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialMediaLinkRepository extends JpaRepository<SocialMediaLink, Long> {

    List<SocialMediaLink> findByStoreId(Long storeId);
}
