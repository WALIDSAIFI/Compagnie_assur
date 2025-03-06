import api from "./api"
import type { Claim, ClaimStatus } from "../types/Claim"

const CLAIMS_URL = "/claims"

const getAllClaims = async (): Promise<Claim[]> => {
  const response = await api.get<Claim[]>(CLAIMS_URL)
  return response.data
}

const getClaimById = async (id: number): Promise<Claim> => {
  const response = await api.get<Claim>(`${CLAIMS_URL}/${id}`)
  return response.data
}

const getClaimsByPolicyId = async (policyId: number): Promise<Claim[]> => {
  const response = await api.get<Claim[]>(`${CLAIMS_URL}/policy/${policyId}`)
  return response.data
}

const createClaim = async (claim: Claim): Promise<Claim> => {
  const response = await api.post<Claim>(CLAIMS_URL, claim)
  return response.data
}

const updateClaim = async (id: number, claim: Claim): Promise<Claim> => {
  const response = await api.put<Claim>(`${CLAIMS_URL}/${id}`, claim)
  return response.data
}

// const updateClaimStatus = async (id: number, status: ClaimStatus, settledAmount?: number): Promise<Claim> => {
//   const url = settledAmount
//     ? `${CLAIMS_URL}/${id}/status?status=${status}&settledAmount=${settledAmount}`
//     : `${CLAIMS_URL}/${id}/status?status=${status}`

//   const response = await api.patch<Claim>(url)
//   return response.data
// }

const updateClaimStatus = async (id: number, status: ClaimStatus, settledAmount?: number): Promise<Claim> => {
  const response = await api.patch<Claim>(`${CLAIMS_URL}/${id}/status`, { status, settledAmount });
  return response.data;
};


const deleteClaim = async (id: number): Promise<void> => {
  await api.delete(`${CLAIMS_URL}/${id}`)
}

const claimService = {
  getAllClaims,
  getClaimById,
  getClaimsByPolicyId,
  createClaim,
  updateClaim,
  updateClaimStatus,
  deleteClaim,
}

export default claimService

