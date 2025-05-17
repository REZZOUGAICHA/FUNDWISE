export * from './type';
export * from './broker';
export { config } from './config';

// Default export for convenience
export default getBroker();

// services/authService.ts - Example service using the message broker
 
export class AuthService {
  private broker = getBroker();

  /**
   * Send user registered event
   */
  async userRegistered(userId: string, userData: any): Promise<void> {
    await this.broker.publishByType('auth', 'registered', {
      userId,
      userData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send user logged in event
   */
  async userLoggedIn(userId: string, sessionData: any): Promise<void> {
    await this.broker.publishByType('auth', 'loggedIn', {
      userId,
      sessionData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send user logged out event
   */
  async userLoggedOut(userId: string, sessionId: string): Promise<void> {
    await this.broker.publishByType('auth', 'loggedOut', {
      userId,
      sessionId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send password changed event
   */
  async passwordChanged(userId: string): Promise<void> {
    await this.broker.publishByType('auth', 'passwordChanged', {
      userId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send account locked event
   */
  async accountLocked(userId: string, reason: string): Promise<void> {
    await this.broker.publishByType('auth', 'accountLocked', {
      userId,
      reason,
      timestamp: new Date().toISOString()
    });
  }
}

// services/notificationService.ts - Example service using the message broker
import { getBroker } from './broker';

export class NotificationService {
  private broker = getBroker();

  /**
   * Send email notification
   */
  async sendEmail(recipients: string[], subject: string, body: string): Promise<void> {
    await this.broker.publishByType('notification', 'email', {
      recipients,
      subject,
      body,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumbers: string[], message: string): Promise<void> {
    await this.broker.publishByType('notification', 'sms', {
      phoneNumbers,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send push notification
   */
  async sendPush(deviceTokens: string[], title: string, message: string, data?: any): Promise<void> {
    await this.broker.publishByType('notification', 'push', {
      deviceTokens,
      title,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }
}