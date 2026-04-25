// Edge Function: proxy HTTPS -> API DailyFitness
// Resolve mixed content e CORS em produção

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};

// ⚠️ Importante:
// A API original responde em http://54.232.227.118 mas o IIS está configurado
// para redirecionar (307) para https://54.232.227.118, e o certificado HTTPS
// é inválido (UnknownIssuer / hostname mismatch para IP).
//
// Como o Deno fetch (no edge runtime) não permite ignorar certificados inválidos,
// precisamos chamar diretamente HTTP e NÃO seguir o redirect — assim a API
// (IIS) processa a request normalmente sem upgrade para HTTPS.
const TARGET_BASE = "http://54.232.227.118";

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Remove qualquer prefixo até (e incluindo) "api-proxy" do path.
    // O runtime entrega a URL como "/api-proxy/..." (ou "/functions/v1/api-proxy/...").
    const proxyPath = url.pathname.replace(/^.*\/api-proxy/, "");
    const targetUrl = `${TARGET_BASE}${proxyPath}${url.search}`;

    console.log(`[proxy] ${req.method} -> ${targetUrl}`);

    const init: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type":
          req.headers.get("content-type") ?? "application/json",
        Accept: "application/json",
      },
      // ❗ NÃO seguir redirects — evita o upgrade HTTP->HTTPS que falha por cert inválido.
      redirect: "manual",
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.text();
      init.body = body;
      console.log(`[proxy] body:`, body);
    }

    const apiResponse = await fetch(targetUrl, init);
    const responseText = await apiResponse.text();

    console.log(
      `[proxy] response status: ${apiResponse.status}, body: ${responseText.slice(0, 500)}`
    );

    // Se a API insistir no redirect (3xx), retornamos um erro claro.
    if (apiResponse.status >= 300 && apiResponse.status < 400) {
      const location = apiResponse.headers.get("location");
      return new Response(
        JSON.stringify({
          success: false,
          message: `A API original respondeu ${apiResponse.status} redirecionando para ${location}. O servidor IIS precisa ser configurado para aceitar HTTP sem redirect, ou ter um certificado HTTPS válido instalado.`,
          data: null,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(responseText, {
      status: apiResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          apiResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    console.error("[proxy] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        message: `Proxy error: ${message}`,
        data: null,
      }),
      {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
