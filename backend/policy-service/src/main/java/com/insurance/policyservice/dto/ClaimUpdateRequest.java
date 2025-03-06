package com.insurance.policyservice.dto;

import com.insurance.policyservice.model.ClaimStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimUpdateRequest {
    private ClaimStatus status;
    private Double settledAmount;

}
