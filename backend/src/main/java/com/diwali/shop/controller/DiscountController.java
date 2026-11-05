package com.diwali.shop.controller;

import com.diwali.shop.dto.DiscountRequest;
import com.diwali.shop.entity.Discount;
import com.diwali.shop.entity.DiscountType;
import com.diwali.shop.entity.Product;
import com.diwali.shop.repository.DiscountRepository;
import com.diwali.shop.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    private final ProductService productService;
    private final DiscountRepository discountRepository;

    public DiscountController(ProductService productService, DiscountRepository discountRepository) {
        this.productService = productService;
        this.discountRepository = discountRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Discount>> getAllDiscounts() {
        return ResponseEntity.ok(discountRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> applyDiscount(@Valid @RequestBody DiscountRequest request) {
        Product updatedProduct = productService.applyDiscount(request);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> removeDiscount(@PathVariable Long productId) {
        DiscountRequest request = new DiscountRequest();
        request.setProductId(productId);
        request.setDiscountType(DiscountType.NONE);
        request.setDiscountValue(BigDecimal.ZERO);
        Product updatedProduct = productService.applyDiscount(request);
        return ResponseEntity.ok(updatedProduct);
    }
}
