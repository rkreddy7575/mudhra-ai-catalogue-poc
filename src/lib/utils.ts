/**
 * Shared utility functions
 */

/** Convert a category name to a URL-safe slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Convert a slug back to a display name (best-effort) */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Format INR price */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Price not available';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Parse page and pageSize from search params, with safe defaults */
export function parsePagination(
  searchParams: Record<string, string | string[] | undefined>,
  defaults = { page: 1, pageSize: 24 }
): { page: number; pageSize: number; offset: number } {
  const page = clamp(parseInt(String(searchParams.page || defaults.page), 10) || defaults.page, 1, 1000);
  const pageSize = clamp(
    parseInt(String(searchParams.pageSize || defaults.pageSize), 10) || defaults.pageSize,
    1,
    100
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}

/** Truncate text to a maximum length with ellipsis */
export function truncate(text: string | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/** Category icon mapping */
export const CATEGORY_ICONS: Record<string, string> = {
  'Water Bottles': '🍶',
  'Mugs': '☕',
  'Electronics': '🔌',
  'Table Tops': '🖥️',
  'Pens': '🖊️',
  'Key Chains': '🔑',
  'Notebooks': '📓',
  'VC Card Holders': '💳',
  'Acrylic Stands': '🏗️',
  'ID Card Holders': '🪪',
  'Gift Sets': '🎁',
};

const AVAILABLE_CATEGORY_IMAGES = new Set([
  'water-bottles',
  'mugs',
  'electronics',
  'gift-sets',
  'notebooks',
  'pens',
  'id-card-holders',
]);

/** Get sample category representative image URL if available */
export function getCategoryImageUrl(category: string): string | null {
  const slug = slugify(category || '');
  if (AVAILABLE_CATEGORY_IMAGES.has(slug)) {
    return `/images/categories/${slug}.jpg`;
  }
  return null;
}

/**
 * Generate a WhatsApp click-to-chat URL with pre-formatted message
 */
export function generateWhatsAppShareUrl(options: {
  phone?: string | null;
  text: string;
}): string {
  const cleanPhone = options.phone ? options.phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(options.text);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}


