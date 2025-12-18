// Cloudflare Worker per proxy CalDAV
// Bypassa CORS e supporta metodi HTTP custom (PROPFIND, REPORT, etc.)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, caldav-url, caldav-method',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const { url, method, headers: reqHeaders, body } = await request.json();

      console.log(`[CalDAV Proxy] ${method} ${url}`);

      // Esegui la richiesta CalDAV vera
      const response = await fetch(url, {
        method: method,
        headers: {
          ...reqHeaders,
          'User-Agent': 'Calendar4JW/1.0'
        },
        body: body || undefined
      });

      const responseData = await response.text();
      const responseHeaders = {};
      
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      console.log(`[CalDAV Proxy] Response: ${response.status}`);

      return new Response(
        JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data: responseData
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('[CalDAV Proxy] Error:', error);
      
      return new Response(
        JSON.stringify({
          error: error.message,
          stack: error.stack
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
