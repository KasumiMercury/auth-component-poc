export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email?: string;
  };
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface OAuthCredentials {
  provider: string;
  code?: string;
  state?: string;
}

export type AuthMethodType = 'password' | 'oauth';

export interface AuthMethod {
  type: AuthMethodType;
  name: string;
  description: string;
  enabled: boolean;
  authenticate: (credentials: unknown) => Promise<AuthResult>;
}

export interface AuthConfig {
  methods: AuthMethod[];
  defaultMethod?: AuthMethodType;
}
