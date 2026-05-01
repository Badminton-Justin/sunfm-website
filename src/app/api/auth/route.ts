import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Initiates the GitHub OAuth flow for the Sveltia/Decap CMS at /admin/.
// Reads the configured client ID from the environment, generates a CSRF
// state token, and redirects to GitHub's authorize page. GitHub will send
// the user back to /api/callback with a code we can exchange for a token.

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    return new NextResponse(
      "OAUTH_GITHUB_CLIENT_ID is not set on the server.",
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/callback`;

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", "repo,user");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
