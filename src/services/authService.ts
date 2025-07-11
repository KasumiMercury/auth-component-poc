import type {
  AuthCredentials,
  AuthMethod,
  AuthMethodType,
  AuthResult,
  OAuthCredentials,
} from '@/types/auth';

export class AuthService {
  private static instance: AuthService;
  private methods: Map<AuthMethodType, AuthMethod> = new Map();

  private constructor() {
    this.initializeMethods();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeMethods() {
    this.methods.set('password', {
      type: 'password',
      name: 'パスワード認証',
      description: 'ユーザー名とパスワードでログイン',
      enabled: true,
      authenticate: (credentials: unknown) =>
        this.authenticateWithPassword(credentials as AuthCredentials),
    });

    this.methods.set('oauth', {
      type: 'oauth',
      name: 'OAuth認証',
      description: 'Google、GitHub等のOAuthプロバイダーでログイン',
      enabled: false,
      authenticate: (credentials: unknown) =>
        this.authenticateWithOAuth(credentials as OAuthCredentials),
    });
  }

  private async authenticateWithPassword(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'ログインに成功しました',
          token: data.token,
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message || 'ログインに失敗しました',
        };
      }
    } catch (_error) {
      return {
        success: false,
        message: 'ネットワークエラーが発生しました',
      };
    }
  }

  private async authenticateWithOAuth(credentials: OAuthCredentials): Promise<AuthResult> {
    try {
      const response = await fetch(`/api/auth/oauth/${credentials.provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: 'OAuth認証に成功しました',
          token: data.token,
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message || 'OAuth認証に失敗しました',
        };
      }
    } catch (_error) {
      return {
        success: false,
        message: 'OAuth認証エラーが発生しました',
      };
    }
  }

  getMethod(type: AuthMethodType): AuthMethod | undefined {
    return this.methods.get(type);
  }

  getEnabledMethods(): AuthMethod[] {
    return Array.from(this.methods.values()).filter((method) => method.enabled);
  }

  enableMethod(type: AuthMethodType): void {
    const method = this.methods.get(type);
    if (method) {
      method.enabled = true;
    }
  }

  disableMethod(type: AuthMethodType): void {
    const method = this.methods.get(type);
    if (method) {
      method.enabled = false;
    }
  }

  async authenticate(type: AuthMethodType, credentials: unknown): Promise<AuthResult> {
    const method = this.methods.get(type);

    if (!method) {
      return {
        success: false,
        message: 'サポートされていない認証方法です',
      };
    }

    if (!method.enabled) {
      return {
        success: false,
        message: 'この認証方法は無効になっています',
      };
    }

    return method.authenticate(credentials);
  }
}
