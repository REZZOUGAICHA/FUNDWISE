export class UploadLegalDocumentDto {
  documentType: string;
  description?: string;
}

export interface DocumentMetadata {
  type: string;
  description?: string;
  filename: string;
  uploadedAt: string;
  ipfsHash: string;
}

