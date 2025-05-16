import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PinataService } from './ipfs/pinata.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private pinataService: PinataService
  ) {}

   async auth(email: string, password: string) {
    if (email === 'admin@fundwise.org' && password === 'password') {
        return { token: 'some-jwt-token', user: { email } };
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

  async uploadLegalDocuments(orgId: string, documents: Array<Buffer>) {
    // Create a single JSON with metadata
    const documentMetadata = {
      organization_id: orgId,
      timestamp: new Date().toISOString(),
      document_count: documents.length
    };
    
    // Upload each document and collect CIDs
    const documentCids = [];
    for (let i = 0; i < documents.length; i++) {
      const cid = await this.pinataService.uploadBuffer(
        documents[i],
        `org_${orgId}_doc_${i}`
      );
      documentCids.push(cid);
    }
    
    // Create a metadata file with all document references
    const metadataWithCids = {
      ...documentMetadata,
      document_cids: documentCids
    };
    
    const metadataCid = await this.pinataService.uploadJSON(
      metadataWithCids,
      `org_${orgId}_metadata`
    );
    
    // Update organization with the metadata hash
    return this.prisma.organizations.update({
      where: { id: orgId },
      data: {
        legal_documents_ipfs_hash: metadataCid
      }
    });
  }
}
