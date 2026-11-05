package com.diwali.shop.service;

import com.diwali.shop.dto.StockAdjustmentRequest;
import com.diwali.shop.entity.*;
import com.diwali.shop.repository.InventoryRepository;
import com.diwali.shop.repository.InventoryTransactionRepository;
import com.diwali.shop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    public InventoryService(InventoryRepository inventoryRepository,
                            InventoryTransactionRepository transactionRepository,
                            ProductRepository productRepository,
                            NotificationService notificationService) {
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<InventoryTransaction> getTransactionsForProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<InventoryTransaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    public List<Product> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts();
    }

    @Transactional
    public synchronized Product adjustStock(StockAdjustmentRequest request, String performedBy) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + request.getProductId()));

        int oldStock = product.getAvailableStock();
        int newStock = oldStock;

        switch (request.getTransactionType()) {
            case ADD_STOCK:
                newStock = oldStock + request.getQuantity();
                break;
            case REDUCE_STOCK:
                if (oldStock < request.getQuantity()) {
                    throw new IllegalArgumentException("Cannot reduce stock below 0. Current available stock is " + oldStock);
                }
                newStock = oldStock - request.getQuantity();
                break;
            case MANUAL_ADJUSTMENT:
                if (request.getQuantity() < 0) {
                    throw new IllegalArgumentException("Stock quantity cannot be negative.");
                }
                newStock = request.getQuantity();
                break;
            default:
                throw new IllegalArgumentException("Unsupported adjustment transaction type: " + request.getTransactionType());
        }

        product.setAvailableStock(newStock);
        productRepository.save(product);

        // Update Inventory record
        syncInventoryRecord(product);

        // Record Transaction
        InventoryTransaction transaction = new InventoryTransaction(
                product,
                request.getTransactionType(),
                request.getQuantity(),
                oldStock,
                newStock,
                null,
                request.getReason() != null ? request.getReason() : "Manual stock adjustment by " + performedBy,
                performedBy
        );
        transactionRepository.save(transaction);

        // Low stock warning check
        checkAndSendLowStockWarning(product);

        return product;
    }

    @Transactional
    public synchronized void reserveStock(Product product, int quantity, Long orderId, String username) {
        if (product.getAvailableStock() < quantity) {
            throw new IllegalArgumentException("Insufficient stock for product '" + product.getName() +
                    "'. Requested: " + quantity + ", Available: " + product.getAvailableStock());
        }

        int oldAvailable = product.getAvailableStock();
        int newAvailable = oldAvailable - quantity;
        int newReserved = product.getReservedStock() + quantity;

        product.setAvailableStock(newAvailable);
        product.setReservedStock(newReserved);
        productRepository.save(product);

        syncInventoryRecord(product);

        InventoryTransaction transaction = new InventoryTransaction(
                product,
                TransactionType.RESERVE,
                quantity,
                oldAvailable,
                newAvailable,
                orderId,
                "Stock reserved for Order #" + orderId,
                username
        );
        transactionRepository.save(transaction);

        checkAndSendLowStockWarning(product);
    }

    @Transactional
    public synchronized void releaseStockReservation(Product product, int quantity, Long orderId, String username) {
        int oldAvailable = product.getAvailableStock();
        int newAvailable = oldAvailable + quantity;
        int newReserved = Math.max(0, product.getReservedStock() - quantity);

        product.setAvailableStock(newAvailable);
        product.setReservedStock(newReserved);
        productRepository.save(product);

        syncInventoryRecord(product);

        InventoryTransaction transaction = new InventoryTransaction(
                product,
                TransactionType.RELEASE_RESERVATION,
                quantity,
                oldAvailable,
                newAvailable,
                orderId,
                "Stock reservation released for cancelled Order #" + orderId,
                username
        );
        transactionRepository.save(transaction);
    }

    @Transactional
    public synchronized void finalizeStockDeduction(Product product, int quantity, Long orderId, String username) {
        int oldReserved = product.getReservedStock();
        int newReserved = Math.max(0, oldReserved - quantity);

        product.setReservedStock(newReserved);
        productRepository.save(product);

        syncInventoryRecord(product);

        InventoryTransaction transaction = new InventoryTransaction(
                product,
                TransactionType.DISPATCH_DEDUCT,
                quantity,
                product.getAvailableStock(),
                product.getAvailableStock(),
                orderId,
                "Final stock deduction on delivery confirmation for Order #" + orderId,
                username
        );
        transactionRepository.save(transaction);
    }

    public void syncInventoryRecord(Product product) {
        Inventory inv = inventoryRepository.findByProductId(product.getId())
                .orElse(new Inventory(product, product.getAvailableStock(), product.getReservedStock(), "Warehouse-Main"));
        inv.setCurrentStock(product.getAvailableStock());
        inv.setReservedStock(product.getReservedStock());
        inv.setLastReplenishedAt(LocalDateTime.now());
        inventoryRepository.save(inv);
    }

    private void checkAndSendLowStockWarning(Product product) {
        if (product.getAvailableStock() <= product.getMinimumStockLevel()) {
            String title = "⚠️ Low Stock Warning: " + product.getName();
            String msg = "Available stock for '" + product.getName() + "' is down to " + product.getAvailableStock() +
                    " (Minimum threshold: " + product.getMinimumStockLevel() + "). Please reorder soon.";
            notificationService.sendNotification(title, msg, "LOW_STOCK", product.getId(), "ADMIN");
        }
    }
}
