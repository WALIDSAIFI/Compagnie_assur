import api from "./api"
import type { Policy, PolicyWithCustomer } from "../types/Policy"

const POLICIES_URL = "/policies"

const getAllPolicies = async (): Promise<Policy[]> => {
  const response = await api.get<Policy[]>(POLICIES_URL)
  return response.data
}

const getPolicyById = async (id: number): Promise<Policy> => {
  const response = await api.get<Policy>(`${POLICIES_URL}/${id}`)
  return response.data
}

const getPolicyWithCustomer = async (id: number): Promise<PolicyWithCustomer> => {
  const response = await api.get<PolicyWithCustomer>(`${POLICIES_URL}/with-customer/${id}`)
  return response.data
}

const getAllPoliciesWithCustomers = async (): Promise<PolicyWithCustomer[]> => {
  const response = await api.get<PolicyWithCustomer[]>(`${POLICIES_URL}/all-with-customers`)
  return response.data
}

const getPoliciesByCustomerId = async (customerId: number): Promise<Policy[]> => {
  const response = await api.get<Policy[]>(`${POLICIES_URL}/customer/${customerId}`)
  return response.data
}

const createPolicy = async (policy: Policy): Promise<Policy> => {
  const response = await api.post<Policy>(POLICIES_URL, policy)
  return response.data
}

const updatePolicy = async (id: number, policy: Policy): Promise<Policy> => {
  const response = await api.put<Policy>(`${POLICIES_URL}/${id}`, policy)
  return response.data
}

const deletePolicy = async (id: number): Promise<void> => {
  await api.delete(`${POLICIES_URL}/${id}`)
}

const policyService = {
  getAllPolicies,
  getPolicyById,
  getPolicyWithCustomer,
  getAllPoliciesWithCustomers,
  getPoliciesByCustomerId,
  createPolicy,
  updatePolicy,
  deletePolicy,
}

export default policyService

