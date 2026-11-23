<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Vary: Origin');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOriginPattern = '#^https?://(www\.)?(lanycakes\.co\.ke|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$#i';
if ($origin !== '' && preg_match($allowedOriginPattern, $origin)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    header('Access-Control-Allow-Origin: https://lanycakes.co.ke');
}
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$route = isset($_GET['route']) ? trim($_GET['route'], '/') : '';
if ($route === '') {
    $uriPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $route = preg_replace('#^/api/?#', '', trim($uriPath, '/'));
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

function getClientIp() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return trim($_SERVER['HTTP_CF_CONNECTING_IP']);
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function enforceRateLimit($dataDir, $bucket, $maxRequests, $windowSeconds) {
    $rlDir = $dataDir . '/ratelimit';
    if (!is_dir($rlDir)) {
        @mkdir($rlDir, 0755, true);
    }
    $ipHash = sha1(getClientIp() . '|' . $bucket);
    $rlFile = $rlDir . '/' . $ipHash . '.json';
    $now = time();
    $cutoff = $now - $windowSeconds;

    $fp = @fopen($rlFile, 'c+');
    if (!$fp) return;
    if (@flock($fp, LOCK_EX)) {
        $raw = stream_get_contents($fp);
        $timestamps = json_decode($raw ?: '[]', true);
        if (!is_array($timestamps)) $timestamps = [];
        $timestamps = array_values(array_filter($timestamps, function($ts) use ($cutoff) {
            return is_int($ts) && $ts >= $cutoff;
        }));

        if (count($timestamps) >= $maxRequests) {
            $retryAfter = max(1, ($timestamps[0] + $windowSeconds) - $now);
            @flock($fp, LOCK_UN);
            @fclose($fp);
            header("Retry-After: {$retryAfter}");
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'Too many requests. Please wait a moment before trying again.',
                'retryAfter' => $retryAfter,
            ]);
            exit;
        }

        $timestamps[] = $now;
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($timestamps));
        fflush($fp);
        @flock($fp, LOCK_UN);
    }
    @fclose($fp);
}

$isWriteRoute = in_array($route, ['cake-orders/create', 'cake-orders/quote', 'upload-reference'], true) && $_SERVER['REQUEST_METHOD'] === 'POST';
if ($isWriteRoute) {
    enforceRateLimit($dataDir, 'write', 15, 600); // 15 write requests per 10 mins per IP
} else {
    enforceRateLimit($dataDir, 'read', 60, 60); // 60 read requests per minute per IP
}

$ordersFile = $dataDir . '/cake_orders.json';

