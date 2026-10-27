package com.aaspass.service;

import com.aaspass.dto.request.StoreReviewRequest;
import com.aaspass.dto.response.StoreReviewResponse;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreReview;
import com.aaspass.entity.User;
import com.aaspass.exception.ResourceNotFoundException;
import com.aaspass.repository.StoreRepository;
import com.aaspass.repository.StoreReviewRepository;
import com.aaspass.repository.UserRepository;
import com.aaspass.service.mapper.DtoMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing client customer reviews and ratings (bounded 1.0 to 5.0).
 */
@Service
public class StoreReviewService {

    private static final Logger log = LoggerFactory.getLogger(StoreReviewService.class);

    private final StoreReviewRepository reviewRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreReviewService(StoreReviewRepository reviewRepository, StoreRepository storeRepository,
                              UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.storeRepository = storeRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<StoreReviewResponse> getReviewsByStoreId(Long storeId) {
        log.info("[STORE REVIEW] Fetching reviews for store ID: {}", storeId);
        if (!storeRepository.existsById(storeId)) {
            throw new ResourceNotFoundException("Store", "id", storeId);
        }
        return reviewRepository.findByStoreIdOrderByCreationDateTimeDesc(storeId).stream()
                .map(DtoMapper::toStoreReviewResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StoreReviewResponse addReview(Long storeId, Long reviewerId, StoreReviewRequest request) {
        log.info("[STORE REVIEW] Adding review for store ID: {} from user ID: {}, rating: {}",
                storeId, reviewerId, request.rating());

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reviewerId));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));

        // Enforce strict bounding between 1.0 and 5.0 with safe null default for rating
        double rawRating = request.rating() != null ? request.rating() : 5.0;
        double clampedRating = Math.max(1.0, Math.min(5.0, rawRating));

        String reviewDate = LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));

        String reviewerName = reviewer.getName() != null && !reviewer.getName().isBlank()
                ? reviewer.getName().trim()
                : "Anonymous";

        StoreReview review = StoreReview.builder()
                .store(store)
                .userName(reviewerName)
                .userAvatar(reviewer.getAvatarUrl() != null && !reviewer.getAvatarUrl().isBlank() ? reviewer.getAvatarUrl() :
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80")
                .rating(clampedRating)
                .message(request.message() != null ? request.message().trim() : "")
                .reviewDate(reviewDate)
                .build();

        store.addReview(review);
        StoreReview saved = reviewRepository.save(review);
        log.info("[STORE REVIEW] Review saved with ID: {} for store ID: {}", saved.getId(), storeId);
        return DtoMapper.toStoreReviewResponse(saved);
    }
}
