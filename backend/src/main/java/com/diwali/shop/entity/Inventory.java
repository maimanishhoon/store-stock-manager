package com.diwali.shop.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(name = "current_stock", nullable = false)
    private Integer currentStock = 0;

    @Column(name = "reserved_stock", nullable = false)
    private Integer reservedStock = 0;

    @Column(name = "warehouse_bin", length = 50)
    private String warehouseBin = "Section-A";

    @Column(name = "last_replenished_at")
    private LocalDateTime lastReplenishedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Inventory() {}

    public Inventory(Product product, Integer currentStock, Integer reservedStock, String warehouseBin) {
        this.product = product;
        this.currentStock = currentStock;
        this.reservedStock = reservedStock;
        this.warehouseBin = warehouseBin;
        this.lastReplenishedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Integer getReservedStock() { return reservedStock; }
    public void setReservedStock(Integer reservedStock) { this.reservedStock = reservedStock; }

    public String getWarehouseBin() { return warehouseBin; }
    public void setWarehouseBin(String warehouseBin) { this.warehouseBin = warehouseBin; }

    public LocalDateTime getLastReplenishedAt() { return lastReplenishedAt; }
    public void setLastReplenishedAt(LocalDateTime lastReplenishedAt) { this.lastReplenishedAt = lastReplenishedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
