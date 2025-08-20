package com.example.Library_Spring.dto;

public class PenaltyPayDTO {

    private Long user_id;
    private Double amount_to_pay;

    public PenaltyPayDTO() {
    }

    public PenaltyPayDTO(Long user_id, Double amount_to_pay) {
        this.user_id = user_id;
        this.amount_to_pay = amount_to_pay;
    }

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public Double getAmount_to_pay() {
        return amount_to_pay;
    }

    public void setAmount_to_pay(Double amount_to_pay) {
        this.amount_to_pay = amount_to_pay;
    }
}
