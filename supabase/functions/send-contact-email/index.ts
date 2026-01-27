import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
  date?: string;
}

// HTML escape function to prevent XSS/injection attacks
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (optional, basic validation)
function isValidPhone(phone: string): boolean {
  // Allow digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phone.length <= 20 && phoneRegex.test(phone);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message, date }: ContactEmailRequest = await req.json();

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Por favor, ingrese un nombre válido.' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Por favor, ingrese un correo electrónico válido.' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Por favor, ingrese un mensaje.' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Length validation to prevent abuse
    if (name.length > 100) {
      return new Response(
        JSON.stringify({ error: 'El nombre es demasiado largo (máximo 100 caracteres).' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'El mensaje es demasiado largo (máximo 2000 caracteres).' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (phone && (typeof phone !== 'string' || !isValidPhone(phone))) {
      return new Response(
        JSON.stringify({ error: 'Por favor, ingrese un número de teléfono válido.' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize all inputs to prevent HTML injection
    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safePhone = phone ? escapeHtml(phone.trim()) : null;
    const safeMessage = escapeHtml(message.trim());
    const safeDate = date ? escapeHtml(date.trim()) : null;

    // Send email to the lawyer
    const emailResponse = await resend.emails.send({
      from: "Consultoría Legal <no-reply@resend.dev>",
      to: ["susymar321@gmail.com"],
      subject: "Nueva solicitud de consultoría",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #2E2E2E; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #B11226, #7A6C9D); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #B11226; }
            .value { margin-top: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Nueva Solicitud de Consultoría</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Nombre:</div>
                <div class="value">${safeName}</div>
              </div>
              <div class="field">
                <div class="label">Correo electrónico:</div>
                <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
              </div>
              ${safePhone ? `
              <div class="field">
                <div class="label">Teléfono:</div>
                <div class="value"><a href="tel:${safePhone}">${safePhone}</a></div>
              </div>
              ` : ''}
              ${safeDate ? `
              <div class="field">
                <div class="label">Fecha preferida para consultoría:</div>
                <div class="value">${safeDate}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Mensaje:</div>
                <div class="value">${safeMessage}</div>
              </div>
              <div class="footer">
                <p>Este mensaje fue enviado desde el formulario de contacto de tu sitio web.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    // Log full error details server-side for debugging
    console.error("Error in send-contact-email function:", error);
    
    // Return generic error message to client - never expose internal details
    return new Response(
      JSON.stringify({ error: 'No se pudo enviar el mensaje. Por favor, inténtelo de nuevo más tarde.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
