import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY is not set. Email notifications will be disabled.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: "Resend API key not configured" });
    }

    if (!resend) {
      console.warn("Email requested but Resend client is not initialized.");
      return res.status(200).json({ success: true, message: "Email service unavailable, but request received" });
    }

    // Fire and forget email sending to avoid blocking the client
    resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "delivered@resend.dev",
      replyTo: email,
      subject: `[Contact] ${name} sent you a message`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Courier New', Courier, monospace; 
                line-height: 1.6; 
                color: #ffffff; 
                background-color: #000000; 
                margin: 0; 
                padding: 40px 20px; 
              }
              .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: #0a0a0a; 
                border: 1px solid #1a1a1a; 
                padding: 40px;
                position: relative;
                overflow: hidden;
              }
              .grid-overlay {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: radial-gradient(circle, #333 0.5px, transparent 0.5px);
                background-size: 20px 20px;
                opacity: 0.1;
                pointer-events: none;
              }
              .header { 
                border-bottom: 2px solid #ff3131; 
                padding-bottom: 24px; 
                margin-bottom: 40px;
                position: relative;
                z-index: 1;
              }
              .header h1 { 
                margin: 0; 
                font-size: 20px; 
                text-transform: uppercase; 
                letter-spacing: 4px; 
                font-weight: 900;
                color: #ffffff;
              }
              .status-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                background-color: #ff3131;
                margin-right: 10px;
              }
              .label { 
                font-size: 10px; 
                text-transform: uppercase; 
                letter-spacing: 3px; 
                color: #444444; 
                margin-bottom: 8px; 
                font-weight: bold;
                position: relative;
                z-index: 1;
              }
              .value { 
                font-size: 16px; 
                margin-bottom: 32px; 
                color: #eeeeee;
                font-weight: bold;
                letter-spacing: -0.5px;
                position: relative;
                z-index: 1;
              }
              .message-box { 
                background: #111111; 
                padding: 30px; 
                border: 1px solid #222222;
                color: #cccccc;
                font-size: 15px;
                white-space: pre-wrap;
                position: relative;
                z-index: 1;
              }
              .footer { 
                margin-top: 50px; 
                font-size: 9px; 
                color: #222222; 
                text-transform: uppercase; 
                letter-spacing: 5px;
                text-align: center;
                border-top: 1px solid #111111;
                padding-top: 20px;
                position: relative;
                z-index: 1;
              }
              .accent-red { color: #ff3131; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="grid-overlay"></div>
              <div class="header">
                <div class="label" style="margin-bottom: 12px;"><span class="status-dot"></span>INCOMING // SIGNAL</div>
                <h1>NEW MESSAGE</h1>
              </div>
              
              <div class="label">TRANSMITTED FROM</div>
              <div class="value">${name.toUpperCase()} <span class="accent-red">&lt;</span>${email}<span class="accent-red">&gt;</span></div>
              
              <div class="label">DATA PAYLOAD // MESSAGE</div>
              <div class="message-box">${message}</div>
              
              <div class="footer">
                PORTFOLIO SYSTEM V1.0 // <span class="accent-red">END OF TRANSMISSION</span>
              </div>
            </div>
          </body>
        </html>
      `,
    }).catch(error => {
      console.error("Background email sending failed:", error);
    });

    // Respond immediately to the client
    res.status(200).json({ success: true, message: "Email queued" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
