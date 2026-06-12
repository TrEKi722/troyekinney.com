export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      // Fetch directory listing from cmphts.ekinney.com with browser User-Agent
      const response = await fetch('https://cmphts.ekinney.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        redirect: 'follow'
      });
      
      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch: ${response.statusText}` }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const html = await response.text();
      
      // Parse HTML to extract image links using regex
      const imageFiles: string[] = [];
      // Match href="filename" or href='filename' patterns
      const hrefRegex = /href=["']([^"']+)["']/g;
      let match;
      
      while ((match = hrefRegex.exec(html)) !== null) {
        const href = match[1];
        const lowerHref = href.toLowerCase();
        
        // Check if it's an image file
        if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(lowerHref)) {
          imageFiles.push(href);
        }
      }

      if (imageFiles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No image files found. HTML length: ' + html.length }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      // Return as JSON with CORS headers
      return new Response(JSON.stringify({ images: imageFiles }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600',
        },
      });
    } catch (error: any) {
      console.error('Error listing images:', error);
      return new Response(
        JSON.stringify({ error: `Exception: ${error?.message || String(error)}` }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
