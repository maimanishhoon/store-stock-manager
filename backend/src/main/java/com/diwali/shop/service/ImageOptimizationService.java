package com.diwali.shop.service;

import com.sksamuel.scrimage.ImmutableImage;
import com.sksamuel.scrimage.webp.WebpWriter;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class ImageOptimizationService {

    private static final Logger log = LoggerFactory.getLogger(ImageOptimizationService.class);

    // Dimension specifications for image variants
    public static final int MAX_ORIGINAL_DIMENSION = 1600;
    public static final int DETAIL_DIMENSION = 900;
    public static final int CARD_DIMENSION = 400;
    public static final int THUMB_DIMENSION = 150;
    public static final int WEBP_QUALITY = 82;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        // Detect native system cwebp (e.g. in Alpine Docker containers)
        File systemCwebp = new File("/usr/bin/cwebp");
        if (systemCwebp.exists() && systemCwebp.canExecute()) {
            System.setProperty("com.sksamuel.scrimage.webp.binary.dir", "/usr/bin");
            log.info("Scrimage configured to use system cwebp at /usr/bin");
        } else {
            log.info("Scrimage using bundled WebP binary for platform");
        }
    }

    /**
     * Validates and optimizes an uploaded image file into multiple WebP variants.
     *
     * @param file The uploaded MultipartFile
     * @return Map containing URLs of the generated image variants
     * @throws IOException on validation or processing failure
     */
    public Map<String, String> processAndSaveImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded image file is empty or missing.");
        }

        // 1. Validate file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Image file size exceeds maximum limit of 10MB.");
        }

        // 2. Validate MIME content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported image format. Allowed formats: JPEG, PNG, WebP.");
        }

        byte[] fileBytes = file.getBytes();

        // 3. Validate actual image content (prevent fake files or corrupted payloads)
        ImmutableImage image;
        try (InputStream in = new ByteArrayInputStream(fileBytes)) {
            image = ImmutableImage.loader().fromStream(in);
        } catch (Exception e) {
            log.warn("Failed to load image with Scrimage, attempting ImageIO fallback: {}", e.getMessage());
            try (InputStream in = new ByteArrayInputStream(fileBytes)) {
                BufferedImage bimg = ImageIO.read(in);
                if (bimg == null) {
                    throw new IllegalArgumentException("File is not a valid or readable image.");
                }
                image = ImmutableImage.fromAwt(bimg);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid or corrupted image file: " + ex.getMessage());
            }
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 4. Generate unique base filename
        String baseName = UUID.randomUUID().toString();

        // 5. Generate variants
        // Full / High-Res (max 1600x1600)
        ImmutableImage highRes = image.bound(MAX_ORIGINAL_DIMENSION, MAX_ORIGINAL_DIMENSION);
        Path highResPath = uploadPath.resolve(baseName + ".webp");
        writeWebp(highRes, highResPath);

        // Detail variant (~900x900)
        ImmutableImage detail = image.bound(DETAIL_DIMENSION, DETAIL_DIMENSION);
        Path detailPath = uploadPath.resolve(baseName + "_detail.webp");
        writeWebp(detail, detailPath);

        // Product Card variant (~400x400)
        ImmutableImage card = image.bound(CARD_DIMENSION, CARD_DIMENSION);
        Path cardPath = uploadPath.resolve(baseName + "_card.webp");
        writeWebp(card, cardPath);

        // Thumbnail variant (~150x150)
        ImmutableImage thumb = image.bound(THUMB_DIMENSION, THUMB_DIMENSION);
        Path thumbPath = uploadPath.resolve(baseName + "_thumb.webp");
        writeWebp(thumb, thumbPath);

        Map<String, String> result = new HashMap<>();
        result.put("imageUrl", "/uploads/" + baseName + ".webp");
        result.put("detailUrl", "/uploads/" + baseName + "_detail.webp");
        result.put("cardUrl", "/uploads/" + baseName + "_card.webp");
        result.put("thumbnailUrl", "/uploads/" + baseName + "_thumb.webp");

        log.info("Optimized image {}: {}x{} -> WebP variants generated in {}",
                file.getOriginalFilename(), image.width, image.height, uploadPath);

        return result;
    }

    /**
     * Writes an ImmutableImage to disk as WebP with high-quality compression.
     */
    private void writeWebp(ImmutableImage img, Path target) throws IOException {
        try {
            img.output(WebpWriter.DEFAULT.withQ(WEBP_QUALITY), target);
        } catch (Exception e) {
            log.warn("WebP output failed for {}, falling back to JPEG: {}", target, e.getMessage());
            // Fallback to high quality JPEG if WebP writer encounters native binary issues
            String jpgName = target.getFileName().toString().replace(".webp", ".jpg");
            Path jpgTarget = target.getParent().resolve(jpgName);
            ImageIO.write(img.awt(), "jpg", jpgTarget.toFile());
        }
    }

    /**
     * Migration utility to optimize any existing unoptimized images in the upload folder.
     */
    public Map<String, Object> migrateExistingImages() {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        int scanned = 0;
        int converted = 0;
        int skipped = 0;

        if (!Files.exists(uploadPath)) {
            return Map.of("scanned", 0, "converted", 0, "skipped", 0);
        }

        try (var stream = Files.list(uploadPath)) {
            List<Path> files = stream.filter(Files::isRegularFile).toList();
            for (Path path : files) {
                String filename = path.getFileName().toString();
                String lower = filename.toLowerCase();
                if ((lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")) &&
                        !lower.contains("_thumb") && !lower.contains("_card") && !lower.contains("_detail")) {
                    scanned++;
                    String baseName = filename.substring(0, filename.lastIndexOf('.'));
                    Path targetWebp = uploadPath.resolve(baseName + ".webp");

                    if (Files.exists(targetWebp)) {
                        skipped++;
                        continue;
                    }

                    try {
                        ImmutableImage image = ImmutableImage.loader().fromFile(path.toFile());
                        // Generate variants without deleting original
                        writeWebp(image.bound(MAX_ORIGINAL_DIMENSION, MAX_ORIGINAL_DIMENSION), targetWebp);
                        writeWebp(image.bound(DETAIL_DIMENSION, DETAIL_DIMENSION), uploadPath.resolve(baseName + "_detail.webp"));
                        writeWebp(image.bound(CARD_DIMENSION, CARD_DIMENSION), uploadPath.resolve(baseName + "_card.webp"));
                        writeWebp(image.bound(THUMB_DIMENSION, THUMB_DIMENSION), uploadPath.resolve(baseName + "_thumb.webp"));
                        converted++;
                    } catch (Exception e) {
                        log.error("Failed to migrate legacy image {}: {}", filename, e.getMessage());
                    }
                }
            }
        } catch (IOException e) {
            log.error("Error scanning upload directory for migration: {}", e.getMessage());
        }

        Map<String, Object> res = new HashMap<>();
        res.put("scanned", scanned);
        res.put("converted", converted);
        res.put("skipped", skipped);
        return res;
    }
}
