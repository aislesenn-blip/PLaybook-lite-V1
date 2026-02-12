// src/lib/imageFetcher.ts

const UNSPLASH_ACCESS_KEY = 'GFRGVmxF64zpxZL22-o3BaVyGxphiGAwXLMfQxLCC2U';

export const fetchImage = async (query: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error('Unsplash API error');
    }

    const data = await response.json();
    return data.urls.regular;
  } catch (error) {
    console.warn('Failed to fetch image from Unsplash:', error);
    // Fallback based on query keywords or generic placeholder
    // Using high quality generic placeholders
    if (query.includes('child') || query.includes('kid')) return 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80';
    if (query.includes('toy')) return 'https://images.unsplash.com/photo-1596464716127-f9a829be003b?auto=format&fit=crop&w=800&q=80';
    if (query.includes('sun')) return 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80';

    return 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80';
  }
};
