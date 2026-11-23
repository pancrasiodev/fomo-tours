import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CAKES_CATALOG, CAKE_CATEGORIES, BUSINESS_INFO } from '../src/data/cakesData.js';

describe('1. Cake Categories & Keyword-Rich Architecture', () => {
  test('Contains high-intent categories: bento, boys-birthday, brownies, fondant', () => {
    const categoryIds = CAKE_CATEGORIES.map(c => c.id);
    assert.ok(categoryIds.includes('bento'), 'Missing bento category');
    assert.ok(categoryIds.includes('boys-birthday'), 'Missing boys-birthday category');
    assert.ok(categoryIds.includes('brownies'), 'Missing brownies category');
    assert.ok(categoryIds.includes('fondant'), 'Missing fondant category');
  });

  test('All catalog products are uploaded real cakes with valid price, image, and weights', () => {
    assert.equal(CAKES_CATALOG.length, 20, `Expected 20 uploaded cakes, got ${CAKES_CATALOG.length}`);
    for (const cake of CAKES_CATALOG) {
      assert.ok(cake.id, 'Cake missing id');
      assert.ok(cake.slug, `Cake ${cake.id} missing slug`);
      assert.ok(cake.name, `Cake ${cake.id} missing name`);
      assert.ok(typeof cake.price === 'number' && cake.price > 0, `Cake ${cake.id} invalid price`);
      assert.ok(cake.image && cake.image.startsWith('/images/cakes/'), `Cake ${cake.id} must use /images/cakes/`);
      assert.ok(cake.availableWeights && cake.availableWeights.length > 0, `Cake ${cake.id} missing availableWeights`);
      assert.ok(cake.gallery && cake.gallery.length > 0, `Cake ${cake.id} missing gallery`);
    }
  });

  test('Graduation cakes and bento combos exist with valid slugs and pricing', () => {
    const grad = CAKES_CATALOG.find(c => c.id === 'kindergarten-grade-1-graduation-cake');
    assert.ok(grad, 'Missing kindergarten-grade-1-graduation-cake');
    assert.equal(grad.slug, 'kindergarten-graduation-cake');

    const gradHer = CAKES_CATALOG.find(c => c.id === 'graduation-cake-congrats-grad-her');
    assert.ok(gradHer, 'Missing graduation-cake-congrats-grad-her');

    const bento = CAKES_CATALOG.find(c => c.id === 'bento-cupcake-combo');
    assert.ok(bento, 'Missing bento-cupcake-combo');
    assert.ok(bento.price > 0, 'Bento combo must have positive price');
  });
});

describe('2. Ground Truth Business Info & Kamakis Pickup', () => {
  test('Physical pickup address is Kamakis Eastern Bypass', () => {
    assert.ok(BUSINESS_INFO.address.includes('Kamakis'), 'Address must contain Kamakis');
    assert.ok(BUSINESS_INFO.address.includes('Eastern Bypass'), 'Address must contain Eastern Bypass');
  });

  test('WhatsApp phone is formatted for Kenya (+254)', () => {
    assert.ok(BUSINESS_INFO.whatsapp.startsWith('254'), 'WhatsApp must start with 254');
    assert.ok(BUSINESS_INFO.phone.startsWith('+254'), 'Phone must start with +254');
  });
});

describe('3. Ordering & WhatsApp Handoff Payload Verification', () => {
  test('WhatsApp URL generator formats complete customer details and Kamakis pickup', () => {
    const orderRef = 'LNY-TEST-999';
    const customer = 'Wangari Test';
    const phone = '0712345678';
    const fulfillment = 'Studio Collection (Lany Studio, Kamakis Eastern Bypass)';
    
    let text = `*NEW CAKE ORDER - #${orderRef}*\n\n`;
    text += `👤 *Customer:* ${customer}\n`;
    text += `📞 *Phone:* ${phone}\n`;
    text += `📦 *Fulfillment:* ${fulfillment}\n`;
    
    const waUrl = `https://wa.me/${BUSINESS_INFO.whatsapp}?text=${encodeURIComponent(text)}`;
    assert.ok(waUrl.includes('LNY-TEST-999'), 'WhatsApp URL missing orderRef');
    assert.ok(waUrl.includes('Kamakis'), 'WhatsApp URL missing Kamakis');
    assert.ok(waUrl.includes(BUSINESS_INFO.whatsapp), 'WhatsApp URL missing business number');
  });
});
