import fs from "node:fs";
import path from "node:path";

const HERO_DIR = path.join(process.cwd(), "public", "hero");
const IMAGE_EXT = /\.(avif|webp|jpe?g|png)$/i;

// Every image in public/hero, sorted by file name (name them 1-…, 2-… to set the order).
// Falls back to the given image when the folder is empty or missing.
export function getHeroImages(fallback) {
    try {
        const files = fs.readdirSync(HERO_DIR).filter((file) => IMAGE_EXT.test(file)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (files.length) return files.map((file) => `/hero/${encodeURIComponent(file)}`);
    } catch {
        // No public/hero folder: use the fallback.
    }
    return fallback ? [fallback] : [];
}
