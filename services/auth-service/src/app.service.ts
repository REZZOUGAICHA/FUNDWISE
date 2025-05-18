// app.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PinataService } from './ipfs/pinata.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private pinataService: PinataService,
  ) {}

  async auth(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user?.email || !user?.encrypted_password) {
        throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.encrypted_password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);
    console.log('Generated JWT Token:', token);
    return {
      token,
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }
  
  async signup(userData: any) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create a new user ID
    const userId = uuidv4();

    // Create user based on role
    if (userData.role === 'donor') {
      // Create donor user
      const user = await this.prisma.user.create({
        data: {
          id: userId,
          email: userData.email,
          encrypted_password: hashedPassword,
          role: 'donor',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // Create donor profile
      await this.prisma.donor_profiles.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl || null,
          bio: userData.bio || null,
          wallet_address: userData.walletAddress || null,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // Generate JWT token
      const payload = {
        sub: user.id,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);
      
      return {
        token,
        user: {
          id: user.id,
          role: user.role,
        }
      };
    } 
    else if (userData.role === 'organization') {
      // Create organization user
      const user = await this.prisma.user.create({
        data: {
          id: userId,
          email: userData.email,
          encrypted_password: hashedPassword,
          role: 'organization',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // Create organization profile
      const organization = await this.prisma.organizations.create({
        data: {
          id: uuidv4(),
          name: userData.name,
          description: userData.description,
          logo_url: userData.logoUrl || null,
          website: userData.website || null,
          wallet_address: userData.walletAddress || null,
          owner_id: user.id,
          verification_status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      // If legal documents were provided, upload them
      if (userData.legalDocuments) {
        try {
          // This assumes legalDocuments is a base64 string or URL that can be converted to a Buffer
          const documentBuffer = Buffer.from(userData.legalDocuments, 'base64');
          await this.uploadLegalDocuments(organization.id, [documentBuffer]);
        } catch (error) {
          console.error('Error uploading legal documents:', error);
        }
      }

      // Generate JWT token
      const payload = {
        sub: user.id,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);
      
      return {
        token,
        user: {
          id: user.id,
          role: user.role,
          organizationId: organization.id
        }
      };
    } 
    else {
      throw new UnauthorizedException('Invalid role specified');
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
