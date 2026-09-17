/**
 * Company Information Configuration
 * 
 * Source of truth: The supplied Mudhra Gifting Products Catalogue.
 * - Company Name: "Mudhra Branding Solutions"
 * - Tagline: "Corporate Gifting & Customized Branding Solutions"
 * 
 * Contact details (Phone, Email, Address, Website):
 * Configurable strictly via environment variables.
 * Do NOT invent contact details or use fake placeholder phone numbers or email addresses.
 * If not provided in environment variables, fields remain null, and UI gracefully adapts.
 */

export interface CompanySettings {
  name: string;
  tagline: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
}

export const companySettings: CompanySettings = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || 'Mudhra Branding Solutions',
  tagline: 'Corporate Gifting & Customized Branding Solutions',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE?.trim() || null,
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL?.trim() || null,
  website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE?.trim() || null,
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS?.trim() || null,
};
