import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sendLeadToClose } from "@/lib/close";
import { formatSmsConsent } from "@/lib/sms-consent";

interface FormData {
  name: string;
  email: string;
  phone: string;
  smsConsent?: boolean;
  age: string;
  goal: string;
  goalDetails: string;
  experience: string;
  currentRoutine: string;
  motivation: string;
  injuries: string;
  referral: string;
  referralDetails: string;
  attribution?: Record<string, string>;
  landingPage?: string;
}

function formatAttribution(
  attribution: Record<string, string> | undefined,
  landingPage: string | undefined
): string {
  const parts: string[] = [];
  if (landingPage) parts.push(`landing: ${landingPage}`);
  if (attribution) {
    for (const [key, value] of Object.entries(attribution)) {
      if (value) parts.push(`${key}: ${value}`);
    }
  }
  return parts.length > 0 ? parts.join(" | ") : "(none)";
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function readCookie(request: Request, name: string): string | undefined {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function POST(request: Request) {
  try {
    const data: FormData = await request.json();

    if (!data.name || !data.email || !data.phone || !data.goal || !data.referral) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const attributionSummary = formatAttribution(
      data.attribution,
      data.landingPage
    );

    // Carrier review can ask us to produce proof of opt-in for any number we
    // text, so the answer is written to every destination alongside the lead.
    const smsConsentSummary = formatSmsConsent(data.smsConsent);

    // The lead is only truly lost if every channel below fails. Track that, so a
    // downstream outage (expired SMTP password, Apps Script hiccup) never tells a
    // prospect their submission failed when we actually have their details.
    let leadCaptured = false;

    if (process.env.CONSULTATION_SHEETS_WEBHOOK_URL) {
      try {
        const sheetsResponse = await fetch(process.env.CONSULTATION_SHEETS_WEBHOOK_URL, {
          method: "POST",
          redirect: "follow",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            smsConsent: smsConsentSummary,
            age: data.age || "",
            goal: data.goal + (data.goalDetails ? ` — ${data.goalDetails}` : ""),
            experience: data.experience,
            currentRoutine: data.currentRoutine || "",
            motivation: data.motivation || "",
            injuries: data.injuries || "",
            howTheyHeard: data.referral + (data.referralDetails ? ` — ${data.referralDetails}` : ""),
            attribution: attributionSummary,
            landingPage: data.landingPage || "",
            gclid: data.attribution?.gclid || "",
            utmSource: data.attribution?.utm_source || "",
            utmMedium: data.attribution?.utm_medium || "",
            utmCampaign: data.attribution?.utm_campaign || "",
            utmTerm: data.attribution?.utm_term || "",
            utmContent: data.attribution?.utm_content || "",
            submittedAt: new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
          }),
        });
        // fetch only rejects on network failure, so check the status too.
        if (sheetsResponse.ok) {
          leadCaptured = true;
        } else {
          console.error(
            `Sheets webhook returned ${sheetsResponse.status} for ${data.email}`
          );
        }
      } catch (sheetsError) {
        console.error("Sheets webhook error:", sheetsError);
      }
    }

    // Close is the system of record for follow-up, so a lead that reaches it is
    // captured even if the sheet and the notification email both fail.
    if (process.env.CLOSE_API_KEY) {
      // The pixel sets _fbc only when it sees the fbclid itself, so fall back to
      // building it from the fbclid the form captured (Meta's documented format).
      const fbclid = data.attribution?.fbclid;
      const metaFbc =
        readCookie(request, "_fbc") ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);
      const metaFbp = readCookie(request, "_fbp");
      try {
        if (await sendLeadToClose({ ...data, metaFbc, metaFbp })) {
          leadCaptured = true;
        }
      } catch (closeError) {
        console.error("Close CRM error:", closeError);
      }
    }

    const recipients = process.env.NOTIFICATION_EMAILS || "";

    // The /start form only asks for name, email, phone and goal, so the fields
    // it never collects would just read as blank or "Not provided".
    const isStartPage = data.landingPage === "/start";
    const ageLine = isStartPage ? "" : `\nAge: ${data.age || "Not provided"}`;
    const backgroundLines = isStartPage
      ? ""
      : `
Experience: ${data.experience}
Current Routine: ${data.currentRoutine || "Not provided"}
Motivation: ${data.motivation || "Not provided"}
Injuries/Pain: ${data.injuries || "None"}`;

    try {
      await transporter.sendMail({
        from: `"SunFM Notifications" <${process.env.GMAIL_USER}>`,
        to: recipients,
        subject: `New Consultation Request: ${data.name}`,
        text: `
New consultation request from ${data.name}

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
SMS consent: ${smsConsentSummary}${ageLine}

Goal: ${data.goal}${data.goalDetails ? ` — ${data.goalDetails}` : ""}${backgroundLines}

How they heard about SunFM: ${data.referral}${data.referralDetails ? ` — ${data.referralDetails}` : ""}

Attribution: ${attributionSummary}
      `.trim(),
      });
      leadCaptured = true;
    } catch (mailError) {
      // Most likely an expired Gmail app password. Loud, because a silent failure
      // here means nobody finds out about the lead until someone reads the sheet.
      console.error(
        `NOTIFICATION EMAIL FAILED for ${data.email} (${data.name}) — check GMAIL_APP_PASSWORD:`,
        mailError
      );
    }

    if (!leadCaptured) {
      console.error(
        `LEAD LOST — every channel failed for ${data.email} (${data.name})`
      );
      return NextResponse.json(
        { error: "Failed to submit form" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Form submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
