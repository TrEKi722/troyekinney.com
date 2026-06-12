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
      
      // Filter for image files
      const imageFiles = list.objects
        .map((obj: any) => obj.key)
        .filter((key: string) => {
          const keyLower = key.toLowerCase();
          return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(keyLower);
        });

      // Return as JSON with CORS headers
      return new Response(JSON.stringify({ images: imageFiles }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600',
        },
      });
    } catch (error) {
      console.error('Error listing objects:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to list images' }),
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
