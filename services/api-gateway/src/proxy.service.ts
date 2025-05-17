// src/proxy/proxy.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { Observable, catchError, tap } from 'rxjs';
import { map } from 'rxjs/operators';

interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    @Inject('CAMPAIGN_SERVICE_URL') private readonly campaignServiceUrl: string,
    @Inject('DONATION_SERVICE_URL') private readonly donationServiceUrl: string,
    @Inject('AUTH_SERVICE_URL') private readonly authServiceUrl: string,
  ) {}

  handleRequest(request: Request): Observable<AxiosResponse<any>> {
    const url = request.originalUrl;

    if (url.startsWith('/api/campaign')) {
      return this.proxyRequest(request, this.campaignServiceUrl, '/api/v1/campaign');
    }

    if (url.startsWith('/api/donation')) {
      return this.proxyRequest(request, this.donationServiceUrl, '/api/v1/donation');
    }
    if (url.startsWith('/api/auth')) {
      return this.proxyRequest(request, this.authServiceUrl, '/api');
    }

    throw new Error(`Unsupported route: ${url}`);
  }

  proxyRequest(
    request: Request,
    targetBaseUrl: string,
    stripPrefix: string,
    includeCookies = true,
  ): Observable<AxiosResponse<any>> {
    const pathWithoutPrefix = request.originalUrl.replace(stripPrefix, '');
    const url = `${targetBaseUrl}${pathWithoutPrefix}`;
    const headers = this.cleanHeaders(request.headers);

    if (includeCookies && request.headers.cookie) {
      headers['Cookie'] = request.headers.cookie;
    }

    return this.httpService
      .request({
        method: request.method,
        url,
        data: request.body,
        headers,
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          console.log(`Proxy success: ${request.method} ${url} (${response.status})`);
        }),
        catchError((error) => {
          console.error(`Proxy error: ${request.method} ${url}`, error.message);
          throw error;
        })
      );
  }

  private cleanHeaders(headers: any): Record<string, string> {
    const { host, 'content-length': _, ...cleanHeaders } = headers;
    return cleanHeaders;
  }
}
