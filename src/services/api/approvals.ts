import { apiClient } from "@/lib/api/client";

export interface ApprovalWorkflow {
  id: string;
  taskId: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export const approvalsService = {
  async getApprovals(): Promise<ApprovalWorkflow[]> {
    return apiClient.get<ApprovalWorkflow[]>('/approvals');
  },

  async getApprovalById(id: string): Promise<ApprovalWorkflow> {
    return apiClient.get<ApprovalWorkflow>(`/approvals/${id}`);
  },
};
