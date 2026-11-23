const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { calculateOrderTotals } = require('../services/pricingEngine');
const {
  initiateDarajaStkPush,
  queryStkStatus,
  normalizeKenyanPhone,
} = require('../services/darajaService');

/**
 * Helper to generate random readable order refs like LNY-8429
 */
function generateOrderRef() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LNY-${rand}`;
}

function generateQuoteRef() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `Q-${rand}`;
}

/**
 * POST /api/cake-orders/calculate
 * Live server-side price validation for single item or entire cart
 */
router.post('/calculate', (req, res) => {
  try {
    const { items = [], deliveryType = 'delivery', deliveryZone = 'cbd', discountCode = '' } = req.body;
    const totals = calculateOrderTotals({ items, deliveryType, deliveryZone, discountCode });
    return res.json({ success: true, totals });
  } catch (err) {
    console.error('[Cake Pricing] Error calculating totals:', err);
    return res.status(500).json({ success: false, error: 'Could not calculate order pricing.' });
  }
});

/**
 * POST /api/cake-orders/create
 * Creates an order, validates totals server-side, saves items, initiates M-Pesa STK push
 */
router.post('/create', async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      deliveryType = 'delivery',
      deliveryAddress = '',
      deliveryZone = 'cbd',
      deliveryDate,
      deliverySlot = 'afternoon',
      items = [],
      discountCode = '',
      specialInstructions = '',
      referenceImage = '',
      paymentMethod = 'M-Pesa STK',
    } = req.body;

    if (!customerName || !phone || !deliveryDate || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order fields (customer name, phone, delivery date, items).',
      });
    }

    // 1. Authoritative server-side price computation
    const totals = calculateOrderTotals({ items, deliveryType, deliveryZone, discountCode });

    const orderRef = generateOrderRef();

    // 2. Insert into cake_orders
    await db.query(
      `INSERT INTO cake_orders (
        order_ref, customer_name, email, phone, delivery_type, delivery_address,
        delivery_zone, delivery_date, delivery_slot, subtotal, delivery_fee,
        discount_amount, total_amount, payment_status, payment_method, order_status,
        special_instructions, reference_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'Pending', ?, ?)`,
      [
        orderRef,
        customerName.trim(),
        (email || '').trim().toLowerCase(),
        phone.trim(),
        deliveryType,
        deliveryAddress.trim(),
        deliveryZone,
        deliveryDate,
        deliverySlot,
        totals.subtotal,
        totals.deliveryFee,
        totals.discountAmount,
        totals.finalTotal,
        paymentMethod,
        specialInstructions.trim(),
        referenceImage || '',
      ]
    );

    // 3. Insert items into cake_order_items
    for (const item of totals.items) {
      await db.query(
        `INSERT INTO cake_order_items (
          order_ref, cake_id, name, weight, flavor, filling, icing,
          inscription, extras_json, unit_price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderRef,
          item.cakeId,
          item.name,
          item.weight,
          item.flavor,
          item.filling,
          item.icing,
          item.inscription,
          JSON.stringify(item.extrasList || []),
          item.unitPrice,
          item.quantity,
          item.itemTotal,
        ]
      );
    }

    let stkResult = null;
    let normalizedPhone = normalizeKenyanPhone(phone);

    // 4. If M-Pesa STK is selected, initiate STK push immediately
    if (paymentMethod === 'M-Pesa STK' && normalizedPhone && totals.finalTotal > 0) {
      try {
        stkResult = await initiateDarajaStkPush({
          phone: normalizedPhone,
          amountKes: totals.finalTotal,
          accountReference: orderRef,
          transactionDesc: `Lany Cakes ${orderRef}`,
        });

        if (stkResult && stkResult.checkoutRequestId) {
          await db.query(
            `UPDATE cake_orders SET checkout_request_id = ?, merchant_request_id = ? WHERE order_ref = ?`,
            [stkResult.checkoutRequestId, stkResult.merchantRequestId || '', orderRef]
          );
        }
      } catch (stkErr) {
        console.warn(`[Cake Order] Daraja STK Push prompt warning for ${orderRef}:`, stkErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      orderRef,
      totals,
      stk: stkResult,
      message: 'Order placed successfully! We will coordinate preparation immediately.',
    });
  } catch (err) {
    console.error('[Cake Order] Error creating cake order:', err);
    return res.status(500).json({ success: false, error: 'Failed to create cake order.' });
  }
});

