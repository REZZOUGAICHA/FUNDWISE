// services/campaign-service/src/campaign/types/fund-release-request.type.ts
export interface FundReleaseRequest {
  id: string;
  campaign_id: string;
  organization_id: string;
  amount: number;
  purpose: string;
  status: string;
  requested_by: string;
  created_at: Date;
  updated_at: Date;
}
