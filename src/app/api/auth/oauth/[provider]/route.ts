import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl, authenticateWithGoogle } from '@/lib/google-auth';

const EXTERNAL_SERVER_URL = 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    
    if (provider === 'google') {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        return NextResponse.redirect(
          `/auth?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(
            searchParams.get('error_description') || 'Google認証がキャンセルされました'
          )}`
        );
      }

      if (code) {
        const result = await authenticateWithGoogle(code);

        if (result.success) {
          const redirectUrl = new URL('/', request.url);
          redirectUrl.searchParams.set('auth_success', 'true');
          redirectUrl.searchParams.set('message', result.message);
          if (result.token) {
            redirectUrl.searchParams.set('token', result.token);
          }
          if (result.user) {
            redirectUrl.searchParams.set('user', JSON.stringify(result.user));
          }
          if (state) {
            redirectUrl.searchParams.set('state', state);
          }

          return NextResponse.redirect(redirectUrl.toString());
        } else {
          return NextResponse.redirect(
            `/auth?error=auth_failed&error_description=${encodeURIComponent(result.message)}`
          );
        }
      }

      const authUrl = getGoogleAuthUrl(state || undefined);
      return NextResponse.redirect(authUrl);
    }

    return NextResponse.json(
      { message: `Provider ${provider} is not supported for GET requests` },
      { status: 400 }
    );
  } catch (error) {
    console.error('OAuth GET error:', error);
    
    return NextResponse.json(
      { message: 'OAuth認証エラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const body = await request.json();
    
    if (provider === 'google') {
      if (body.code) {
        return NextResponse.json(await authenticateWithGoogle(body.code));
      } else {
        return NextResponse.json(
          { success: false, message: 'Authorization code is required for Google OAuth' },
          { status: 400 }
        );
      }
    }

    const response = await fetch(`${EXTERNAL_SERVER_URL}/oauth/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: `OAuth authentication failed (${response.status})` };
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('OAuth proxy error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: 'OAuth認証エラーが発生しました' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}