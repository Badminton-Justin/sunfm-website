import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface FormData {
  name: string;
  email: string;
  phone: string;
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

    // Subscribe to Kit with consultation_warm tag
    if (process.env.KIT_API_SECRET && process.env.KIT_TAG_CONSULTATION_WARM) {
      try {
        await fetch(
          `https://api.convertkit.com/v3/tags/${process.env.KIT_TAG_CONSULTATION_WARM}/subscribe`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_secret: process.env.KIT_API_SECRET,
              email: data.email,
              first_name: data.name.split(" ")[0],
            }),
          }
        );
      } catch (kitError) {
        console.error("Kit subscription error:", kitError);
      }
    }

    const recipients = process.env.NOTIFICATION_EMAILS || "";

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
Age: ${data.age || "Not provided"}

Goal: ${data.goal}${data.goalDetails ? ` — ${data.goalDetails}` : ""}
Experience: ${data.experience}
Current Routine: ${data.currentRoutine || "Not provided"}
Motivation: ${data.motivation || "Not provided"}
Injuries/Pain: ${data.injuries || "None"}

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
