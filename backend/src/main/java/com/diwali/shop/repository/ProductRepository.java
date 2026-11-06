package com.diwali.shop.repository;

import com.diwali.shop.entity.Product;
import com.diwali.shop.entity.ProductStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByProductCode(String productCode);
    boolean existsByProductCode(String productCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);

    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByProductStatus(ProductStatus status);

    @Query("SELECT p FROM Product p WHERE " +
           "p.productStatus = com.diwali.shop.entity.ProductStatus.ACTIVE AND p.availableStock > 0 AND " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId)")
    List<Product> searchAvailablePublicProducts(@Param("query") String query,
                                                @Param("categoryId") Long categoryId);

    @Query("SELECT p FROM Product p WHERE " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:status IS NULL OR p.productStatus = :status)")
    List<Product> searchProducts(@Param("query") String query,
                                 @Param("categoryId") Long categoryId,
                                 @Param("status") ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.availableStock <= p.minimumStockLevel")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.availableStock = 0")
    List<Product> findOutOfStockProducts();

    @Query("SELECT COALESCE(SUM(p.availableStock), 0) FROM Product p")
    Long countTotalAvailableStock();
}
