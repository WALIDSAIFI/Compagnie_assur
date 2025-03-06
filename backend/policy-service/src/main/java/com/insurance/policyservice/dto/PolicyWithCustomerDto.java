package com.insurance.policyservice.dto;

import com.insurance.policyservice.model.Policy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyWithCustomerDto {
    private Policy policy;
    private CustomerDto customer;
}

