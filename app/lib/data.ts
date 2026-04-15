import { cache } from 'react';

const API_BASE = "https://streamku-kappa.vercel.app";

export const getStreams = cache(async () => {
  try {
    const res = await fetch(`${API_BASE}/stream.json`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch streams");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
});

export const getSliders = cache(async () => {
  try {
    const res = await fetch(`${API_BASE}/slider.json`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch sliders");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
});

export const getCategories = cache(async () => {
  try {
    const res = await fetch(`${API_BASE}/category.json`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
});

export const getDonations = cache(async () => {
  try {
    const res = await fetch(`${API_BASE}/donation.json`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch donations");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
});


export async function getStreamBySlug(slug: string) {
  const streams = await getStreams();
  return streams.find((s: any) => s.slug === slug);
}

export async function getSetup() {
  try {
    const setup = await import('./setup.json');
    return setup.default;
  } catch (error) {
    return {
      sitename: "VisionPro",
      favicon_url: "/favicon.ico",
      logo_url: ""
    };
  }
}
