import { createRemoteJWKSet, jwtVerify } from "jose";

import { getAbsoluteUrl } from "@/lib/site";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getGoogleJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
  }
  return jwks;
}

function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || null;
}

function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET?.trim() || null;
}

export function hasGoogleAuthConfig() {
  return Boolean(getGoogleClientId() && getGoogleClientSecret());
}

function getGoogleRedirectUri() {
  return getAbsoluteUrl("/api/auth/google/callback");
}

export function getGoogleAuthUrl(state: string) {
  const clientId = getGoogleClientId();

  if (!clientId) {
    throw new Error("Google OAuth is not configured.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string | null;
};

export async function exchangeGoogleCode(code: string): Promise<GoogleProfile> {
  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured.");
  }

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google token exchange failed: ${body}`);
  }

  const payload = (await response.json()) as { id_token?: string };

  if (!payload.id_token) {
    throw new Error("Google token exchange did not return an id_token.");
  }

  const { payload: claims } = await jwtVerify(payload.id_token, getGoogleJwks(), {
    issuer: GOOGLE_ISSUERS,
    audience: clientId
  });

  const email = typeof claims.email === "string" ? claims.email : null;
  const emailVerified = claims.email_verified === true;
  const sub = typeof claims.sub === "string" ? claims.sub : null;
  const name = typeof claims.name === "string" ? claims.name : null;

  if (!sub || !email || !emailVerified) {
    throw new Error("Google account email is not verified.");
  }

  return { sub, email, name };
}
