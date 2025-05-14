import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PinataService } from '../ipfs/pinata.service';
import { OrganizationsService } from '../organizations/organizations.service';

async function testOrgIpfs() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const pinataService = app.get(PinataService);
    const orgService = app.get(OrganizationsService);
    
    console.log('Testing IPFS connection...');
    
    // Create test JSON
    const testJson = { 
      test: true, 
      timestamp: new Date().toISOString(),
      message: "Hello from FundWise Auth Service!" 
    };
    
    const jsonHash = await pinataService.uploadJSON(testJson, 'test-org-json');
    console.log('✅ JSON upload successful!');
    console.log('JSON IPFS Hash:', jsonHash);
    console.log('JSON IPFS URL:', pinataService.getIPFSUrl(jsonHash));
    
    // If you have organization IDs in your database, you can test the full flow
    // Uncomment and replace with a valid organization ID
    /*
    const orgId = "valid-organization-id";
    const testBuffer = Buffer.from('Test organization document');
    const result = await orgService.uploadLegalDocument(
      orgId, 
      testBuffer, 
      "test-document", 
      "test.txt",
      "Test description"
    );
    console.log('Document upload result:', result);
    */
    
  } catch (error) {
    console.error('Error testing IPFS for organizations:', error);
  } finally {
    await app.close();
  }
}

testOrgIpfs().catch(console.error);
