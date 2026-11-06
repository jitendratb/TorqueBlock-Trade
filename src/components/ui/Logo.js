import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

// Brand mark from /public (same asset as the B2C store).
export default function Logo({ href = "/", name = "", className = "w-[100px] md:w-[130px]", priority = false }) {
    const img = (
        <Image src="/newlogo.webp" alt={name ? `${name} logo` : "Logo"} width={150} height={70} priority={priority} className={clsx("h-auto", className)} style={{ height: "auto" }} />
    );
    if (!href) return img;
    return (
        <Link href={href} className="inline-block flex-shrink-0" aria-label={name ? `${name} home` : "Home"}>
            {img}
        </Link>
    );
}