/**
 * POST /api/cake-orders/stk-push
 * Initiate or re-trigger STK push for an existing order
 */
router.post('/stk-push', async (req, res) => {
  try {
    const { orderRef, phone } = req.body;
    if (!orderRef) {
      return res.status(400).json({ success: false, error: 'Order reference required.' });
    }

    const [orders] = await db.query('SELECT * FROM cake_orders WHERE order_ref = ?', [orderRef]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const order = orders[0];
    const targetPhone = phone || order.phone;
    const normalizedPhone = normalizeKenyanPhone(targetPhone);

    if (!normalizedPhone) {
      return res.status(400).json({ success: false, error: 'Valid Kenyan Safaricom phone required.' });
    }

    const stkResult = await initiateDarajaStkPush({
      phone: normalizedPhone,
      amountKes: Math.round(order.total_amount),
      accountReference: order.order_ref,
      transactionDesc: `Lany Cakes ${order.order_ref}`,
    });

    if (stkResult && stkResult.checkoutRequestId) {
      await db.query(
        `UPDATE cake_orders SET checkout_request_id = ?, merchant_request_id = ? WHERE order_ref = ?`,
        [stkResult.checkoutRequestId, stkResult.merchantRequestId || '', order.order_ref]
      );
    }

    return res.json({ success: true, stk: stkResult });
  } catch (err) {
    console.error('[Cake Order] STK Push error:', err);
    return res.status(500).json({ success: false, error: err.message || 'STK push failed.' });
  }
});

/**
 * GET /api/cake-orders/track/:orderRef
 * Order tracking view for customers
 */
router.get('/track/:orderRef', async (req, res) => {
  try {
    const { orderRef } = req.params;
    const [orders] = await db.query('SELECT * FROM cake_orders WHERE order_ref = ?', [orderRef]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order reference not found.' });
    }

    const order = orders[0];

    // If order has checkoutRequestId and is pending, check Daraja status live
    if (order.payment_status === 'pending' && order.checkout_request_id) {
      try {
        const queryRes = await queryStkStatus(order.checkout_request_id);
        if (queryRes && queryRes.ResultCode === '0') {
          await db.query(
            `UPDATE cake_orders SET payment_status = 'paid', order_status = 'Confirmed', mpesa_receipt = ? WHERE order_ref = ?`,
            [queryRes.MpesaReceiptNumber || 'MPESA-VERIFIED', orderRef]
          );
          order.payment_status = 'paid';
          order.order_status = 'Confirmed';
        }
      } catch {
        // Query status failed or still waiting user PIN
      }
    }

    const [items] = await db.query('SELECT * FROM cake_order_items WHERE order_ref = ?', [orderRef]);

    return res.json({
      success: true,
      order: {
        orderRef: order.order_ref,
        customerName: order.customer_name,
        email: order.email,
        phone: order.phone,
        deliveryType: order.delivery_type,
        deliveryAddress: order.delivery_address,
        deliveryZone: order.delivery_zone,
        deliveryDate: order.delivery_date,
        deliverySlot: order.delivery_slot,
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        discountAmount: order.discount_amount,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        mpesaReceipt: order.mpesa_receipt,
        orderStatus: order.order_status,
        specialInstructions: order.special_instructions,
        createdAt: order.created_at,
        items: items.map((i) => ({
          ...i,
          extras: (() => {
            try {
              return JSON.parse(i.extras_json || '[]');
            } catch {
              return [];
            }
          })(),
        })),
      },
    });
  } catch (err) {
    console.error('[Cake Order] Error tracking order:', err);
    return res.status(500).json({ success: false, error: 'Could not load order tracking data.' });
  }
});

/**
 * POST /api/cake-orders/quote
 * Submit bespoke cake quotation request
 */
router.post('/quote', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      occasion,
      guestCount = '',
      tierStructure = '1 Tier',
      flavorPreferences = '',
      budgetRange = '',
      eventDate,
      deliveryLocation = '',
      referenceImage = '',
      notes = '',
    } = req.body;

    if (!customerName || !phone || !eventDate || !occasion) {
      return res.status(400).json({
        success: false,
        error: 'Missing required quote details (Name, Phone, Occasion, Event Date).',
      });
    }

    const quoteRef = generateQuoteRef();

    await db.query(
      `INSERT INTO cake_quotations (
        quote_ref, customer_name, phone, email, occasion, guest_count,
        tier_structure, flavor_preferences, budget_range, event_date,
        delivery_location, reference_image, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        quoteRef,
        customerName.trim(),
        phone.trim(),
        (email || '').trim().toLowerCase(),
        occasion,
        guestCount,
        tierStructure,
        flavorPreferences,
        budgetRange,
        eventDate,
        deliveryLocation.trim(),
        referenceImage || '',
        notes.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      quoteRef,
      message: 'Quotation request submitted! Our master decorator Carol Jenny will review and provide a detailed quote.',
    });
  } catch (err) {
    console.error('[Cake Order] Error submitting quotation:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit quotation request.' });
  }
});

/**
 * GET /api/cake-orders/admin/orders
 * Admin list of all cake orders
 */
router.get('/admin/orders', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM cake_orders ORDER BY created_at DESC';
    const params = [];

    if (status && status !== 'all') {
      sql = 'SELECT * FROM cake_orders WHERE order_status = ? ORDER BY created_at DESC';
      params.push(status);
    }

    const [orders] = await db.query(sql, params);
    const [allItems] = await db.query('SELECT * FROM cake_order_items');

    const ordersWithItems = orders.map((o) => {
      const items = allItems.filter((i) => i.order_ref === o.order_ref);
      return {
        ...o,
        items: items.map((i) => ({
          ...i,
          extras: (() => {
            try {
              return JSON.parse(i.extras_json || '[]');
            } catch {
              return [];
            }
          })(),
        })),
      };
    });

    return res.json({ success: true, orders: ordersWithItems });
  } catch (err) {
    console.error('[Cake Admin] Error fetching orders:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch admin orders.' });
  }
});

/**
 * PATCH /api/cake-orders/admin/orders/:orderRef/status
 * Admin update order status
 */
router.patch('/admin/orders/:orderRef/status', async (req, res) => {
  try {
    const { orderRef } = req.params;
    const { orderStatus, paymentStatus, mpesaReceipt } = req.body;

    const updates = [];
    const params = [];

    if (orderStatus) {
      updates.push('order_status = ?');
      params.push(orderStatus);
    }
    if (paymentStatus) {
      updates.push('payment_status = ?');
      params.push(paymentStatus);
    }
    if (mpesaReceipt) {
      updates.push('mpesa_receipt = ?');
      params.push(mpesaReceipt);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    updates.push("updated_at = NOW()");
    params.push(orderRef);

    await db.query(`UPDATE cake_orders SET ${updates.join(', ')} WHERE order_ref = ?`, params);

    return res.json({ success: true, message: `Order ${orderRef} updated.` });
  } catch (err) {
    console.error('[Cake Admin] Error updating order status:', err);
    return res.status(500).json({ success: false, error: 'Could not update order status.' });
  }
});

/**
 * GET /api/cake-orders/admin/quotes
 * Admin list of bespoke quotes
 */
router.get('/admin/quotes', async (req, res) => {
  try {
    const [quotes] = await db.query('SELECT * FROM cake_quotations ORDER BY created_at DESC');
    return res.json({ success: true, quotes });
  } catch (err) {
    console.error('[Cake Admin] Error fetching quotes:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch quotes.' });
  }
});

/**
 * PATCH /api/cake-orders/admin/quotes/:quoteRef
 * Admin update quote status or quoted amount
 */
router.patch('/admin/quotes/:quoteRef', async (req, res) => {
  try {
    const { quoteRef } = req.params;
    const { status, quotedAmount } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (quotedAmount !== undefined) {
      updates.push('quoted_amount = ?');
      params.push(Number(quotedAmount));
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    updates.push("updated_at = NOW()");
    params.push(quoteRef);

    await db.query(`UPDATE cake_quotations SET ${updates.join(', ')} WHERE quote_ref = ?`, params);

    return res.json({ success: true, message: `Quote ${quoteRef} updated.` });
  } catch (err) {
    console.error('[Cake Admin] Error updating quote:', err);
    return res.status(500).json({ success: false, error: 'Could not update quote.' });
  }
});

module.exports = router;
