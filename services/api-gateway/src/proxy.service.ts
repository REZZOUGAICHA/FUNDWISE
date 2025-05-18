import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { Observable, catchError, tap, switchMap, throwError, of, map } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role: string;
  };
}

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    @Inject('CAMPAIGN_SERVICE_URL') private readonly campaignServiceUrl: string,
    @Inject('DONATION_SERVICE_URL') private readonly donationServiceUrl: string,
    @Inject('AUTH_SERVICE_URL') private readonly authServiceUrl: string,
    @Inject('ACCESS_CONTROL_SERVICE_URL') private readonly accessControlServiceUrl: string,
    @Inject('VERIFICATION_SERVICE_URL') private readonly verificationServiceUrl: string,
  ) {}

  handleRequest(request: AuthenticatedRequest): Observable<AxiosResponse<any>> {
    const url = request.originalUrl;
    console.log(url)

    if (url.startsWith('/api/auth')) {
      console.log("here ?")
      return this.proxyRequest(request, this.authServiceUrl, '/api');
    }
    if (url.startsWith('/api/campaign')) {
          return this.proxyRequest(request, this.campaignServiceUrl, 'api/');
    }

    return this.checkAccessControl(request).pipe(
      switchMap((user) => {
       

        if (url.startsWith('/api/donation')) {
          return this.proxyRequest(request, this.donationServiceUrl, '/api/v1/donation');
        }

        if (url.startsWith('/api/verification')) {
          console.log("toooo")
          return this.proxyRequest(request, this.verificationServiceUrl, '/api');
        }

        throw new Error(`Unsupported route: ${url}`);
      })
    );
  }

  private checkAccessControl(request: AuthenticatedRequest): Observable<any> {
    console.log("verifi?")
    const authHeader = request.headers['authorization'] || '';
    console.log(authHeader)
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    console.log(token);
    if (!token) {
      return throwError(() => new UnauthorizedException('Missing JWT token'));
    }

    try {
      console.log("try ?")
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      console.log(decoded)

      return this.httpService
        .post(
          `${this.accessControlServiceUrl}/validate`,
          {
            method: request.method,
            path: request.originalUrl,
            user: decoded,
          },
          {
            headers: this.cleanHeaders(request.headers),
          }
        )
        .pipe(
          tap(() => {
            console.log(`Access granted for ${request.method} ${request.originalUrl}`);
          }),
          map(() => decoded),
          catchError((error) => {
            console.error(`Access denied: ${request.method} ${request.originalUrl}`, error.message);
            return throwError(() => error);
          })
        );
    } catch (error) {
      console.log(error);
      return throwError(() => new UnauthorizedException('Invalid JWT token'));
    }
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
