import { api } from './api';
import { Policy, PolicyRequest, PolicyValidationResponse } from '../types/policy';

export const policyService = {
  async getPolicies(): Promise<Policy[]> {
    const response = await api.get<Policy[]>('/policies');
    return response.data;
  },

  async getPolicyById(id: number): Promise<Policy> {
    const response = await api.get<Policy>(`/policies/${id}`);
    return response.data;
  },

  async createPolicy(policy: PolicyRequest): Promise<Policy> {
    const response = await api.post<Policy>('/policies', policy);
    return response.data;
  },

  async updatePolicy(id: number, policy: PolicyRequest): Promise<Policy> {
    const response = await api.put<Policy>(`/policies/${id}`, policy);
    return response.data;
  },

  async deletePolicy(id: number): Promise<void> {
    await api.delete(`/policies/${id}`);
  },

  async validatePolicy(id: number): Promise<PolicyValidationResponse> {
    const response = await api.post<PolicyValidationResponse>(`/policies/${id}/validate`);
    return response.data;
  }
};
