package com.diwali.shop.dto;

import com.diwali.shop.entity.Product;
import java.util.ArrayList;
import java.util.List;

public class CartValidationResponse {

    public static class CartValidatedItem {
        private Product product;
        private Integer requestedQuantity;
        private Integer validQuantity;

        public CartValidatedItem() {}

        public CartValidatedItem(Product product, Integer requestedQuantity, Integer validQuantity) {
            this.product = product;
            this.requestedQuantity = requestedQuantity;
            this.validQuantity = validQuantity;
        }

        public Product getProduct() {
            return product;
        }

        public void setProduct(Product product) {
            this.product = product;
        }

        public Integer getRequestedQuantity() {
            return requestedQuantity;
        }

        public void setRequestedQuantity(Integer requestedQuantity) {
            this.requestedQuantity = requestedQuantity;
        }

        public Integer getValidQuantity() {
            return validQuantity;
        }

        public void setValidQuantity(Integer validQuantity) {
            this.validQuantity = validQuantity;
        }
    }

    public static class CartNotice {
        private Long productId;
        private String productName;
        private String type; // "REMOVED" or "ADJUSTED"
        private String message;

        public CartNotice() {}

        public CartNotice(Long productId, String productName, String type, String message) {
            this.productId = productId;
            this.productName = productName;
            this.type = type;
            this.message = message;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    private List<CartValidatedItem> validItems = new ArrayList<>();
    private List<CartNotice> notices = new ArrayList<>();

    public CartValidationResponse() {}

    public List<CartValidatedItem> getValidItems() {
        return validItems;
    }

    public void setValidItems(List<CartValidatedItem> validItems) {
        this.validItems = validItems;
    }

    public List<CartNotice> getNotices() {
        return notices;
    }

    public void setNotices(List<CartNotice> notices) {
        this.notices = notices;
    }
}
