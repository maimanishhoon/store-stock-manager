package com.diwali.shop.service;

import com.diwali.shop.dto.DashboardStatsResponse;
import com.diwali.shop.entity.OrderStatus;
import com.diwali.shop.repository.CategoryRepository;
import com.diwali.shop.repository.OrderRepository;
import com.diwali.shop.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;

    public DashboardService(ProductRepository productRepository,
                            OrderRepository orderRepository,
                            CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
    }

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalProducts(productRepository.count());
        Long totalStock = productRepository.countTotalAvailableStock();
        stats.setTotalAvailableStock(totalStock != null ? totalStock : 0L);

        stats.setPendingOrders(orderRepository.countPendingOrders());
        stats.setOrdersReadyForDelivery(orderRepository.countReadyOrders());
        stats.setLowStockProducts(productRepository.findLowStockProducts().size());
        stats.setTotalCategories(categoryRepository.count());

        Map<String, Long> statusCounts = new HashMap<>();
        long activeCount = 0;
        for (OrderStatus st : OrderStatus.values()) {
            long count = orderRepository.countByStatus(st);
            statusCounts.put(st.name(), count);
            if (st == OrderStatus.PENDING || st == OrderStatus.ACCEPTED || st == OrderStatus.PACKING || st == OrderStatus.READY) {
                activeCount += count;
            }
        }
        stats.setOrdersByStatus(statusCounts);
        stats.setActivePackingOrders(activeCount);
        stats.setTotalDispatchedOrders(statusCounts.getOrDefault(OrderStatus.DISPATCHED.name(), 0L));
        stats.setTotalDeliveredOrders(statusCounts.getOrDefault(OrderStatus.DELIVERED.name(), 0L));

        return stats;
    }
}
