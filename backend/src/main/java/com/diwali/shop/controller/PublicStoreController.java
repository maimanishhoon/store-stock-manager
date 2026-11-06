package com.diwali.shop.controller;

import com.diwali.shop.dto.CartValidationRequest;
import com.diwali.shop.dto.CartValidationResponse;
import com.diwali.shop.dto.CustomerOrderCreateRequest;
import com.diwali.shop.dto.OrderItemRequest;
import com.diwali.shop.entity.Category;
import com.diwali.shop.entity.Order;
import com.diwali.shop.entity.Product;
import com.diwali.shop.entity.ProductStatus;
import com.diwali.shop.repository.CategoryRepository;
import com.diwali.shop.repository.ProductRepository;
import com.diwali.shop.service.OrderService;
import com.diwali.shop.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
public class PublicStoreController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderService orderService;

    public PublicStoreController(ProductService productService,
                                 ProductRepository productRepository,
                                 CategoryRepository categoryRepository,
                                 OrderService orderService) {
        this.productService = productService;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderService = orderService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getPublicCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getPublicProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId
    ) {
        List<Product> products = productService.searchAvailableProducts(query, categoryId);
        return ResponseEntity.ok(products);
    }

    @PostMapping("/cart/validate")
    public ResponseEntity<CartValidationResponse> validateCart(@RequestBody CartValidationRequest request) {
        CartValidationResponse response = new CartValidationResponse();
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.ok(response);
        }

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) continue;
            Optional<Product> prodOpt = productRepository.findById(itemReq.getProductId());
            if (prodOpt.isEmpty()) {
                response.getNotices().add(new CartValidationResponse.CartNotice(
                        itemReq.getProductId(),
                        "Unknown Product",
                        "REMOVED",
                        "This product is no longer available and has been removed from your cart."
                ));
                continue;
            }

            Product product = prodOpt.get();
            if (product.getProductStatus() != ProductStatus.ACTIVE) {
                response.getNotices().add(new CartValidationResponse.CartNotice(
                        product.getId(),
                        product.getName(),
                        "REMOVED",
                        "This product ('" + product.getName() + "') is no longer available and has been removed from your cart."
                ));
                continue;
            }

            if (product.getAvailableStock() <= 0) {
                response.getNotices().add(new CartValidationResponse.CartNotice(
                        product.getId(),
                        product.getName(),
                        "REMOVED",
                        "This product ('" + product.getName() + "') is out of stock and has been removed from your cart."
                ));
                continue;
            }

            int requestedQty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            int validQty = Math.min(requestedQty, product.getAvailableStock());

            if (validQty < requestedQty) {
                response.getNotices().add(new CartValidationResponse.CartNotice(
                        product.getId(),
                        product.getName(),
                        "ADJUSTED",
                        "Quantity for '" + product.getName() + "' adjusted from " + requestedQty + " to available stock (" + validQty + ")."
                ));
            }

            response.getValidItems().add(new CartValidationResponse.CartValidatedItem(product, requestedQty, validQty));
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders")
    public ResponseEntity<Order> placeCustomerOrder(@Valid @RequestBody CustomerOrderCreateRequest request) {
        Order order = orderService.createCustomerOrder(request);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<Order> getCustomerOrder(@PathVariable String orderNumber) {
        Order order = orderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/orders/track")
    public ResponseEntity<List<Order>> trackOrdersByPhone(@RequestParam String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(orderService.getOrdersByCustomerPhone(phone.trim()));
    }
}
