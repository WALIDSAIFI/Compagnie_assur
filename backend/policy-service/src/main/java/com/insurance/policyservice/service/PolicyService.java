package com.insurance.policyservice.service;

import com.insurance.policyservice.client.CustomerClient;
import com.insurance.policyservice.dto.CustomerDto;
import com.insurance.policyservice.dto.PolicyWithCustomerDto;
import com.insurance.policyservice.model.Policy;
import com.insurance.policyservice.repository.PolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PolicyService {
    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private CustomerClient customerClient;

    public List<Policy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public Optional<Policy> getPolicyById(Long id) {
        return policyRepository.findById(id);
    }

    public Policy createPolicy(Policy policy) {
        return policyRepository.save(policy);
    }

    public Policy updatePolicy(Long id, Policy policyDetails) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        
        policy.setType(policyDetails.getType());
        policy.setStartDate(policyDetails.getStartDate());
        policy.setEndDate(policyDetails.getEndDate());
        policy.setCoverageAmount(policyDetails.getCoverageAmount());
        
        return policyRepository.save(policy);
    }

    public void deletePolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        
        policyRepository.delete(policy);
    }

    public List<Policy> getPoliciesByCustomerId(Long customerId) {
        return policyRepository.findByCustomerId(customerId);
    }

    public PolicyWithCustomerDto getPolicyWithCustomer(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        
        CustomerDto customer = customerClient.getCustomerById(policy.getCustomerId());
        
        return new PolicyWithCustomerDto(policy, customer);
    }

    public List<PolicyWithCustomerDto> getAllPoliciesWithCustomers() {
        List<Policy> policies = policyRepository.findAll();
        
        return policies.stream()
                .map(policy -> {
                    CustomerDto customer = customerClient.getCustomerById(policy.getCustomerId());
                    return new PolicyWithCustomerDto(policy, customer);
                })
                .collect(Collectors.toList());
    }
}

