export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Policy {
  id: number;
  policyNumber: string;
  customerName: string;
  policyType: string;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
}

export interface PolicyRequest {
  policyNumber: string;
  customerName: string;
  policyType: string;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
}

export interface PolicyValidationResponse {
  valid: boolean;
  policyId?: number;
  policyNumber?: string;
  customerName?: string;
  coverageAmount?: number;
  status?: PolicyStatus;
  message: string;
}
