const API_BASE = "https://streamku.netlify.app";

export async function getStreams() {
  try {
    const res = await fetch(`${API_BASE}/stream.json`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error("Failed to fetch streams");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSliders() {
  try {
    const res = await fetch(`${API_BASE}/slider.json`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error("Failed to fetch sliders");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/category.json`, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getStreamBySlug(slug: string) {
  const streams = await getStreams();
  return streams.find((s: any) => s.slug === slug);
}
