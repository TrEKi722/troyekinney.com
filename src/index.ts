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
      // Fetch directory listing from cmphts.ekinney.com
      const response = await fetch('https://cmphts.ekinney.com/');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Parse HTML to extract image links
      const imageFiles: string[] = [];
      const linkRegex = /href=["']([^"']+)["']/g;
      let match;
      
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const lowerHref = href.toLowerCase();
        
        // Check if it's an image file and not a directory
        if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(lowerHref) && !href.startsWith('?')) {
          imageFiles.push(href);
        }
      }

      if (imageFiles.length === 0) {
        throw new Error('No image files found');
      }

      // Return as JSON with CORS headers
      return new Response(JSON.stringify({ images: imageFiles }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600',
        },
      });
    } catch (error) {
      console.error('Error listing images:', error);
      return new Response(
        JSON.stringify({ error: `Failed to list images: ${error}` }),
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
