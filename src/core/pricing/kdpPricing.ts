/**
 * Amazon KDP Pricing & Royalty Engine
 * Computes official Amazon KDP printing costs, minimum list prices,
 * author royalties, and profit margins for 8.5" x 11" Paperbacks and Kindle eBooks.
 */

export type MarketplaceCurrency = 'USD' | 'GBP' | 'EUR' | 'INR';

export interface CurrencyConfig {
  code: MarketplaceCurrency;
  symbol: string;
  name: string;
  fixedCost: number;
  perPageCost: number;
  defaultPaperbackPrice: number;
  defaultEbookPrice: number;
  recommendedTiers: { label: string; price: number; badge?: string }[];
}

export const KDP_CURRENCIES: Record<MarketplaceCurrency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar ($)',
    fixedCost: 1.00,
    perPageCost: 0.012,
    defaultPaperbackPrice: 7.99,
    defaultEbookPrice: 2.99,
    recommendedTiers: [
      { label: 'Budget Entry', price: 5.99 },
      { label: 'Popular Value', price: 6.99 },
      { label: 'Sweet Spot', price: 7.99, badge: 'Recommended' },
      { label: 'Premium Edition', price: 8.99 },
      { label: 'Collector Gift', price: 9.99 },
    ],
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (£)',
    fixedCost: 0.80,
    perPageCost: 0.010,
    defaultPaperbackPrice: 6.49,
    defaultEbookPrice: 2.49,
    recommendedTiers: [
      { label: 'Budget Entry', price: 4.99 },
      { label: 'Popular Value', price: 5.99 },
      { label: 'Sweet Spot', price: 6.49, badge: 'Recommended' },
      { label: 'Premium Edition', price: 7.99 },
    ],
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (€)',
    fixedCost: 0.90,
    perPageCost: 0.012,
    defaultPaperbackPrice: 7.49,
    defaultEbookPrice: 2.99,
    recommendedTiers: [
      { label: 'Budget Entry', price: 5.49 },
      { label: 'Popular Value', price: 6.49 },
      { label: 'Sweet Spot', price: 7.49, badge: 'Recommended' },
      { label: 'Premium Edition', price: 8.49 },
    ],
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (₹)',
    fixedCost: 85.00,
    perPageCost: 1.02,
    defaultPaperbackPrice: 499.00,
    defaultEbookPrice: 199.00,
    recommendedTiers: [
      { label: 'Budget Entry', price: 299.00 },
      { label: 'Popular Value', price: 399.00 },
      { label: 'Sweet Spot', price: 499.00, badge: 'Recommended' },
      { label: 'Premium Edition', price: 599.00 },
      { label: 'Collector Gift', price: 699.00 },
    ],
  },
};

export interface PaperbackPricingCalculation {
  pageCount: number;
  currency: CurrencyConfig;
  listPrice: number;
  printingCost: number;
  minListPrice: number;
  amazonFee: number;
  authorRoyalty: number;
  profitMarginPercent: number;
  isProfitable: boolean;
}

export interface EbookPricingCalculation {
  currency: CurrencyConfig;
  listPrice: number;
  authorRoyalty: number;
  profitMarginPercent: number;
}

/**
 * Calculates exact Amazon KDP Paperback printing cost for 8.5" x 11" black & white interior.
 * Formula: Fixed Cost + (PageCount * PerPageCost)
 */
export function calculateKdpPrintingCost(
  pageCount: number,
  currency: MarketplaceCurrency = 'USD'
): number {
  const config = KDP_CURRENCIES[currency];
  const cost = config.fixedCost + pageCount * config.perPageCost;
  return Math.round(cost * 100) / 100;
}

/**
 * Calculates minimum required list price so author royalty is >= 0 on Amazon KDP.
 * Formula: Printing Cost / 0.60
 */
export function calculateMinListPrice(
  pageCount: number,
  currency: MarketplaceCurrency = 'USD'
): number {
  const printingCost = calculateKdpPrintingCost(pageCount, currency);
  return Math.round((printingCost / 0.6) * 100) / 100;
}

/**
 * Full Amazon KDP Paperback pricing and royalty breakdown.
 */
export function calculatePaperbackPricing(
  pageCount: number,
  listPrice: number,
  currency: MarketplaceCurrency = 'USD'
): PaperbackPricingCalculation {
  const curr = KDP_CURRENCIES[currency];
  const printingCost = calculateKdpPrintingCost(pageCount, currency);
  const minListPrice = calculateMinListPrice(pageCount, currency);

  // Amazon retains 40% distribution fee
  const amazonFee = Math.round(listPrice * 0.4 * 100) / 100;

  // Author royalty: (List Price * 60%) - Printing Cost
  const authorRoyaltyRaw = listPrice * 0.6 - printingCost;
  const authorRoyalty = Math.round(Math.max(0, authorRoyaltyRaw) * 100) / 100;

  const profitMarginPercent =
    listPrice > 0 ? Math.round((authorRoyalty / listPrice) * 1000) / 10 : 0;

  return {
    pageCount,
    currency: curr,
    listPrice,
    printingCost,
    minListPrice,
    amazonFee,
    authorRoyalty,
    profitMarginPercent,
    isProfitable: authorRoyaltyRaw > 0,
  };
}

/**
 * Kindle eBook pricing and royalty breakdown (70% standard royalty tier for $2.99 - $9.99).
 */
export function calculateEbookPricing(
  listPrice?: number,
  currency: MarketplaceCurrency = 'USD'
): EbookPricingCalculation {
  const curr = KDP_CURRENCIES[currency];
  const price = listPrice !== undefined ? listPrice : curr.defaultEbookPrice;
  const authorRoyalty = Math.round(price * 0.7 * 100) / 100;
  return {
    currency: curr,
    listPrice: price,
    authorRoyalty,
    profitMarginPercent: 70.0,
  };
}
