package com.diwali.shop.repository;

import com.diwali.shop.entity.Order;
import com.diwali.shop.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    boolean existsByOrderNumber(String orderNumber);

    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    @Query("SELECT o FROM Order o WHERE o.status IN :statuses ORDER BY o.createdAt ASC")
    List<Order> findActivePackingOrders(@Param("statuses") List<OrderStatus> statuses);

    long countByStatus(OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN ('APPROVED', 'PENDING', 'ACCEPTED', 'PACKING')")
    long countPendingOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'PENDING_APPROVAL'")
    long countPendingApprovalOrders();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'READY'")
    long countReadyOrders();

    @Query("SELECT COALESCE(MAX(o.id), 1000) FROM Order o")
    long findMaxId();
}
