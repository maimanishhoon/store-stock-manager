package com.diwali.shop.service;

import com.diwali.shop.dto.DiscountRequest;
import com.diwali.shop.dto.ProductRequest;
import com.diwali.shop.entity.*;
import com.diwali.shop.repository.CategoryRepository;
import com.diwali.shop.repository.DiscountRepository;
import com.diwali.shop.repository.InventoryRepository;
import com.diwali.shop.repository.InventoryTransactionRepository;
import com.diwali.shop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final DiscountRepository discountRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          InventoryRepository inventoryRepository,
                          InventoryTransactionRepository transactionRepository,
                          DiscountRepository discountRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.discountRepository = discountRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }

    public List<Product> searchProducts(String query, Long categoryId, ProductStatus status) {
        return productRepository.searchProducts(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                categoryId,
                status
        );
    }

    public List<Product> searchAvailableProducts(String query, Long categoryId) {
        return productRepository.searchAvailablePublicProducts(
                (query != null && !query.trim().isEmpty()) ? query.trim() : null,
                categoryId
        );
    }

    @Transactional
    public Product createProduct(ProductRequest request, String username) {
        if (productRepository.existsByProductCode(request.getProductCode())) {
            throw new IllegalArgumentException("Product code '" + request.getProductCode() + "' already exists.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setProductCode(request.getProductCode());
        product.setCategory(category);
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setDiscountType(request.getDiscountType() != null ? request.getDiscountType() : DiscountType.NONE);
        product.setDiscountValue(request.getDiscountValue() != null ? request.getDiscountValue() : java.math.BigDecimal.ZERO);
        product.setAvailableStock(request.getInitialStock() != null ? request.getInitialStock() : 0);
        product.setReservedStock(0);
        product.setMinimumStockLevel(request.getMinimumStockLevel() != null ? request.getMinimumStockLevel() : 5);
        product.setProductStatus(request.getProductStatus() != null ? request.getProductStatus() : ProductStatus.ACTIVE);

        Product saved = productRepository.save(product);

        // Initialize Inventory record
        Inventory inventory = new Inventory(saved, saved.getAvailableStock(), 0, "Warehouse-Section-1");
        inventoryRepository.save(inventory);

        // Record initial stock transaction if initial stock > 0
        if (saved.getAvailableStock() > 0) {
            InventoryTransaction tx = new InventoryTransaction(
                    saved,
                    TransactionType.ADD_STOCK,
                    saved.getAvailableStock(),
                    0,
                    saved.getAvailableStock(),
                    null,
                    "Initial stock during product creation",
                    username
            );
            transactionRepository.save(tx);
        }

        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);

        if (!product.getProductCode().equalsIgnoreCase(request.getProductCode())
                && productRepository.existsByProductCode(request.getProductCode())) {
            throw new IllegalArgumentException("Product code '" + request.getProductCode() + "' is already in use.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setProductCode(request.getProductCode());
        product.setCategory(category);
        product.setDescription(request.getDescription());
        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            product.setImageUrl(request.getImageUrl());
        }
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setDiscountType(request.getDiscountType() != null ? request.getDiscountType() : DiscountType.NONE);
        product.setDiscountValue(request.getDiscountValue() != null ? request.getDiscountValue() : java.math.BigDecimal.ZERO);
        product.setMinimumStockLevel(request.getMinimumStockLevel() != null ? request.getMinimumStockLevel() : 5);
        if (request.getProductStatus() != null) {
            product.setProductStatus(request.getProductStatus());
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        // If product has reserved stock in active orders, deactivate instead of hard delete
        if (product.getReservedStock() > 0) {
            product.setProductStatus(ProductStatus.INACTIVE);
            productRepository.save(product);
            return;
        }
        // Delete related inventory transactions and inventory records first
        transactionRepository.deleteByProductId(id);
        inventoryRepository.deleteByProductId(id);
        productRepository.delete(product);
    }

    @Transactional
    public Product applyDiscount(DiscountRequest request) {
        Product product = getProductById(request.getProductId());
        product.setDiscountType(request.getDiscountType());
        product.setDiscountValue(request.getDiscountValue());
        product.recalculateFinalPrice();
        Product saved = productRepository.save(product);

        // Record discount history
        Discount discount = new Discount();
        discount.setProduct(saved);
        discount.setDiscountType(request.getDiscountType());
        discount.setDiscountValue(request.getDiscountValue());
        discount.setStartDate(LocalDateTime.now());
        discount.setIsActive(request.getDiscountType() != DiscountType.NONE);
        discountRepository.save(discount);

        return saved;
    }

    @Transactional
    public Product toggleStatus(Long id) {
        Product product = getProductById(id);
        product.setProductStatus(product.getProductStatus() == ProductStatus.ACTIVE ? ProductStatus.INACTIVE : ProductStatus.ACTIVE);
        return productRepository.save(product);
    }

    public String saveImageFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + extension;
        Path targetLocation = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + fileName;
    }
}
