import { z } from 'zod';

export const SiteSettingsSchema = z.object({
  id: z.string(),
  site_name: z.string(),
  site_logo: z.string(),
  dark_mode_logo: z.string().optional(),
  email_site_logo: z.string().optional(),
  email_dark_mode_logo: z.string().optional(),
  favicon: z.string().optional(),
  site_url: z.string().optional(),
  primary_color: z.string(),
  secondary_color: z.string(),
  accent_color: z.string().optional(),
  background_color: z.string(),
  background_secondary: z.string().optional(),
  text_color: z.string(),
  text_secondary_color: z.string().optional(),
  
  locales: z.array(z.string()).optional(),
  default_locale: z.string().optional(),
  currency_conversion_rates: z.record(z.string(), z.number()).optional(),
  
  locale_addresses: z.record(z.string(), z.object({
    streetAddress: z.string().optional(),
    postalCode: z.string().optional(),
    phoneNumber: z.string().optional()
  })).optional(),
  
  social_links: z.object({
    github: z.string().optional(),
    linkedIn: z.string().optional(),
  }).optional(),
  
  static_black_color: z.string().optional(),
  static_white_color: z.string().optional(),
  
  status_error_color: z.string().optional(),
  status_error_light_color: z.string().optional(),
  status_success_color: z.string().optional(),
  status_success_light_color: z.string().optional(),
  status_warning_color: z.string().optional(),
  status_warning_light_color: z.string().optional(),
  status_info_color: z.string().optional(),
  status_info_light_color: z.string().optional(),
  
  surface_color: z.string().optional(),
  surface_hover_color: z.string().optional(),
  surface_active_color: z.string().optional(),
  
  light_mode_surface_color: z.string().optional(),
  light_mode_surface_hover_color: z.string().optional(),
  light_mode_surface_active_color: z.string().optional(),
  light_mode_border_color: z.string().optional(),
  
  border_color: z.string().optional(),
  border_focus_color: z.string().optional(),
  
  company_address: z.string().optional(),
  support_email: z.string().optional(),
  is_b2b: z.boolean().optional(),
  updated_at: z.string(),
  payment_details: z.record(z.string(), z.any()).optional(),
  payment_methods: z.record(z.string(), z.boolean()).optional(),
  shipping_countries: z.array(z.string()).optional(),
});

export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
