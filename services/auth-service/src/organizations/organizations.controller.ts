import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Get, 
  UseInterceptors, 
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizationsService } from './organizations.service';
import { UploadLegalDocumentDto } from './dto/legal-document.dto';
// Import your auth guard
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  // Your existing endpoints...

  @Post(':id/legal-documents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('document'))
  async uploadLegalDocument(
    @Param('id') organizationId: string,
    @Body() documentData: UploadLegalDocumentDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.organizationsService.uploadLegalDocument(
      organizationId,
      file.buffer,
      documentData.documentType,
      file.originalname,
      documentData.description
    );
  }

  @Get(':id/legal-documents')
  @UseGuards(JwtAuthGuard)
  async getLegalDocuments(@Param('id') organizationId: string) {
    return this.organizationsService.getLegalDocuments(organizationId);
  }
}
