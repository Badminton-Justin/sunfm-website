import { NextRequest, NextResponse } from "next/server";

// Handles the GitHub OAuth callback for the Sveltia/Decap CMS. GitHub
// redirects the user here with a `code` after they approve. We exchange
// the code for an access token using the server-side client secret, then
// post the token back to the CMS popup via window.opener.postMessage.

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return new NextResponse("Invalid OAuth state.", { status: 400 });
  }

  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new NextResponse(
      "OAUTH_GITHUB_CLIENT_ID or OAUTH_GITHUB_CLIENT_SECRET is not set on the server.",
      { status: 500 }
    );
  }

  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  );

  if (!tokenRes.ok) {
    return new NextResponse("Token exchange failed.", { status: 502 });
  }

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
  };

  if (!tokenData.access_token) {
    return new NextResponse(
      `OAuth error: ${tokenData.error ?? "no token returned"}`,
      { status: 502 }
    );
  }

  // The CMS popup expects this exact handshake: send "authorizing:github"
  // first, then on receiving any response from the opener, send the
  // success message containing the token. The opener listens for the
  // "authorization:github:success:<json>" string and parses out the token.
  const successPayload = JSON.stringify({
    token: tokenData.access_token,
    provider: "github",
  });

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Logging in…</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;">
<p>Logging in… You can close this window if it doesn't close on its own.</p>
<script>
(function () {
  function onMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:' + ${JSON.stringify(successPayload)},
      e.origin || '*'
    );
    window.removeEventListener('message', onMessage, false);
    setTimeout(function () { window.close(); }, 1000);
  }
  window.addEventListener('message', onMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  response.cookies.delete("oauth_state");
  return response;
}
