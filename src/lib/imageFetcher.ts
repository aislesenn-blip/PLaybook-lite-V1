// src/lib/imageFetcher.ts

const UNSPLASH_ACCESS_KEY = 'GFRGVmxF64zpxZL22-o3BaVyGxphiGAwXLMfQxLCC2U';

// Simple fallback SVGs encoded as Data URIs
const FALLBACK_SVGS = {
  sparkles: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDk3NzA2IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDggOGw0IDQgNC00LTQtNHptLTUgNWwtMiAzIDIgMyAyLTMtMi0zem0xMCAwbC0yIDMgMiAzIDItMy0yLTN6Ii8+PC9zdmc+`,
  brain: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDc1NTY5IiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik05LjUgOWEyLjUgMi41IDAgMCAxIDUgMHY1SDl2LTV6Ii8+PHBhdGggZD0iTTEyIDVhNyA3IDAgMCAwLTcgN3Y2aDE0di02YTcgNyAwIDAgMC03LTd6Ii8+PC9zdmc+`
};

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

    // Return a relevant fallback
    // Instead of random images that might 404, we use reliable Unsplash IDs or SVGs
    if (query.toLowerCase().includes('apple')) return 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80';
    if (query.toLowerCase().includes('ball')) return 'https://images.unsplash.com/photo-1541271696563-3be2f555fc4e?auto=format&fit=crop&w=800&q=80';
    if (query.toLowerCase().includes('cat')) return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80';

    // Generic fallback to SVG if specific image not found
    return FALLBACK_SVGS.sparkles;
  }
};
