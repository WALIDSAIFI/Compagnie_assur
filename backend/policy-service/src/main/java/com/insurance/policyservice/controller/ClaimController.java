    package com.insurance.policyservice.controller;

    import com.insurance.policyservice.dto.ClaimUpdateRequest;
import com.insurance.policyservice.model.Claim;
    import com.insurance.policyservice.model.ClaimStatus;
    import com.insurance.policyservice.service.ClaimService;
    import jakarta.validation.Valid;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/claims")
    public class ClaimController {
        @Autowired
        private ClaimService claimService;

        @GetMapping
        public ResponseEntity<List<Claim>> getAllClaims() {
            List<Claim> claims = claimService.getAllClaims();
            return new ResponseEntity<>(claims, HttpStatus.OK);
        }

        @GetMapping("/{id}")
        public ResponseEntity<Claim> getClaimById(@PathVariable Long id) {
            return claimService.getClaimById(id)
                    .map(claim -> new ResponseEntity<>(claim, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        }

        @GetMapping("/policy/{policyId}")
        public ResponseEntity<List<Claim>> getClaimsByPolicyId(@PathVariable Long policyId) {
            List<Claim> claims = claimService.getClaimsByPolicyId(policyId);
            return new ResponseEntity<>(claims, HttpStatus.OK);
        }

        @PostMapping
        public ResponseEntity<Claim> createClaim(@Valid @RequestBody Claim claim) {
            try {
                Claim newClaim = claimService.createClaim(claim);
                return new ResponseEntity<>(newClaim, HttpStatus.CREATED);
            } catch (RuntimeException e) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }

        @PutMapping("/{id}")
        public ResponseEntity<Claim> updateClaim(@PathVariable Long id, @Valid @RequestBody Claim claim) {
            try {
                Claim updatedClaim = claimService.updateClaim(id, claim);
                return new ResponseEntity<>(updatedClaim, HttpStatus.OK);
            } catch (RuntimeException e) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }

        // @PatchMapping("/{id}/status")
        // public ResponseEntity<Claim> updateClaimStatus(
        //         @PathVariable Long id,
        //         @RequestParam ClaimStatus status,
        //         @RequestParam(value = "settledAmount", required = false) Double settledAmount) {
        //     try {
        //         System.out.println("Updating claim " + id + " to status " + status + " with settledAmount " + settledAmount);
        //         Claim updatedClaim = claimService.processClaimStatus(id, status, settledAmount);
        //         return ResponseEntity.ok(updatedClaim);
        //     } catch (RuntimeException e) {
        //         return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        //     }
        // }
        
        @PatchMapping("/{id}/status")
        public ResponseEntity<Claim> updateClaimStatus(
                @PathVariable Long id,
                @RequestBody ClaimUpdateRequest request) { 
            Claim updatedClaim = claimService.processClaimStatus(id, request.getStatus(), request.getSettledAmount());
            return ResponseEntity.ok(updatedClaim);
        }
        
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
            try {
                claimService.deleteClaim(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } catch (RuntimeException e) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }
    }

