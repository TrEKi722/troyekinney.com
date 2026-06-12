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
      // List all objects in the R2 bucket
      const list = await env.CAMP_PHOTOS.list();
      
      // Filter for supported media files
      const mediaFiles = list.objects
        .map((obj: any) => obj.key)
        .filter((key: string) => {
          const keyLower = key.toLowerCase();
          return /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov)$/i.test(keyLower);
        });

      if (mediaFiles.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No media files found' }),
          { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      // Return as JSON with CORS headers
      return new Response(JSON.stringify({ media: mediaFiles }), {
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
