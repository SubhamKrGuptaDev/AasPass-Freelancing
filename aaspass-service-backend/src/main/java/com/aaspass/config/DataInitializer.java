package com.aaspass.config;

import com.aaspass.entity.Address;
import com.aaspass.entity.SocialMediaLink;
import com.aaspass.entity.Store;
import com.aaspass.entity.StoreEngagementStats;
import com.aaspass.entity.StoreReview;
import com.aaspass.entity.StoreServiceItem;
import com.aaspass.entity.StoreSocialMediaLinks;
import com.aaspass.entity.User;
import com.aaspass.entity.UserSocialMediaLinks;
import com.aaspass.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;

/**
 * Initializes default demo accounts and stores if the database is empty,
 * enabling immediate out-of-the-box login testing.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("[DATA INIT] Database already contains {} users. Skipping demo seeding.", userRepository.count());
            return;
        }

        log.info("[DATA INIT] Initializing default demo accounts and storefronts...");

        // 1. Aman Sharma (Regular user exploring gigs)
        User aman = User.builder()
                .name("Aman Sharma")
                .username("aman")
                .email("aman.sharma@example.com")
                .password("password123")
                .phone("+91 98765 43210")
                .aadharNumber("XXXX-XXXX-8921")
                .panNumber("ABCDE1234F")
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80")
                .city("Bengaluru")
                .area("Indiranagar")
                .bio("Tech enthusiast and student exploring freelance gigs and local networking.")
                .memberSince("March 2026")
                .hasStore(false)
                .userSocialMediaLinks(UserSocialMediaLinks.builder()
                        .linkedin("https://linkedin.com/in/amansharma")
                        .github("https://github.com/amansharma-dev")
                        .instagram("https://instagram.com/aman_creative")
                        .build())
                .build();

        aman.addAddress(Address.builder()
                .addressType("HOME")
                .addressLine("12th Main Rd, HAL 2nd Stage")
                .area("Indiranagar")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560038")
                .landmark("Near Metro Station")
                .latitude(12.9716)
                .longitude(77.5946)
                .isDefault(true)
                .build());

        userRepository.save(aman);

        // 2. Priya Nair (PixelCraft Studios - Reels Editor)
        User priya = User.builder()
                .name("Priya Nair")
                .username("priya")
                .email("priya.nair@example.com")
                .password("password123")
                .phone("+91 98111 22334")
                .aadharNumber("XXXX-XXXX-4512")
                .panNumber("PRYNR7890K")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80")
                .city("Bengaluru")
                .area("Indiranagar")
                .bio("College student & passionate video editor specializing in fast-paced viral reels for local cafes and creators.")
                .memberSince("January 2026")
                .hasStore(true)
                .userSocialMediaLinks(UserSocialMediaLinks.builder()
                        .instagram("https://instagram.com/priya_edits")
                        .linkedin("https://linkedin.com/in/priyanair-reels")
                        .youtube("https://youtube.com/@pixelcraft_priya")
                        .build())
                .build();

        priya.addAddress(Address.builder()
                .addressType("WORK")
                .addressLine("100 Feet Rd, Defense Colony")
                .area("Indiranagar")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560038")
                .isDefault(true)
                .build());

        Store priyaStore = Store.builder()
                .ownerName("Priya Nair")
                .storeName("PixelCraft Studios")
                .tagline("Short-form Reels, TikToks & YouTube Shorts Editor")
                .category("Video & Editing")
                .skills(Arrays.asList("Premiere Pro", "CapCut", "Color Grading", "Sound Design", "Motion Graphics"))
                .experienceYears(2)
                .hourlyRate(BigDecimal.valueOf(500))
                .startingPrice(BigDecimal.valueOf(350))
                .area("Indiranagar")
                .city("Bengaluru")
                .serviceRadiusKm(5)
                .description("I turn raw mobile clips into viral 30-sec reels with trending hooks, captions, and beat-matched cuts. Fast 24h turnaround for Indiranagar cafes & creators.")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80")
                .bannerGradient("from-rose-500 to-orange-500")
                .isAvailable(true)
                .memberSince("January 2026")
                .views(StoreEngagementStats.builder().daily(24).weekly(142).monthly(580).lifetime(1890).build())
                .storeSocialMediaLinks(StoreSocialMediaLinks.builder()
                        .instagram("https://instagram.com/pixelcraft_studios")
                        .youtube("https://youtube.com/@pixelcraft_reels")
                        .portfolio("https://pixelcraft.design")
                        .build())
                .build();

        priyaStore.addService(StoreServiceItem.builder()
                .name("30-sec Instagram Reel / Short")
                .price(BigDecimal.valueOf(450))
                .duration("24 hrs")
                .description("Hook design, auto-captions, sound design, color grade, and vertical 9:16 export.")
                .build());

        priyaStore.addService(StoreServiceItem.builder()
                .name("Full YouTube Video Edit (8-12 min)")
                .price(BigDecimal.valueOf(1800))
                .duration("48 hrs")
                .description("B-roll insertion, pacing, audio cleanup, dynamic text callouts, thumbnail suggestion.")
                .build());

        priyaStore.addSocialMediaLink(SocialMediaLink.builder().name("Instagram").url("https://instagram.com/pixelcraft_studios").build());
        priyaStore.addSocialMediaLink(SocialMediaLink.builder().name("YouTube").url("https://youtube.com/@pixelcraft_reels").build());
        priyaStore.addSocialMediaLink(SocialMediaLink.builder().name("Portfolio").url("https://pixelcraft.design").build());

        priyaStore.addReview(StoreReview.builder()
                .userName("Rahul Verma (Cafe Mocha)")
                .rating(5.0)
                .message("Priya edited 5 reels for our cafe launch in Indiranagar. The turnaround was under 24 hours and views hit 50k on Instagram!")
                .reviewDate("Oct 12, 2026")
                .build());

        priya.addStore(priyaStore);
        userRepository.save(priya);

        // 3. Rohan Gupta (CodeSpark Lab - Full Stack Dev)
        User rohan = User.builder()
                .name("Rohan Gupta")
                .username("rohan")
                .email("rohan.gupta@example.com")
                .password("password123")
                .phone("+91 98222 33445")
                .aadharNumber("XXXX-XXXX-7834")
                .panNumber("ROHNG5678L")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80")
                .city("Bengaluru")
                .area("Koramangala")
                .bio("Full-stack developer building modern web apps for local businesses and startups.")
                .memberSince("February 2026")
                .hasStore(true)
                .userSocialMediaLinks(UserSocialMediaLinks.builder()
                        .github("https://github.com/rohangupta-code")
                        .linkedin("https://linkedin.com/in/rohangupta-dev")
                        .build())
                .build();

        Store rohanStore = Store.builder()
                .ownerName("Rohan Gupta")
                .storeName("CodeSpark Lab")
                .tagline("Modern Web Apps, Landing Pages & API Integrations")
                .category("Web, App & Tech Development")
                .skills(Arrays.asList("Angular", "Spring Boot", "React", "Tailwind CSS", "REST APIs"))
                .experienceYears(3)
                .hourlyRate(BigDecimal.valueOf(800))
                .startingPrice(BigDecimal.valueOf(1200))
                .area("Koramangala")
                .city("Bengaluru")
                .serviceRadiusKm(10)
                .description("Specialized in sleek, fast web apps and business landing pages with responsive UI and robust backends.")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80")
                .bannerGradient("from-indigo-600 to-cyan-500")
                .isAvailable(true)
                .memberSince("February 2026")
                .views(StoreEngagementStats.builder().daily(32).weekly(180).monthly(720).lifetime(2400).build())
                .storeSocialMediaLinks(StoreSocialMediaLinks.builder()
                        .github("https://github.com/codespark-lab")
                        .portfolio("https://codespark.dev")
                        .linkedin("https://linkedin.com/in/rohangupta-dev")
                        .build())
                .build();

        rohanStore.addService(StoreServiceItem.builder()
                .name("Landing Page / Business Website")
                .price(BigDecimal.valueOf(3500))
                .duration("3 days")
                .description("High-conversion, mobile-responsive landing page with SEO optimization and contact form.")
                .build());

        rohanStore.addSocialMediaLink(SocialMediaLink.builder().name("GitHub").url("https://github.com/codespark-lab").build());
        rohanStore.addSocialMediaLink(SocialMediaLink.builder().name("Portfolio").url("https://codespark.dev").build());

        rohanStore.addReview(StoreReview.builder()
                .userName("Ananya Deshmukh")
                .rating(4.8)
                .message("Rohan built our boutique landing page on time and within budget. Super easy to communicate with in Koramangala.")
                .reviewDate("Oct 05, 2026")
                .build());

        rohan.addStore(rohanStore);
        userRepository.save(rohan);

        log.info("[DATA INIT] Successfully seeded 3 demo user accounts ('aman', 'priya', 'rohan') with storefronts, packages, and addresses!");
    }
}
