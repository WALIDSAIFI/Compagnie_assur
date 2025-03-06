export enum ClaimStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SETTLED = "SETTLED",
}

export interface Claim {
  id?: number
  date: string
  description: string
  claimedAmount: number
  settledAmount?: number
  status: ClaimStatus
  policyId: number
}

