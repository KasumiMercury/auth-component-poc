import type { AuthResult } from '@/types/auth';

interface GoogleTokenInfo {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleAuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GoogleAuthError';
  }
}

export function getGoogleAuthConfig(): GoogleAuthConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/oauth/google';

  if (!clientId || !clientSecret) {
    throw new GoogleAuthError('Google OAuth configuration is missing', 'MISSING_CONFIG');
  }

  return { clientId, clientSecret, redirectUri };
}

export function getGoogleAuthUrl(state?: string): string {
  const config = getGoogleAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  id_token: string;
  refresh_token?: string;
}> {
  const config = getGoogleAuthConfig();
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new GoogleAuthError(
      error.error_description || 'Failed to exchange authorization code',
      error.error || 'TOKEN_EXCHANGE_FAILED'
    );
  }

  return response.json();
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleTokenInfo> {
  const config = getGoogleAuthConfig();
  
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );

  if (!response.ok) {
    throw new GoogleAuthError('Failed to verify Google token', 'TOKEN_VERIFICATION_FAILED');
  }

  const tokenInfo = await response.json();

  if (tokenInfo.aud !== config.clientId) {
    throw new GoogleAuthError('Invalid token audience', 'INVALID_AUDIENCE');
  }

  if (tokenInfo.exp < Date.now() / 1000) {
    throw new GoogleAuthError('Token has expired', 'TOKEN_EXPIRED');
  }

  return tokenInfo;
}

export async function authenticateWithGoogle(code: string): Promise<AuthResult> {
  try {
    const tokens = await exchangeCodeForTokens(code);
    const tokenInfo = await verifyGoogleToken(tokens.id_token);

    return {
      success: true,
      message: 'Google認証に成功しました',
      token: tokens.access_token,
      user: {
        id: tokenInfo.sub,
        username: tokenInfo.name,
        email: tokenInfo.email,
      },
    };
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return {
        success: false,
        message: `Google認証エラー: ${error.message}`,
      };
    }

    return {
      success: false,
      message: 'Google認証で予期しないエラーが発生しました',
    };
  }
}