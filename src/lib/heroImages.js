import fs from "node:fs";
import path from "node:path";

const HERO_DIR = path.join(process.cwd(), "public", "hero");
const SIZED_FILE = /^(.+)-(\d+)\.(avif|webp|jpe?g|png)$/i;

// Groups public/hero/<variant>/<slide>-<width>.webp files into one responsive source per slide.

function listSlides(variant) {
    let files = [];
    try {
        files = fs.readdirSync(path.join(HERO_DIR, variant));
    } catch {
        return [];
    }

    const slides = new Map();
    for (const file of files) {
        const match = file.match(SIZED_FILE);
        if (!match) continue;
        const [, name, width] = match;
        if (!slides.has(name)) slides.set(name, []);
        slides.get(name).push({ url: `/hero/${variant}/${encodeURIComponent(file)}`, width: Number(width) });
    }

    return [...slides.entries()]
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([, sizes]) => {
            sizes.sort((a, b) => a.width - b.width);
            return {
                src: sizes.at(-1).url,
                srcSet: sizes.map(({ url, width }) => `${url} ${width}w`).join(", "),
            };
        });
}

// Pairs desktop slide N with mobile slide N, starting from a random slide like the website.

export function getHeroImages() {
    const desktop = listSlides("desktop");
    const mobile = listSlides("mobile");
    const count = Math.max(desktop.length, mobile.length);
    if (count === 0) return [];

    const pick = (list, fallback, i) => (list.length ? list : fallback)[i % (list.length || fallback.length)];
    const slides = Array.from({ length: count }, (_, i) => ({
        desktop: pick(desktop, mobile, i),
        mobile: pick(mobile, desktop, i),
    }));
    const start = Math.floor(Math.random() * count);
    return [...slides.slice(start), ...slides.slice(0, start)];
}
