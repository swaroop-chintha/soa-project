import { api } from './api';
import {
  Claim,
  ClaimRequest,
  ClaimStatus,
  ClaimStatusHistory,
  ApprovalResponse
} from '../types/claim';
import { Policy } from '../types/policy';

export const claimService = {
  async getClaims(): Promise<Claim[]> {
    const response = await api.get<Claim[]>('/claims');
    return response.data;
  },

  async getClaimById(id: number): Promise<Claim> {
    const response = await api.get<Claim>(`/claims/${id}`);
    return response.data;
  },

  async createClaim(claim: ClaimRequest, idempotencyKey?: string): Promise<Claim> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const response = await api.post<Claim>('/claims', claim, { headers });
    return response.data;
  },

  async updateClaimStatus(
    id: number,
    status: ClaimStatus,
    reason?: string
  ): Promise<Claim> {
    const response = await api.put<Claim>(`/claims/${id}/status`, {
      status,
      reason
    });
    return response.data;
  },

  async processClaim(claim: Claim): Promise<Claim> {
    // 1. Fetch policy to get coverageAmount
    const policyRes = await api.get<Policy>(`/policies/${claim.policyId}`);
    const coverageAmount = policyRes.data.coverageAmount;

    // 2. Request Approval from Approval Service
    const approvalRes = await api.post<ApprovalResponse>('/approvals', {
      claimId: claim.id,
      policyId: claim.policyId,
      claimAmount: claim.claimAmount,
      coverageAmount: coverageAmount,
      description: claim.description || 'Claim processing'
    });

    // 3. Update Claim status in Claim Service
    const targetStatus: ClaimStatus =
      approvalRes.data.status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    const reason =
      approvalRes.data.reason ||
      (targetStatus === 'APPROVED'
        ? 'Claim approved by adjudication'
        : 'Claim rejected by adjudication');

    const updatedClaim = await this.updateClaimStatus(claim.id, targetStatus, reason);
    return updatedClaim;
  },

  async getClaimHistory(id: number): Promise<ClaimStatusHistory[]> {
    const response = await api.get<ClaimStatusHistory[]>(`/claims/${id}/history`);
    return response.data;
  },

  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await api.get('/actuator/health', { timeout: 3000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
};
