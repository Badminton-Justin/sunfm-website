// Files signed client forms into the "SunFM Clients" shared drive:
//
//   SunFM Clients/
//     Prospective/<Client Name>/2026-10-26 Waiver.pdf
//     Active/<Client Name>/2026-11-02 Client Agreement.pdf  (folder moved here)
//
// There is no service-account key. The Google org blocks key creation, so the
// site authenticates with Workload Identity Federation instead: Vercel hands
// each function an OIDC token proving it is the sunfm-website project, Google
// STS trades that for a federated token, and the federated token impersonates
// the sunfm-forms service account. The GCP side only trusts tokens whose
// `project` claim is sunfm-website (see the provider's attribute condition).

const SHARED_DRIVE_ID = "0AJvcCEHHSvoDUk9PVA";
// Looked up by name inside the shared drive, so renaming either folder in
// Drive breaks filing until these are updated to match.
const PROSPECTIVE_FOLDER = "Prospective";
const ACTIVE_FOLDER = "Active";

const FOLDER_MIME = "application/vnd.google-apps.folder";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

// Clients are matched across forms by email, stored on their folder. Names
// collide and get typed differently from one form to the next; emails don't.
const EMAIL_PROPERTY = "clientEmail";

export type ClientStage = "prospective" | "active";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

async function getAccessToken(oidcToken: string): Promise<string> {
  const projectNumber = requireEnv("GCP_PROJECT_NUMBER");
  const poolId = requireEnv("GCP_WORKLOAD_IDENTITY_POOL_ID");
  const providerId = requireEnv("GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID");
  const serviceAccount = requireEnv("GCP_SERVICE_ACCOUNT_EMAIL");

  const stsResponse = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
      subjectToken: oidcToken,
    }),
  });
  if (!stsResponse.ok) {
    throw new Error(`STS token exchange failed: ${stsResponse.status} ${await stsResponse.text()}`);
  }
  const { access_token: federatedToken } = await stsResponse.json();

  const impersonateResponse = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${federatedToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scope: ["https://www.googleapis.com/auth/drive"] }),
    }
  );
  if (!impersonateResponse.ok) {
    throw new Error(
      `Service account impersonation failed: ${impersonateResponse.status} ${await impersonateResponse.text()}`
    );
  }
  const { accessToken } = await impersonateResponse.json();
  return accessToken;
}

// Drive query strings are single-quoted; escape anything a client typed.
function quote(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

class DriveClient {
  constructor(private token: string) {}

  private async request(url: string, init: RequestInit = {}) {
    const response = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${this.token}`, ...init.headers },
    });
    if (!response.ok) {
      throw new Error(`Drive ${init.method || "GET"} ${url} failed: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  async findOne(query: string): Promise<{ id: string; parents: string[] } | null> {
    const params = new URLSearchParams({
      q: `${query} and trashed=false`,
      corpora: "drive",
      driveId: SHARED_DRIVE_ID,
      includeItemsFromAllDrives: "true",
      supportsAllDrives: "true",
      fields: "files(id,parents)",
      pageSize: "1",
    });
    const { files } = await this.request(`${DRIVE_API}/files?${params}`);
    return files[0] ?? null;
  }

  async stageFolderId(stage: ClientStage): Promise<string> {
    const name = stage === "active" ? ACTIVE_FOLDER : PROSPECTIVE_FOLDER;
    const folder = await this.findOne(
      `name=${quote(name)} and mimeType='${FOLDER_MIME}' and ${quote(SHARED_DRIVE_ID)} in parents`
    );
    if (!folder) throw new Error(`No "${name}" folder at the top of the SunFM Clients drive`);
    return folder.id;
  }

  async createFolder(name: string, parentId: string, email: string): Promise<string> {
    const { id } = await this.request(`${DRIVE_API}/files?supportsAllDrives=true&fields=id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mimeType: FOLDER_MIME,
        parents: [parentId],
        appProperties: { [EMAIL_PROPERTY]: email },
      }),
    });
    return id;
  }

  async moveFolder(id: string, fromId: string, toId: string) {
    const params = new URLSearchParams({
      addParents: toId,
      removeParents: fromId,
      supportsAllDrives: "true",
    });
    await this.request(`${DRIVE_API}/files/${id}?${params}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  }

  async uploadPdf(name: string, parentId: string, pdf: ArrayBuffer): Promise<string> {
    const boundary = `sunfm-${crypto.randomUUID()}`;
    const metadata = JSON.stringify({ name, parents: [parentId], mimeType: "application/pdf" });
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,
      pdf,
      `\r\n--${boundary}--`,
    ]);
    const { webViewLink } = await this.request(
      `${UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink`,
      {
        method: "POST",
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      }
    );
    return webViewLink;
  }
}

// Puts a signed PDF in the client's folder, creating the folder or moving it
// from Prospective to Active as needed. Returns a link to the uploaded file.
export async function fileSignedForm({
  oidcToken,
  clientName,
  clientEmail,
  stage,
  fileName,
  pdf,
}: {
  oidcToken: string;
  clientName: string;
  clientEmail: string;
  stage: ClientStage;
  fileName: string;
  pdf: ArrayBuffer;
}): Promise<string> {
  const drive = new DriveClient(await getAccessToken(oidcToken));
  const email = clientEmail.trim().toLowerCase();

  const [prospectiveId, activeId] = await Promise.all([
    drive.stageFolderId("prospective"),
    drive.stageFolderId("active"),
  ]);
  const targetId = stage === "active" ? activeId : prospectiveId;

  const existing = await drive.findOne(
    `appProperties has { key=${quote(EMAIL_PROPERTY)} and value=${quote(email)} } and mimeType='${FOLDER_MIME}'`
  );

  let folderId: string;
  if (!existing) {
    folderId = await drive.createFolder(clientName.trim(), targetId, email);
  } else {
    folderId = existing.id;
    // Only ever promote. An active client re-signing the waiver stays active.
    if (stage === "active" && existing.parents.includes(prospectiveId)) {
      await drive.moveFolder(folderId, prospectiveId, activeId);
    }
  }

  return drive.uploadPdf(fileName, folderId, pdf);
}
