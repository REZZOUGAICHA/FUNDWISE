import { Injectable } from '@nestjs/common';

interface AccessControlRequest {
  method: string;
  path: string;
  user: {
    sub: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AccessControlService {
  async validateRequest(data: AccessControlRequest): Promise<boolean> {
    const { method, path, user } = data;

    //only "auditor" can access verification routes
    if (path.startsWith('verification')) {
      return user.role === 'auditor';
    }

    // All authenticated users can GET general data
    if (method === 'GET' && path.startsWith('campaign')) {
      return true;
    }

    // Default deny
    return false;
  }
}
