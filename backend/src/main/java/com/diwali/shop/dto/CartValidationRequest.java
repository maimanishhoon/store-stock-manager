package com.diwali.shop.dto;

import java.util.List;

public class CartValidationRequest {
    private List<OrderItemRequest> items;

    public CartValidationRequest() {}

    public CartValidationRequest(List<OrderItemRequest> items) {
        this.items = items;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
