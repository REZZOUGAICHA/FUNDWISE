import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PinataService } from '../ipfs/pinata.service';
import { DocumentMetadata } from './dto/legal-document.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private pinataService: PinataService
  ) {}

  // Your existing methods...

  async uploadLegalDocument(
    organizationId: string, 
    documentBuffer: Buffer, 
    documentType: string, 
    filename: string,
    description?: string
  ) {
    try {
      // Upload document to IPFS
      const ipfsHash = await this.pinataService.uploadBuffer(
        documentBuffer,
        `org_${organizationId}_${documentType}_${Date.now()}`
      );

      // Create metadata for this document
      const documentMetadata: DocumentMetadata = {
        type: documentType,
        description,
        filename,
        uploadedAt: new Date().toISOString(),
        ipfsHash
      };

      // Get existing document hashes JSON or create new one
      const organization = await this.prisma.organizations.findUnique({
        where: { id: organizationId }
      });

        let documents: DocumentMetadata[] = [];
        if (organization) {
        // Do operations with organization
        const metadataIpfsHash = await this.pinataService.uploadJSON(
            documents,
            `org_${organizationId}_documents_metadata`
        );

        await this.prisma.organizations.update({
            where: { id: organizationId },
            data: { legal_documents_ipfs_hash: metadataIpfsHash }
        });
        }

      // Add new document to the list
      documents.push(documentMetadata);

      // Upload updated metadata to IPFS
      const metadataIpfsHash = await this.pinataService.uploadJSON(
        documents,
        `org_${organizationId}_documents_metadata`
        );

      // Update organization with the metadata IPFS hash
      await this.prisma.organizations.update({
        where: { id: organizationId },
        data: { legal_documents_ipfs_hash: metadataIpfsHash }
        }); 

      return {
        success: true,
        documentIpfsHash: ipfsHash,
        metadataIpfsHash,
        ipfsUrl: this.pinataService.getIPFSUrl(ipfsHash)
      };
    } catch (error) {
      console.error('Error uploading legal document:', error);
      throw error;
    }
  }

  async getLegalDocuments(organizationId: string) {
    const organization = await this.prisma.organizations.findUnique({
      where: { id: organizationId }
    });

    if (!organization || !organization.legal_documents_ipfs_hash) {
      return [];
    }

    try {
      // Fetch document metadata from IPFS
      const response = await fetch(this.pinataService.getIPFSUrl(organization.legal_documents_ipfs_hash));
      if (!response.ok) {
        throw new Error(`Failed to fetch document metadata: ${response.statusText}`);
      }

      const documents = await response.json();
      return documents.map((doc: DocumentMetadata) => ({
        ...doc,
        ipfsUrl: this.pinataService.getIPFSUrl(doc.ipfsHash)
        }));
    } catch (error) {
      console.error('Error fetching document metadata:', error);
      throw error;
    }
  }
}
