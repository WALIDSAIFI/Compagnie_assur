package com.insurance.policyservice.controller;

import com.insurance.policyservice.dto.PolicyWithCustomerDto;
import com.insurance.policyservice.model.Policy;
import com.insurance.policyservice.service.PolicyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {
    @Autowired
    private PolicyService policyService;

    @GetMapping
    public ResponseEntity<List<Policy>> getAllPolicies() {
        List<Policy> policies = policyService.getAllPolicies();
        return new ResponseEntity<>(policies, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Policy> getPolicyById(@PathVariable Long id) {
        return policyService.getPolicyById(id)
                .map(policy -> new ResponseEntity<>(policy, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/with-customer/{id}")
    public ResponseEntity<PolicyWithCustomerDto> getPolicyWithCustomer(@PathVariable Long id) {
        try {
            PolicyWithCustomerDto policyWithCustomer = policyService.getPolicyWithCustomer(id);
            return new ResponseEntity<>(policyWithCustomer, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/all-with-customers")
    public ResponseEntity<List<PolicyWithCustomerDto>> getAllPoliciesWithCustomers() {
        List<PolicyWithCustomerDto> policiesWithCustomers = policyService.getAllPoliciesWithCustomers();
        return new ResponseEntity<>(policiesWithCustomers, HttpStatus.OK);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Policy>> getPoliciesByCustomerId(@PathVariable Long customerId) {
        List<Policy> policies = policyService.getPoliciesByCustomerId(customerId);
        return new ResponseEntity<>(policies, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Policy> createPolicy(@Valid @RequestBody Policy policy) {
        Policy newPolicy = policyService.createPolicy(policy);
        return new ResponseEntity<>(newPolicy, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Policy> updatePolicy(@PathVariable Long id, @Valid @RequestBody Policy policy) {
        try {
            Policy updatedPolicy = policyService.updatePolicy(id, policy);
            return new ResponseEntity<>(updatedPolicy, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        try {
            policyService.deletePolicy(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}

