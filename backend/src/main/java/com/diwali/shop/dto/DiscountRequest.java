package com.diwali.shop.dto;

import com.diwali.shop.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class DiscountRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType; // NONE, PERCENTAGE, FIXED

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal discountValue;

    public DiscountRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }
}
