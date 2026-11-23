<?php
/**
 * Deletes uploaded custom-design reference photos older than 7 days (604800s).
 * Can be run via cPanel Cron:
 *   0 3 * * * /usr/local/bin/php /home/muthiiassociates/lanycakes.co.ke/api/cleanup_uploads.php
 * Also included and triggered automatically by public/api/index.php on uploads.
 */

function cleanupExpiredUploads($uploadDir, $maxAgeSeconds = 604800) {
    if (!is_dir($uploadDir)) {
        return 0;
    }
    $deleted = 0;
    $cutoff = time() - $maxAgeSeconds;
    $files = @scandir($uploadDir);
    if (!is_array($files)) {
        return 0;
    }
    foreach ($files as $file) {
        if ($file === '.' || $file === '..' || $file === '.htaccess') {
            continue;
        }
        $path = $uploadDir . '/' . $file;
        if (is_file($path)) {
            $mtime = @filemtime($path);
            if ($mtime !== false && $mtime < $cutoff) {
                if (@unlink($path)) {
                    $deleted++;
                }
            }
        }
    }
    return $deleted;
}

if (php_sapi_name() === 'cli' || (isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__)) {
    $targetDir = dirname(__DIR__) . '/uploads/custom-designs';
    $removed = cleanupExpiredUploads($targetDir, 7 * 86400);
    echo json_encode([
        'success' => true,
        'deleted' => $removed,
        'directory' => $targetDir,
        'retentionDays' => 7,
    ]) . PHP_EOL;
}
