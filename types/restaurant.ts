export interface Restaurant extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  cuisine?: string;
  priceLevel?: number;
  averagePrice?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  country?: string;
  locality?: string;
  zipCode?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
}
