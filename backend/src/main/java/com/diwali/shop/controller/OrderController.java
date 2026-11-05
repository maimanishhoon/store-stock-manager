package com.diwali.shop.controller;

import com.diwali.shop.dto.OrderApprovalRequest;
import com.diwali.shop.dto.OrderCreateRequest;
import com.diwali.shop.dto.OrderStatusUpdateRequest;
import com.diwali.shop.entity.Order;
import com.diwali.shop.entity.OrderStatus;
import com.diwali.shop.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrders(@RequestParam(required = false) OrderStatus status) {
        if (status != null) {
            return ResponseEntity.ok(orderService.getOrdersByStatus(status));
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/packing/queue")
    public ResponseEntity<List<Order>> getPackingQueue() {
        return ResponseEntity.ok(orderService.getActivePackingOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> createOrder(
            @Valid @RequestBody OrderCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        Order createdOrder = orderService.createOrder(request, username);
        return ResponseEntity.ok(createdOrder);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> approveOrder(
            @PathVariable Long id,
            @RequestBody OrderApprovalRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        Order approvedOrder = orderService.approveOrder(id, request, username);
        return ResponseEntity.ok(approvedOrder);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "system";
        String role = "STAFF";
        if (authentication != null && authentication.getAuthorities() != null) {
            for (GrantedAuthority ga : authentication.getAuthorities()) {
                if (ga.getAuthority().startsWith("ROLE_")) {
                    role = ga.getAuthority().replace("ROLE_", "");
                    break;
                }
            }
        }

        // If staff tries to DELIVER (confirm receipt), check rule:
        // Admin confirms receipt -> order becomes delivered.
        if (request.getStatus() == OrderStatus.DELIVERED && !"ADMIN".equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).build();
        }

        Order updated = orderService.updateOrderStatus(id, request, username, role);
        return ResponseEntity.ok(updated);
    }
}
