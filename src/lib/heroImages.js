import fs from "node:fs";
import path from "node:path";

const HERO_DIR = path.join(process.cwd(), "public", "hero");
const IMAGE_EXT = /\.(avif|webp|jpe?g|png)$/i;

// Reads all hero images from public/hero sorted by file name (e.g. 1-hero.webp, 2-hero.webp).
export function getHeroImages(fallback = "/hero/1-hero.webp") {
    try {
        const files = fs
            .readdirSync(HERO_DIR)
            .filter((file) => IMAGE_EXT.test(file))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (files.length > 0) {
            return files.map((file) => `/hero/${encodeURIComponent(file)}`);
        }
    } catch {
        // Fallback when public/hero cannot be read
    }
    return fallback ? [fallback] : [];
}

