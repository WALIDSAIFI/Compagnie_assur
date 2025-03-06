export enum PolicyType {
  AUTO = "AUTO",
  HOME = "HOME",
  HEALTH = "HEALTH",
}

export interface Policy {
  id?: number
  type: PolicyType
  startDate: string
  endDate: string
  coverageAmount: number
  customerId: number
}

export interface PolicyWithCustomer {
  policy: Policy
  customer: {
    id: number
    firstName: string
    lastName: string
    email: string
    address: string
    phone: string
  }
}

