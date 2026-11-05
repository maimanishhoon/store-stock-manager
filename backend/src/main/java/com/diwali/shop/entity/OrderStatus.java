package com.diwali.shop.entity;

public enum OrderStatus {
    PENDING_APPROVAL, // Customer placed order via QR, awaiting shop admin approval
    APPROVED,         // Admin approved (discount applied, payment recorded) -> ready for warehouse
    PENDING,          // Legacy / Admin direct internal request
    ACCEPTED,         // Accepted by packing staff
    PACKING,          // Staff started packing
    READY,            // Packing completed, ready for collection/delivery
    DISPATCHED,       // Order dispatched
    DELIVERED,        // Admin confirms receipt / handoff completed -> stock finalized
    CANCELLED         // Cancelled -> reserved stock released
}
