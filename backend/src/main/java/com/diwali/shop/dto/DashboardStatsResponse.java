package com.diwali.shop.dto;

import java.util.Map;

public class DashboardStatsResponse {
    private long totalProducts;
    private long totalAvailableStock;
    private long pendingOrders;
    private long ordersReadyForDelivery;
    private long lowStockProducts;
    private long totalCategories;
    private long activePackingOrders;
    private long totalDispatchedOrders;
    private long totalDeliveredOrders;
    private Map<String, Long> ordersByStatus;

    public DashboardStatsResponse() {}

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getTotalAvailableStock() { return totalAvailableStock; }
    public void setTotalAvailableStock(long totalAvailableStock) { this.totalAvailableStock = totalAvailableStock; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getOrdersReadyForDelivery() { return ordersReadyForDelivery; }
    public void setOrdersReadyForDelivery(long ordersReadyForDelivery) { this.ordersReadyForDelivery = ordersReadyForDelivery; }

    public long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }

    public long getTotalCategories() { return totalCategories; }
    public void setTotalCategories(long totalCategories) { this.totalCategories = totalCategories; }

    public long getActivePackingOrders() { return activePackingOrders; }
    public void setActivePackingOrders(long activePackingOrders) { this.activePackingOrders = activePackingOrders; }

    public long getTotalDispatchedOrders() { return totalDispatchedOrders; }
    public void setTotalDispatchedOrders(long totalDispatchedOrders) { this.totalDispatchedOrders = totalDispatchedOrders; }

    public long getTotalDeliveredOrders() { return totalDeliveredOrders; }
    public void setTotalDeliveredOrders(long totalDeliveredOrders) { this.totalDeliveredOrders = totalDeliveredOrders; }

    public Map<String, Long> getOrdersByStatus() { return ordersByStatus; }
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) { this.ordersByStatus = ordersByStatus; }
}
