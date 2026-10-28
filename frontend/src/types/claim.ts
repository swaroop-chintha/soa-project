export type ClaimStatus =
  | 'SUBMITTED'
  | 'POLICY_VALIDATED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface Claim {
  id: number;
  claimNumber: string;
  policyId: number;
  customerName: string;
  claimAmount: number;
  description: string;
  claimDate: string;
  status: ClaimStatus;
  rejectionReason?: string;
  idempotencyKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimRequest {
  policyId: number;
  customerName: string;
  claimAmount: number;
  description: string;
}

export interface ClaimStatusUpdate {
  status: ClaimStatus;
  reason?: string;
}

export interface ClaimStatusHistory {
  id: number;
  claimId: number;
  previousStatus?: ClaimStatus;
  newStatus: ClaimStatus;
  reason?: string;
  changedAt: string;
  changedBy?: string;
}

export interface ClaimEvent {
  claimId: number;
  status: ClaimStatus;
  timestamp: string;
  message: string;
}

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export interface ApprovalResponse {
  id: number;
  claimId: number;
  policyId: number;
  claimAmount: number;
  coverageAmount: number;
  status: 'APPROVED' | 'REJECTED';
  reason: string;
  decisionDate: string;
}
