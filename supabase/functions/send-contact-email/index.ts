import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Allowed origins for CORS - restrict to your domains only
const ALLOWED_ORIGINS = [
  "https://id-preview--57675654-0a03-43cd-9588-d1a24a2a92f0.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 5; // Maximum requests allowed
const RATE_LIMIT_WINDOW_MINUTES = 60; // Time window in minutes

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

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
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phone.length <= 20 && phoneRegex.test(phone);
}

// Get client IP from request headers
function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP if there are multiple
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown";
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método no permitido." }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  // Check origin for non-preflight requests
  if (!origin || !ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  )) {
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    return new Response(
      JSON.stringify({ error: "Origen no autorizado." }),
      { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    // Initialize Supabase client with service role key for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);
    
    // Check rate limit
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - RATE_LIMIT_WINDOW_MINUTES);
    
    const { count, error: countError } = await supabase
      .from("contact_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", clientIp)
      .gte("created_at", windowStart.toISOString());

    if (countError) {
      console.error("Error checking rate limit:", countError);
      // Continue anyway - don't block legitimate users due to DB issues
    } else if (count !== null && count >= RATE_LIMIT_MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Ha excedido el límite de solicitudes. Por favor, intente más tarde." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    // Record successful request for rate limiting
    const { error: insertError } = await supabase
      .from("contact_rate_limits")
      .insert({ ip_address: clientIp });

    if (insertError) {
      console.error("Error recording rate limit:", insertError);
      // Don't fail the request - email was already sent
    }

    // Clean up old rate limit records periodically (1% chance per request)
    if (Math.random() < 0.01) {
      (async () => {
        try {
          await supabase.rpc("cleanup_old_rate_limits");
          console.log("Cleaned up old rate limit records");
        } catch (err) {
          console.error("Error cleaning up rate limits:", err);
        }
      })();
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
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