import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PinataService } from '../ipfs/pinata.service';
import * as fs from 'fs';
import * as path from 'path';

async function testPinataUpload() {
  // Create a standalone NestJS application context
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Get the PinataService from the application context
    const pinataService = app.get(PinataService);
    
    // Create a simple test file if one doesn't exist
    const testText = 'This is a test file for IPFS upload ' + new Date().toISOString();
    const testBuffer = Buffer.from(testText);
    
    console.log('Uploading test data to IPFS...');
    
    // Upload the buffer to IPFS
    const ipfsHash = await pinataService.uploadBuffer(testBuffer, 'test-file.txt');
    console.log('✅ Upload successful!');
    console.log('IPFS Hash:', ipfsHash);
    
    // Generate and display the IPFS URL
    const ipfsUrl = pinataService.getIPFSUrl(ipfsHash);
    console.log('IPFS URL:', ipfsUrl);
    console.log('You can view the file at this URL in your browser');
    
    // Try uploading JSON
    console.log('\nTesting JSON upload...');
    const testJson = { 
      test: true, 
      timestamp: new Date().toISOString(),
      message: "Hello from FundWise!" 
    };
    
    const jsonHash = await pinataService.uploadJSON(testJson, 'test-json');
    console.log('✅ JSON upload successful!');
    console.log('JSON IPFS Hash:', jsonHash);
    console.log('JSON IPFS URL:', pinataService.getIPFSUrl(jsonHash));
    
  } catch (error) {
    console.error('❌ Error testing Pinata upload:', error);
  } finally {
    await app.close();
  }
}

testPinataUpload().catch(console.error);
