package com.insurance.policyservice.service;

import com.insurance.policyservice.model.Claim;
import com.insurance.policyservice.model.ClaimStatus;
import com.insurance.policyservice.model.Policy;
import com.insurance.policyservice.repository.ClaimRepository;
import com.insurance.policyservice.repository.PolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class ClaimService {
    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private PolicyRepository policyRepository;

    public List<Claim> getAllClaims() {
        return claimRepository.findAll();
    }

    public Optional<Claim> getClaimById(Long id) {
        return claimRepository.findById(id);
    }

    public Claim createClaim(Claim claim) {
        // Verify that the policy exists
        Policy policy = policyRepository.findById(claim.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + claim.getPolicyId()));

        // Set initial status
        claim.setStatus(ClaimStatus.PENDING);

        return claimRepository.save(claim);
    }

    public Claim updateClaim(Long id, Claim claimDetails) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));

        claim.setDate(claimDetails.getDate());
        claim.setDescription(claimDetails.getDescription());
        claim.setClaimedAmount(claimDetails.getClaimedAmount());
        claim.setSettledAmount(claimDetails.getSettledAmount());
        claim.setStatus(claimDetails.getStatus());

        return claimRepository.save(claim);
    }

    public Claim processClaimStatus(Long id, ClaimStatus status, Double settledAmount) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));

        claim.setStatus(status);
        if (settledAmount != null) {
            claim.setSettledAmount(BigDecimal.valueOf(settledAmount)); 
        }

        return claimRepository.save(claim);
    }

    public void deleteClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));

        claimRepository.delete(claim);
    }

    public List<Claim> getClaimsByPolicyId(Long policyId) {
        return claimRepository.findByPolicyId(policyId);
    }
}
