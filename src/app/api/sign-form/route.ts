import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { CLIENT_FORMS, type ClientFormId } from "@/lib/client-forms";
import { fileSignedForm } from "@/lib/google/drive";
import { formatSignedAt, generateSignedFormPdf } from "@/lib/signed-form-pdf";

interface SignFormRequest {
  formId: ClientFormId;
  name: string;
  email: string;
  phone: string;
  address?: string;
  cityZip?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  agreed: boolean;
  signature: string;
  // Honeypot: hidden from people, filled in by bots.
  company?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGNATURE_PREFIX = "data:image/png;base64,";
// A drawn signature is a few tens of KB; anything near this is not one.
const MAX_SIGNATURE_LENGTH = 1_000_000;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 300) : "";
}

export async function POST(request: Request) {
  let data: SignFormRequest;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const form = CLIENT_FORMS[data.formId];
  if (!form) {
    return NextResponse.json({ error: "Unknown form" }, { status: 400 });
  }

  // Pretend success so bots don't learn to skip the field.
  if (data.company) {
    return NextResponse.json({ message: "Signed" }, { status: 200 });
  }

  const name = clean(data.name);
  const email = clean(data.email).toLowerCase();
  const phone = clean(data.phone);
  const contact = form.collectsContactDetails
    ? {
        address: clean(data.address),
        cityZip: clean(data.cityZip),
        emergencyName: clean(data.emergencyName),
        emergencyPhone: clean(data.emergencyPhone),
      }
    : {};

  const missingContact = Object.values(contact).some((value) => !value);
  if (!name || !phone || !EMAIL_PATTERN.test(email) || missingContact) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  if (data.agreed !== true) {
    return NextResponse.json({ error: "Please check the box to agree." }, { status: 400 });
  }
  if (
    typeof data.signature !== "string" ||
    !data.signature.startsWith(SIGNATURE_PREFIX) ||
    data.signature.length > MAX_SIGNATURE_LENGTH
  ) {
    return NextResponse.json({ error: "Please sign in the box." }, { status: 400 });
  }

  const signedAt = new Date();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  let pdf: ArrayBuffer;
  try {
    pdf = generateSignedFormPdf(form, {
      name,
      email,
      phone,
      ...contact,
      signature: data.signature,
      signedAt,
      ip,
      userAgent,
    });
  } catch (pdfError) {
    console.error(`Signed form PDF failed for ${email}:`, pdfError);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  const datePrefix = signedAt.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const fileName = `${datePrefix} ${form.shortName}.pdf`;

  // Like the consultation form, the signature only counts as lost if every
  // destination fails: Drive is the filing cabinet, the team email a backup.
  let saved = false;
  let driveLink: string | null = null;
  const oidcToken = request.headers.get("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN;
  try {
    if (!oidcToken) throw new Error("No Vercel OIDC token on the request");
    driveLink = await fileSignedForm({
      oidcToken,
      clientName: name,
      clientEmail: email,
      stage: form.id === "agreement" ? "active" : "prospective",
      fileName,
      pdf,
    });
    saved = true;
  } catch (driveError) {
    console.error(`SIGNED FORM NOT SAVED TO DRIVE for ${email} (${name}):`, driveError);
  }

  const attachment = { filename: fileName, content: Buffer.from(pdf), contentType: "application/pdf" };

  try {
    await transporter.sendMail({
      from: `"SunFM Notifications" <${process.env.GMAIL_USER}>`,
      to: process.env.NOTIFICATION_EMAILS || "",
      subject: `Signed ${form.shortName}: ${name}`,
      text: `
${name} signed the ${form.title} on ${formatSignedAt(signedAt)}.

Email: ${email}
Phone: ${phone}

${driveLink ? `Saved to Drive: ${driveLink}` : "NOT saved to Drive. Save the attached PDF to their client folder by hand."}
      `.trim(),
      attachments: [attachment],
    });
    saved = true;
  } catch (mailError) {
    console.error(`Signed form team email failed for ${email} — check GMAIL_APP_PASSWORD:`, mailError);
  }

  if (!saved) {
    console.error(`SIGNED FORM LOST — Drive and email both failed for ${email} (${name})`);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // The client's copy is a courtesy. A bounce here shouldn't fail a signature
  // we've already stored.
  try {
    await transporter.sendMail({
      from: `"Sun Functional Movement" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Your signed copy: ${form.title}`,
      text: `
Hi ${name.split(" ")[0]},

Thanks for signing. Your copy of the ${form.title} is attached for your records.

Sun Functional Movement
      `.trim(),
      attachments: [attachment],
    });
  } catch (mailError) {
    console.error(`Signed form client copy failed for ${email}:`, mailError);
  }

  return NextResponse.json({ message: "Signed" }, { status: 200 });
}
