package com.diwali.shop.controller;

import com.diwali.shop.dto.CustomerOrderCreateRequest;
import com.diwali.shop.entity.Category;
import com.diwali.shop.entity.Order;
import com.diwali.shop.entity.Product;
import com.diwali.shop.entity.ProductStatus;
import com.diwali.shop.repository.CategoryRepository;
import com.diwali.shop.service.OrderService;
import com.diwali.shop.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicStoreController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final OrderService orderService;

    public PublicStoreController(ProductService productService,
                                 CategoryRepository categoryRepository,
                                 OrderService orderService) {
        this.productService = productService;
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
        List<Product> products = productService.searchProducts(query, categoryId, ProductStatus.ACTIVE);
        return ResponseEntity.ok(products);
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
