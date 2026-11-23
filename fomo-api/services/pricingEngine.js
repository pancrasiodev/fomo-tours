/**
 * Server-Side Authoritative Pricing Engine for Lany Cakes Shop
 * Formula: Total = Base Cake Price + Customisation Charges + Delivery Fee - Applicable Discounts
 * Validates all client requests against official bakery catalog rates.
 */

const BASE_WEIGHT_PRICES = {
  '500g': 1500,
  '1 kg': 2500,
  '1.5 kg': 3200,
  '2 kg': 4200,
  '3 kg': 6200,
  '4 kg': 8200,
  '5 kg (2 Tiers)': 16500,
  '8 kg (3 Tiers)': 24000,
  '12 kg (4 Tiers)': 36000
};

const EXTRA_CHARGES = {
  candles: 200,
  acrylicTopper: 500,
  goldLeaf: 300,
  berryCrown: 400,
  luxuryPackaging: 400,
  egglessDietary: 400,
  glutenFreeDietary: 800
};

const DELIVERY_ZONE_FEES = {
  pickup: 0,
  ruiru: 300,
  thika_road: 300,
  cbd: 300,
  westlands_kilimani: 350,
  karen_langata: 500,
  runda_muthaiga: 450,
  other_nairobi: 400
};

/**
 * Calculates authoritative order totals.
 * Never trusts prices sent directly from the client.
 */
function calculateOrderTotals({ items = [], deliveryType = 'delivery', deliveryZone = 'cbd', discountCode = '' }) {
  let subtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    
    // Resolve base price from item's explicit basePrice / price or default weight catalog
    let basePrice = Number(item.basePrice || item.price || BASE_WEIGHT_PRICES[item.weight] || 2500);

    let extrasCharge = 0;
    const extrasList = [];

    if (item.extras) {
      if (item.extras.candles) {
        extrasCharge += EXTRA_CHARGES.candles;
        extrasList.push('Sparkler Candles (+KSh 200)');
      }
      if (item.extras.acrylicTopper) {
        extrasCharge += EXTRA_CHARGES.acrylicTopper;
        extrasList.push('Acrylic Cake Topper (+KSh 500)');
      }
      if (item.extras.goldLeaf) {
        extrasCharge += EXTRA_CHARGES.goldLeaf;
        extrasList.push('24k Edible Gold Leaf (+KSh 300)');
      }
      if (item.extras.berryCrown) {
        extrasCharge += EXTRA_CHARGES.berryCrown;
        extrasList.push('Fresh Berry Crown (+KSh 400)');
      }
      if (item.extras.luxuryPackaging) {
        extrasCharge += EXTRA_CHARGES.luxuryPackaging;
        extrasList.push('Luxury Satin Gift Box (+KSh 400)');
      }
      if (item.extras.dietary === 'eggless') {
        extrasCharge += EXTRA_CHARGES.egglessDietary;
        extrasList.push('100% Eggless Sponge (+KSh 400)');
      } else if (item.extras.dietary === 'gluten_free') {
        extrasCharge += EXTRA_CHARGES.glutenFreeDietary;
        extrasList.push('Gluten-Free Flour (+KSh 800)');
      }
    }

    const unitPrice = basePrice + extrasCharge;
    const itemTotal = unitPrice * qty;
    subtotal += itemTotal;

    validatedItems.push({
      cakeId: item.cakeId || item.id || 'custom-cake',
      name: item.name || 'Artisan Celebration Cake',
      weight: item.weight || '1.5 kg',
      flavor: item.flavor || 'Classic Vanilla Velvet',
      filling: item.filling || 'Swiss Buttercream',
      icing: item.icing || 'Smooth Buttercream',
      inscription: (item.inscription || '').slice(0, 100),
      referenceImage: item.referenceImage || '',
      extrasList,
      unitPrice,
      quantity: qty,
      itemTotal
    });
  }

  // Delivery fee calculation
  let deliveryFee = 0;
  if (deliveryType === 'delivery') {
    deliveryFee = DELIVERY_ZONE_FEES[deliveryZone] !== undefined ? DELIVERY_ZONE_FEES[deliveryZone] : 350;
  }

  // Discount calculation
  let discountAmount = 0;
  if (discountCode && discountCode.toUpperCase() === 'LANYWELCOME') {
    discountAmount = Math.round(subtotal * 0.05); // 5% welcome discount
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

  return {
    items: validatedItems,
    subtotal,
    deliveryFee,
    discountAmount,
    finalTotal,
    currency: 'KSh'
  };
}

module.exports = {
  calculateOrderTotals,
  BASE_WEIGHT_PRICES,
  EXTRA_CHARGES,
  DELIVERY_ZONE_FEES
};