function readOrders($file) {
    if (!file_exists($file)) return [];
    $raw = @file_get_contents($file);
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function writeOrders($file, $orders) {
    @file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function getJsonBody() {
    $raw = file_get_contents('php://input', false, null, 0, 131072);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function computeSubtotal($items) {
    $sum = 0;
    if (!is_array($items)) return 0;
    foreach ($items as $item) {
        $qty = max(1, intval($item['quantity'] ?? 1));
        $unit = floatval($item['basePrice'] ?? ($item['price'] ?? 0));
        $sum += ($unit * $qty);
    }
    return $sum;
}

function sendBakeryNotificationEmail($subject, $bodyText) {
    $to = 'hello@lanycakes.co.ke';
    $headers = implode("\r\n", [
        'From: Lany Cake Shop <orders@lanycakes.co.ke>',
        'Reply-To: hello@lanycakes.co.ke',
        'Cc: inquiries@lanycakes.co.ke',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion()
    ]);
    return @mail($to, $subject, $bodyText, $headers);
}

if ($route === 'cake-orders/calculate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $subtotal = computeSubtotal($body['items'] ?? []);
    echo json_encode([
        'success' => true,
        'totals' => [
            'subtotal' => $subtotal,
            'deliveryFee' => 0,
            'finalTotal' => $subtotal,
        ]
    ]);
    exit;
}

if ($route === 'cake-orders/create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $customerName = trim($body['customerName'] ?? '');
    $phone = trim($body['phone'] ?? '');
    if ($customerName === '' || $phone === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Customer name and phone number are required.']);
        exit;
    }

    $subtotal = computeSubtotal($body['items'] ?? []);
    $orderRef = 'LNY-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $order = [
        'orderRef' => $orderRef,
        'customerName' => $customerName,
        'phone' => $phone,
        'email' => trim($body['email'] ?? ''),
        'deliveryType' => $body['deliveryType'] ?? 'delivery',
        'deliveryAddress' => trim($body['deliveryAddress'] ?? ''),
        'deliveryZone' => $body['deliveryZone'] ?? '',
        'deliveryDate' => $body['deliveryDate'] ?? '',
        'deliverySlot' => $body['deliverySlot'] ?? '',
        'specialInstructions' => trim($body['specialInstructions'] ?? ''),
        'paymentMethod' => $body['paymentMethod'] ?? 'Follow-up Payment',
        'paymentStatus' => 'pending_followup',
        'orderStatus' => 'received',
        'items' => $body['items'] ?? [],
        'totals' => [
            'subtotal' => $subtotal,
            'deliveryFee' => 0,
            'finalTotal' => $subtotal,
        ],
        'createdAt' => gmdate('c'),
    ];

    $orders = readOrders($ordersFile);
    array_unshift($orders, $order);
    writeOrders($ordersFile, $orders);

    // Secretly email bakery team on every new order
    $lines = [
        "NEW CAKE ORDER: {$orderRef}",
        "==========================================",
        "Customer: {$customerName}",
        "Phone: {$phone}",
        "Fulfillment: " . ($order['deliveryType'] === 'pickup' ? 'Studio Pickup (Kamakis Eastern Bypass)' : 'Doorstep Delivery'),
        "Address: " . ($order['deliveryAddress'] !== '' ? $order['deliveryAddress'] : 'N/A'),
        "Date & Slot: {$order['deliveryDate']} ({$order['deliverySlot']})",
        "",
        "ITEMS:"
    ];
    foreach ($order['items'] as $idx => $item) {
        $num = $idx + 1;
        $iName = $item['name'] ?? 'Cake';
        $iWeight = $item['weight'] ?? '';
        $iFlavor = $item['flavor'] ?? '';
        $iQty = $item['quantity'] ?? 1;
        $iPrice = $item['basePrice'] ?? ($item['price'] ?? 0);
        $iInsc = !empty($item['inscription']) ? " | Writing: \"{$item['inscription']}\"" : '';
        $lines[] = "  {$num}. {$iName} ({$iWeight}, {$iFlavor}) x{$iQty} - KSh {$iPrice}{$iInsc}";
    }
    $lines[] = "";
    $lines[] = "Subtotal: KSh " . number_format($subtotal);
    if ($order['specialInstructions'] !== '') {
        $lines[] = "Notes: {$order['specialInstructions']}";
    }
    $lines[] = "Submitted At: {$order['createdAt']}";
    sendBakeryNotificationEmail("New Cake Order {$orderRef} - {$customerName}", implode("\n", $lines));

    echo json_encode([
        'success' => true,
        'orderRef' => $orderRef,
        'totals' => $order['totals'],
        'order' => $order,
    ]);
    exit;
}

if (preg_match('#^cake-orders/track/([A-Za-z0-9_-]+)$#', $route, $m)) {
    $ref = strtoupper($m[1]);
    $orders = readOrders($ordersFile);
    foreach ($orders as $order) {
        if (strtoupper($order['orderRef'] ?? '') === $ref) {
            echo json_encode(['success' => true, 'order' => $order]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Order not found.']);
    exit;
}

if ($route === 'cake-orders/list' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $orders = readOrders($ordersFile);
    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
}

if ($route === 'cake-orders/quote' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $customerName = trim($body['customerName'] ?? 'Custom Cake Inquirer');
    $phone = trim($body['phone'] ?? '');
    $quoteRef = 'LNY-Q-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));

    $quote = [
        'quoteRef' => $quoteRef,
        'customerName' => $customerName,
        'phone' => $phone,
        'occasion' => trim($body['occasion'] ?? ''),
        'guestCount' => trim($body['guestCount'] ?? ''),
        'flavorPreferences' => trim($body['flavorPreferences'] ?? ''),
        'eventDate' => trim($body['eventDate'] ?? ''),
        'deliveryLocation' => trim($body['deliveryLocation'] ?? ''),
        'referenceImage' => trim($body['referenceImage'] ?? ''),
        'notes' => trim($body['notes'] ?? ''),
        'createdAt' => gmdate('c'),
    ];

    $quotesFile = $dataDir . '/cake_quotes.json';
    $quotes = readOrders($quotesFile);
    array_unshift($quotes, $quote);
    writeOrders($quotesFile, $quotes);

    $qLines = [
        "NEW CUSTOM CAKE INQUIRY: {$quoteRef}",
        "==========================================",
        "Customer: {$customerName}",
        "Phone / WhatsApp: {$phone}",
        "Celebration Style: {$quote['occasion']}",
        "Size / Portions: {$quote['guestCount']}",
        "Flavors: {$quote['flavorPreferences']}",
        "Target Date: {$quote['eventDate']}",
        "Delivery / Pickup: {$quote['deliveryLocation']}",
        "Notes: {$quote['notes']}",
    ];
    if ($quote['referenceImage'] !== '' && strpos($quote['referenceImage'], 'data:') !== 0) {
        $qLines[] = "Reference Photo: {$quote['referenceImage']}";
    }
    $qLines[] = "Submitted At: {$quote['createdAt']}";
    sendBakeryNotificationEmail("New Custom Cake Inquiry {$quoteRef} - {$customerName}", implode("\n", $qLines));

    echo json_encode([
        'success' => true,
        'quoteRef' => $quoteRef,
    ]);
    exit;
}

if ($route === 'journal' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $journalFile = $dataDir . '/journal_posts.json';
    $posts = readOrders($journalFile);
    $published = array_values(array_filter($posts, function($p) {
        return ($p['status'] ?? 'published') !== 'draft';
    }));
    echo json_encode(['success' => true, 'posts' => $published]);
    exit;
}

if ($route === 'journal/admin/all' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $journalFile = $dataDir . '/journal_posts.json';
    $posts = readOrders($journalFile);
    echo json_encode(['success' => true, 'posts' => $posts]);
    exit;
}

if ($route === 'journal/upsert' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = getJsonBody();
    $journalFile = $dataDir . '/journal_posts.json';
    $posts = readOrders($journalFile);
    $postId = trim($body['id'] ?? ($body['slug'] ?? ('post-' . bin2hex(random_bytes(4)))));
    $body['id'] = $postId;
    $updated = false;
    foreach ($posts as $idx => $p) {
        if (($p['id'] ?? '') === $postId || ($p['slug'] ?? '') === ($body['slug'] ?? '__none__')) {
            $posts[$idx] = array_merge($p, $body);
            $updated = true;
            break;
        }
    }
    if (!$updated) {
        array_unshift($posts, $body);
    }
    writeOrders($journalFile, $posts);
    echo json_encode(['success' => true, 'post' => $body]);
    exit;
}

if (preg_match('#^journal/([A-Za-z0-9_-]+)$#', $route, $m) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $target = $m[1];
    $journalFile = $dataDir . '/journal_posts.json';
    $posts = readOrders($journalFile);
    $posts = array_values(array_filter($posts, function($p) use ($target) {
        return ($p['id'] ?? '') !== $target && ($p['slug'] ?? '') !== $target;
    }));
    writeOrders($journalFile, $posts);
    echo json_encode(['success' => true]);
    exit;
}

if ($route === 'upload-reference' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once __DIR__ . '/cleanup_uploads.php';
    $uploadDir = dirname(__DIR__) . '/uploads/custom-designs';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    // Automatically purge any uploaded reference photos older than 7 days
    cleanupExpiredUploads($uploadDir, 7 * 86400);

    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $maxBytes = 10 * 1024 * 1024;

    if (!empty($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES['photo']['tmp_name'];
        $size = intval($_FILES['photo']['size']);
        if ($size > $maxBytes) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Image exceeds 10MB limit.']);
            exit;
        }
        $ext = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExts, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Unsupported image type. Use JPG, PNG, or WEBP.']);
            exit;
        }
        $imgInfo = @getimagesize($tmpName);
        if ($imgInfo === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Uploaded file is not a valid image.']);
            exit;
        }
        $filename = gmdate('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;
        if (!@move_uploaded_file($tmpName, $dest)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save uploaded photo.']);
            exit;
        }
        echo json_encode([
            'success' => true,
            'url' => '/uploads/custom-designs/' . $filename,
            'expiresInDays' => 7,
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No photo file received.']);
    exit;
}

http_response_code(404);
echo json_encode(['success' => false, 'error' => 'Endpoint not found.']);
