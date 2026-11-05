package com.diwali.shop.service;

import com.diwali.shop.dto.CustomerOrderCreateRequest;
import com.diwali.shop.dto.OrderApprovalRequest;
import com.diwali.shop.dto.OrderCreateRequest;
import com.diwali.shop.dto.OrderItemRequest;
import com.diwali.shop.dto.OrderStatusUpdateRequest;
import com.diwali.shop.entity.*;
import com.diwali.shop.repository.OrderRepository;
import com.diwali.shop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        InventoryService inventoryService,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.notificationService = notificationService;
    }

    private String generateOrderNumber() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long seq = orderRepository.findMaxId() + 1;
        return "ORD-" + datePrefix + "-" + seq;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public List<Order> getActivePackingOrders() {
        return orderRepository.findActivePackingOrders(
                List.of(OrderStatus.APPROVED, OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PACKING, OrderStatus.READY, OrderStatus.DISPATCHED)
        );
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
    }

    public Order getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with number: " + orderNumber));
    }

    public List<Order> getOrdersByCustomerPhone(String phone) {
        return orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone);
    }

    @Transactional
    public synchronized Order createOrder(OrderCreateRequest request, String requestedBy) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one product item.");
        }

        // 1. Generate unique order number
        String orderNumber = request.getOrderNumber();
        if (orderNumber == null || orderNumber.trim().isEmpty()) {
            orderNumber = generateOrderNumber();
        }

        if (orderRepository.existsByOrderNumber(orderNumber)) {
            throw new IllegalArgumentException("Order number '" + orderNumber + "' already exists.");
        }

        // 2. Pre-validate stock for all items to fail-fast before reserving anything
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemReq.getProductId()));

            if (product.getProductStatus() != ProductStatus.ACTIVE) {
                throw new IllegalArgumentException("Product '" + product.getName() + "' is currently inactive.");
            }

            if (product.getAvailableStock() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Insufficient available stock for '" + product.getName() +
                        "'. Requested: " + itemReq.getQuantity() + ", Available: " + product.getAvailableStock());
            }
        }

        // 3. Build order and order items
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setRequestedBy(requestedBy);
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;

        Order savedOrder = orderRepository.save(order);

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId()).get();

            BigDecimal priceSnapshot = product.getFinalSellingPrice();
            OrderItem orderItem = new OrderItem(product, itemReq.getQuantity(), priceSnapshot);
            savedOrder.addItem(orderItem);

            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Reserve requested stock
            inventoryService.reserveStock(product, itemReq.getQuantity(), savedOrder.getId(), requestedBy);
        }

        savedOrder.setTotalAmount(totalAmount);
        savedOrder.setFinalPayableAmount(totalAmount);
        savedOrder.setOrderSource("COUNTER");
        savedOrder.setStatus(OrderStatus.APPROVED);
        savedOrder.setApprovedAt(LocalDateTime.now());
        savedOrder.setApprovedBy(requestedBy);
        Order finalizedOrder = orderRepository.save(savedOrder);

        // 4. Send real-time notification to Packing Staff
        notificationService.sendNotification(
                "📦 New Packing Request Received",
                "Order #" + finalizedOrder.getOrderNumber() + " with " + finalizedOrder.getItems().size() +
                        " items was created by " + requestedBy + ". Please review and accept.",
                "NEW_ORDER",
                finalizedOrder.getId(),
                "PACKING_STAFF"
        );

        // Broadcast order update to live WebSocket listeners
        notificationService.broadcastOrderUpdate(finalizedOrder);

        return finalizedOrder;
    }

    @Transactional
    public synchronized Order createCustomerOrder(CustomerOrderCreateRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one product item.");
        }

        String phone = request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : "";
        if (!phone.matches("^[0-9]{10}$")) {
            throw new IllegalArgumentException("Valid 10-digit mobile number is required.");
        }

        // 1. Generate unique order number
        String orderNumber = generateOrderNumber();

        // 2. Pre-validate stock
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemReq.getProductId()));

            if (product.getProductStatus() != ProductStatus.ACTIVE) {
                throw new IllegalArgumentException("Product '" + product.getName() + "' is currently inactive.");
            }

            if (product.getAvailableStock() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Insufficient available stock for '" + product.getName() +
                        "'. Requested: " + itemReq.getQuantity() + ", Available: " + product.getAvailableStock());
            }
        }

        // 3. Build order
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setCustomerPhone(phone);
        order.setCustomerName(request.getCustomerName().trim());
        order.setOrderSource("CUSTOMER_QR");
        order.setRequestedBy("CUSTOMER (" + phone + ")");
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.PENDING_APPROVAL);
        order.setPaymentType("SKIP");
        order.setPaymentStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;
        Order savedOrder = orderRepository.save(order);

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId()).get();
            BigDecimal priceSnapshot = product.getFinalSellingPrice();
            OrderItem orderItem = new OrderItem(product, itemReq.getQuantity(), priceSnapshot);
            savedOrder.addItem(orderItem);

            totalAmount = totalAmount.add(orderItem.getSubtotal());

            // Reserve requested stock so items remain locked while customer is at the counter
            inventoryService.reserveStock(product, itemReq.getQuantity(), savedOrder.getId(), "Customer (" + phone + ")");
        }

        savedOrder.setTotalAmount(totalAmount);
        savedOrder.setFinalPayableAmount(totalAmount);
        Order finalizedOrder = orderRepository.save(savedOrder);

        // 4. Send real-time notification to Shop ADMIN
        notificationService.sendNotification(
                "🔔 New Customer Order Placed",
                "Customer (" + phone + ") placed Order #" + finalizedOrder.getOrderNumber() + 
                        " for ₹" + totalAmount + ". Please review, apply discount/payment, and approve.",
                "NEW_CUSTOMER_ORDER",
                finalizedOrder.getId(),
                "ADMIN"
        );

        // Broadcast order update to live WebSocket listeners
        notificationService.broadcastOrderUpdate(finalizedOrder);

        return finalizedOrder;
    }

    @Transactional
    public synchronized Order approveOrder(Long orderId, OrderApprovalRequest request, String adminUser) {
        Order order = getOrderById(orderId);

        if (order.getStatus() != OrderStatus.PENDING_APPROVAL && order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Only orders awaiting approval can be approved. Current status: " + order.getStatus());
        }

        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal discountAmount = BigDecimal.ZERO;

        DiscountType discountType = request.getDiscountType() != null ? request.getDiscountType() : DiscountType.NONE;
        BigDecimal discountValue = request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO;

        if (discountType == DiscountType.PERCENTAGE) {
            if (discountValue.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = subtotal.multiply(discountValue).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
            }
        } else if (discountType == DiscountType.FIXED) {
            discountAmount = discountValue.min(subtotal);
        }

        BigDecimal finalPayable = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);

        order.setCounterDiscountType(discountType);
        order.setCounterDiscountValue(discountValue);
        order.setCounterDiscountAmount(discountAmount);
        order.setFinalPayableAmount(finalPayable);

        String paymentType = request.getPaymentType() != null ? request.getPaymentType().toUpperCase() : "CASH";
        String paymentStatus = request.getPaymentStatus() != null ? request.getPaymentStatus().toUpperCase() : "PAID";
        order.setPaymentType(paymentType);
        order.setPaymentStatus(paymentStatus);
        order.setPaymentRecordedAt(LocalDateTime.now());
        if (request.getPaymentNotes() != null && !request.getPaymentNotes().trim().isEmpty()) {
            order.setPaymentNotes(request.getPaymentNotes().trim());
        }

        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            String existingNotes = order.getNotes() != null ? order.getNotes() + "\n" : "";
            order.setNotes(existingNotes + "[Admin Note] " + request.getNotes().trim());
        }

        order.setStatus(OrderStatus.APPROVED);
        order.setApprovedAt(LocalDateTime.now());
        order.setApprovedBy(adminUser);

        Order saved = orderRepository.save(order);

        // Send real-time notification to PACKING_STAFF now that order is approved!
        notificationService.sendNotification(
                "📦 New Packing Request Approved",
                "Order #" + saved.getOrderNumber() + " (" + saved.getItems().size() + 
                        " items) approved by " + adminUser + ". Payment: " + paymentType + " (" + paymentStatus + "). Please pack.",
                "NEW_ORDER",
                saved.getId(),
                "PACKING_STAFF"
        );

        // Also broadcast update to WebSocket listeners
        notificationService.broadcastOrderUpdate(saved);

        return saved;
    }

    @Transactional
    public synchronized Order updateOrderStatus(Long orderId, OrderStatusUpdateRequest request, String currentUser, String role) {
        Order order = getOrderById(orderId);
        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (currentStatus == newStatus) {
            return order;
        }

        if (currentStatus == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Delivered orders cannot be modified.");
        }
        if (currentStatus == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cancelled orders cannot be modified.");
        }

        LocalDateTime now = LocalDateTime.now();

        switch (newStatus) {
            case ACCEPTED:
                order.setStatus(OrderStatus.ACCEPTED);
                order.setAcceptedAt(now);
                if (order.getPackingStaff() == null) {
                    order.setPackingStaff(currentUser);
                }
                notificationService.sendNotification(
                        "✅ Packing Request Accepted",
                        "Order #" + order.getOrderNumber() + " has been accepted by " + currentUser + ".",
                        "ORDER_ACCEPTED",
                        order.getId(),
                        "ADMIN"
                );
                break;

            case PACKING:
                order.setStatus(OrderStatus.PACKING);
                order.setPackingStartedAt(now);
                if (order.getPackingStaff() == null) {
                    order.setPackingStaff(currentUser);
                }
                notificationService.sendNotification(
                        "⏳ Packing Started",
                        "Packing for Order #" + order.getOrderNumber() + " is currently in progress (" + currentUser + ").",
                        "PACKING_STARTED",
                        order.getId(),
                        "ADMIN"
                );
                break;

            case READY:
                order.setStatus(OrderStatus.READY);
                order.setReadyAt(now);
                notificationService.sendNotification(
                        "🎉 Order Ready for Delivery",
                        "Order #" + order.getOrderNumber() + " is packed and ready for collection/delivery at counter.",
                        "ORDER_READY",
                        order.getId(),
                        "ADMIN"
                );
                break;

            case DISPATCHED:
                order.setStatus(OrderStatus.DISPATCHED);
                order.setDispatchedAt(now);
                notificationService.sendNotification(
                        "🚚 Order Dispatched",
                        "Order #" + order.getOrderNumber() + " has been dispatched by warehouse packing staff.",
                        "ORDER_DISPATCHED",
                        order.getId(),
                        "ADMIN"
                );
                break;

            case DELIVERED:
                order.setStatus(OrderStatus.DELIVERED);
                order.setDeliveredAt(now);
                // Finalize stock deduction for all items
                for (OrderItem item : order.getItems()) {
                    inventoryService.finalizeStockDeduction(item.getProduct(), item.getQuantity(), order.getId(), currentUser);
                }
                notificationService.sendNotification(
                        "🏁 Order Delivered & Completed",
                        "Order #" + order.getOrderNumber() + " confirmed receipt/delivery. Stock deduction finalized.",
                        "ORDER_DELIVERED",
                        order.getId(),
                        "ALL"
                );
                break;

            case CANCELLED:
                order.setStatus(OrderStatus.CANCELLED);
                order.setCancelledAt(now);
                // Release reserved stock back to available stock
                for (OrderItem item : order.getItems()) {
                    inventoryService.releaseStockReservation(item.getProduct(), item.getQuantity(), order.getId(), currentUser);
                }
                notificationService.sendNotification(
                        "❌ Order Cancelled",
                        "Order #" + order.getOrderNumber() + " was cancelled. Reserved inventory has been released.",
                        "ORDER_CANCELLED",
                        order.getId(),
                        "ALL"
                );
                break;

            default:
                throw new IllegalArgumentException("Unknown status: " + newStatus);
        }

        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            String existingNotes = order.getNotes() != null ? order.getNotes() + "\n" : "";
            order.setNotes(existingNotes + "[" + newStatus + "] " + request.getNotes().trim());
        }

        Order saved = orderRepository.save(order);
        notificationService.broadcastOrderUpdate(saved);
        return saved;
    }
}
