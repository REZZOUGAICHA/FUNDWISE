// services/campaign-service/src/campaign/types/organization.type.ts
export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  verification_status: string;
  owner_id: string;
}
