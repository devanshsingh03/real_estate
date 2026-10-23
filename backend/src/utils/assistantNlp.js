const LAKH = 100000;
const CRORE = 10000000;

function parseAmount(numStr, unit) {
  const n = parseFloat(numStr);
  if (Number.isNaN(n)) return null;
  if (/cr/i.test(unit)) return n * CRORE;
  if (/l(akh)?/i.test(unit)) return n * LAKH;
  if (n < 1000) return n * LAKH; // bare small numbers like "50" almost always mean lakhs here
  return n;
}

function extractBudget(text) {
  const result = {};

  const between = text.match(/between\s+(\d+(?:\.\d+)?)\s*(cr|crore|l|lakh)?\s*(?:and|to|-)\s*(\d+(?:\.\d+)?)\s*(cr|crore|l|lakh)?/i);
  if (between) {
    result.minPrice = parseAmount(between[1], between[2] || between[4] || 'l');
    result.maxPrice = parseAmount(between[3], between[4] || between[2] || 'l');
    return result;
  }

  const under = text.match(/(?:under|below|less than|upto|up to|within|max(?:imum)?)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|l|lakh)?/i);
  if (under) {
    result.maxPrice = parseAmount(under[1], under[2] || 'l');
  }

  const over = text.match(/(?:above|over|more than|min(?:imum)?|at least)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|l|lakh)?/i);
  if (over) {
    result.minPrice = parseAmount(over[1], over[2] || 'l');
  }

  if (!result.minPrice && !result.maxPrice) {
    const bare = text.match(/₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|l|lakh)\b/i);
    if (bare) {
      result.maxPrice = parseAmount(bare[1], bare[2]);
    }
  }

  return result;
}

function extractLocation(text, locations) {
  const lower = text.toLowerCase();
  for (const loc of locations) {
    if (lower.includes(loc.locality.toLowerCase())) return { city: loc.city, locality: loc.locality };
  }
  for (const loc of locations) {
    if (lower.includes(loc.city.toLowerCase())) return { city: loc.city };
  }
  return null;
}

function extractPropertyType(text) {
  const lower = text.toLowerCase();
  if (/\b(commercial|shop|office|retail|showroom)\b/.test(lower)) return 'commercial';
  if (/\b(agricultural|agriculture|farm|farming|field)\b/.test(lower)) return 'agricultural';
  if (/\b(residential|house|home)\b/.test(lower)) return 'residential';
  return null;
}

function extractStatus(text) {
  const lower = text.toLowerCase();
  if (/\bavailable\b/.test(lower)) return 'available';
  if (/\breserved\b/.test(lower)) return 'reserved';
  if (/\bsold\b/.test(lower)) return 'sold';
  return null;
}

const GREETING_RE = /^\s*(hi|hii|hiii|hello|hey|namaste|namaskar|yo)\b/i;
const THANKS_RE = /\b(thanks|thank you|thnx|shukriya|dhanyavad)\b/i;

function detectIntent(text) {
  const lower = text.toLowerCase();
  if (GREETING_RE.test(lower)) return 'greeting';
  if (THANKS_RE.test(lower)) return 'thanks';
  if (/\b(emi|loan|interest rate|down payment|installment)\b/.test(lower)) return 'emi';
  if (/\b(visit|site visit|walk ?through|see the plot|come and see)\b/.test(lower)) return 'site_visit';
  if (/\b(contact|phone|call|number|talk to (a )?human|agent|team|speak to someone)\b/.test(lower)) return 'contact';
  if (/\b(verified|verification|genuine|trust|fake|legit)\b/.test(lower)) return 'verified';
  if (/\b(compare|comparison)\b/.test(lower)) return 'compare';
  if (/\b(wishlist|favou?rite|saved?)\b/.test(lower)) return 'wishlist';
  if (/\b(3d|explorer|layout|map view)\b/.test(lower)) return 'explorer';
  if (/\b(sell|list my|list a plot|become a seller)\b/.test(lower)) return 'sell';
  if (/\b(document|paper|ownership|title|registry)\b/.test(lower)) return 'documents';

  const budget = extractBudget(lower);
  const hasSearchWord = /\b(plot|plots|property|properties|land|house|show|find|looking|search|katni|residential|commercial|agricultural)\b/.test(lower);
  if (hasSearchWord || budget.minPrice || budget.maxPrice) return 'search';

  return 'unknown';
}

module.exports = { extractBudget, extractLocation, extractPropertyType, extractStatus, detectIntent };
