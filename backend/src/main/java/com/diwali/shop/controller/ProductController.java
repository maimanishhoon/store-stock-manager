package com.diwali.shop.controller;

import com.diwali.shop.dto.ProductRequest;
import com.diwali.shop.entity.Category;
import com.diwali.shop.entity.Product;
import com.diwali.shop.entity.ProductStatus;
import com.diwali.shop.repository.CategoryRepository;
import com.diwali.shop.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final com.diwali.shop.service.ImageOptimizationService imageOptimizationService;

    public ProductController(ProductService productService,
                             CategoryRepository categoryRepository,
                             com.diwali.shop.service.ImageOptimizationService imageOptimizationService) {
        this.productService = productService;
        this.categoryRepository = categoryRepository;
        this.imageOptimizationService = imageOptimizationService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductStatus status
    ) {
        if (query != null || categoryId != null || status != null) {
            return ResponseEntity.ok(productService.searchProducts(query, categoryId, status));
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> createProduct(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        Product created = productService.createProduct(request, username);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        Product updated = productService.updateProduct(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Product deleted successfully");
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/products/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> toggleProductStatus(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleStatus(id));
    }

    @PostMapping("/products/upload-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, String> variants = imageOptimizationService.processAndSaveImage(file);
            return ResponseEntity.ok(variants);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (IOException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Image upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    @PostMapping("/products/images/migrate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> migrateImages() {
        imageOptimizationService.ensureSeedImagesExtracted();
        return ResponseEntity.ok(imageOptimizationService.migrateExistingImages());
    }
}
