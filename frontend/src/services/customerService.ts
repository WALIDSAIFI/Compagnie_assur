import api from "./api"
import type { Customer } from "../types/Customer"

const CUSTOMERS_URL = "/customers"

const getAllCustomers = async (): Promise<Customer[]> => {
  const response = await api.get<Customer[]>(CUSTOMERS_URL)
  return response.data
}

const getCustomerById = async (id: number): Promise<Customer> => {
  const response = await api.get<Customer>(`${CUSTOMERS_URL}/${id}`)
  return response.data
}

const createCustomer = async (customer: Customer): Promise<Customer> => {
  const response = await api.post<Customer>(CUSTOMERS_URL, customer)
  return response.data
}

const updateCustomer = async (id: number, customer: Customer): Promise<Customer> => {
  const response = await api.put<Customer>(`${CUSTOMERS_URL}/${id}`, customer)
  return response.data
}

const deleteCustomer = async (id: number): Promise<void> => {
  await api.delete(`${CUSTOMERS_URL}/${id}`)
}

const searchCustomers = async (searchTerm: string): Promise<Customer[]> => {
  const response = await api.get<Customer[]>(`${CUSTOMERS_URL}/search?lastName=${searchTerm}`)
  return response.data
}

const customerService = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
}

export default customerService

