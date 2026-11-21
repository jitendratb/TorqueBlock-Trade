"use client";

import { memo } from "react";
import Link from "next/link";
import clsx from "clsx";
import { BsLightningChargeFill } from "react-icons/bs";
import { FiLock, FiShoppingCart } from "react-icons/fi";
import { Badge, Button, QuantityInput, ShareButtons } from "@/components/ui";
import { tyreHref } from "@/lib/catalog.utils";
import { toLine, useOrderListStore } from "@/store/orderStore";
import { useUiStore } from "@/store/uiStore";
import StockBadge from "./StockBadge";
import TradePrice from "./TradePrice";

export const STOCK_GRID =
    "md:grid-cols-[minmax(7.5rem,1.4fr)_0.8fr_1.1fr_1fr_210px] lg:grid-cols-[minmax(9.5rem,1.3fr)_0.7fr_1fr_1.1fr_190px] xl:grid-cols-[minmax(8rem,1.4fr)_0.8fr_1.1fr_1.1fr_260px]";

const MOBILE_BUTTON = "!min-h-11 !rounded-xl !text-sm whitespace-nowrap";

function SizeLabel({ href, children }) {
    const className = "truncate text-[15px] lg:text-base font-bold leading-none text-white";
    return href ? (
        <Link href={href} className={clsx(className, "transition-colors hover:text-orange-400")}>
            {children}
        </Link>
    ) : (
        <p className={className}>{children}</p>
    );
}

function FitmentBadge({ position }) {
    return (
        <Badge tone="zinc" bordered className="h-6 shrink-0 !py-0 text-[10px] uppercase tracking-wider">
            {position || "Front / Rear"}
        </Badge>
    );
}

function LoginForPrice({ onClick, children }) {
    return (
        <Button
            variant="link"
            size="sm"
            uppercase={false}
            onClick={onClick}
            title="Login to unlock trade wholesale prices"
            icon={<FiLock />}
            className="whitespace-nowrap"
        >
            {children}
        </Button>
    );
}

// Table cell (md+): stacked price, centred.
function PriceCell({ size, tradePrice, isApproved, onLoginClick }) {
    if (!isApproved) {
        return (
            <LoginForPrice onClick={onLoginClick}>
                <span className="hidden xl:inline">Login for trade price</span>
                <span className="xl:hidden">Login for price</span>
            </LoginForPrice>
        );
    }
    return <TradePrice price={tradePrice ?? size.tradePrice} />;
}

// Mobile: one framed strip, same shape before and after login.
function PriceStrip({ size, tradePrice, isApproved, onLoginClick }) {
    const price = tradePrice ?? size.tradePrice;
    const showsPrice = isApproved && Boolean(price);

    return (
        <div
            className={clsx(
                "flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3.5 py-2",
                showsPrice ? "border-orange-500/25 bg-orange-500/[0.07]" : "border-white/[0.06] bg-white/[0.03]"
            )}
        >
            <span className={clsx("text-[10px] font-bold uppercase tracking-[0.14em]", showsPrice ? "text-orange-400" : "text-zinc-500")}>
                Trade price
            </span>
            {isApproved ? (
                <TradePrice price={price} layout="inline" />
            ) : (
                <LoginForPrice onClick={onLoginClick}>Login to view</LoginForPrice>
            )}
        </div>
    );
}

function StockRow({ product, size, isApproved, tradePrice }) {
    const add = useOrderListStore((s) => s.add);
    const setQuantity = useOrderListStore((s) => s.setQuantity);
    const remove = useOrderListStore((s) => s.remove);
    const cartQty = useOrderListStore((s) => s.items.find((i) => i.id === size.id)?.quantity || 0);
    const notify = useUiStore((s) => s.notify);
    const openLogin = useUiStore((s) => s.openLogin);
    const setOrderListOpen = useUiStore((s) => s.setOrderListOpen);

    const href = tyreHref(product, size);
    const unavailable = size.availability === "out_of_stock" || !(tradePrice ?? size.tradePrice);
    const max = size.availability === "in_stock" && size.stock ? size.stock : 999;
    const inCart = cartQty > 0;
    const shareTitle = `${product.name} ${size.size}`;

    const removeLine = () => {
        remove(size.id);
        notify("info", `Removed ${product.name} (${size.size}) from cart.`);
    };

    const handleAddToCart = () => {
        add(toLine(product, size, 1));
        notify("success", `Added 1 × ${product.name} (${size.size}) to cart.`);
    };

    const orderNow = () => {
        if (!inCart) add(toLine(product, size, 1));
        setOrderListOpen(true);
    };

    const quantity = (className) => (
        <QuantityInput
            variant="orange"
            value={cartQty}
            min={1}
            max={max}
            disabled={unavailable}
            onChange={(q) => setQuantity(size.id, q)}
            onRemove={removeLine}
            label={`Quantity for ${shareTitle}`}
            className={className}
        />
    );

    const copyLink = href && <ShareButtons path={href} title={shareTitle} size="xs" iconOnly copyOnly />;

    return (
        <div className={clsx("py-4 md:py-3.5 transition-colors", unavailable && "opacity-50")}>
            {/* Mobile (< md) */}
            <div className="flex flex-col gap-3 md:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 [&>:first-child]:shrink-0 [&>:first-child]:overflow-visible">
                        <SizeLabel href={href}>{size.size}</SizeLabel>
                        <FitmentBadge position={size.position} />
                        {copyLink && <span className="hidden min-[360px]:inline-flex">{copyLink}</span>}
                    </div>
                    <StockBadge size={size} badgeSize="md" />
                </div>

                <PriceStrip size={size} tradePrice={tradePrice} isApproved={isApproved} onLoginClick={openLogin} />

                <div className="grid grid-cols-2 gap-2.5">
                    {!inCart ? (
                        <Button
                            variant="outline"
                            size="md"
                            uppercase={false}
                            full
                            disabled={unavailable}
                            onClick={handleAddToCart}
                            icon={<FiShoppingCart className="text-base" />}
                            className={MOBILE_BUTTON}
                        >
                            Add to Cart
                        </Button>
                    ) : (
                        quantity("!h-11 w-full justify-between [&>input]:flex-1 [&>button]:w-11")
                    )}
                    <Button
                        variant="primary"
                        size="md"
                        uppercase={false}
                        full
                        disabled={unavailable}
                        onClick={orderNow}
                        className={MOBILE_BUTTON}
                    >
                        Order Now
                    </Button>
                </div>
            </div>

            {/* Tablet & desktop (md+) */}
            <div className={clsx("hidden md:grid items-center gap-4", STOCK_GRID)}>
                <div className="flex min-w-0 items-center justify-center gap-2">
                    <SizeLabel href={href}>{size.size}</SizeLabel>
                    {copyLink}
                </div>
                <div className="justify-self-center">
                    <FitmentBadge position={size.position} />
                </div>
                <div className="justify-self-center">
                    <StockBadge size={size} badgeSize="md" />
                </div>
                <div className="justify-self-center">
                    <PriceCell size={size} tradePrice={tradePrice} isApproved={isApproved} onLoginClick={openLogin} />
                </div>
                <div className="flex items-center justify-center gap-2">
                    {!inCart ? (
                        <Button
                            variant="outline"
                            size="md"
                            uppercase={false}
                            disabled={unavailable}
                            onClick={handleAddToCart}
                            icon={<FiShoppingCart />}
                            className="whitespace-nowrap"
                        >
                            <span className="xl:hidden">Add</span>
                            <span className="hidden xl:inline">Add to Cart</span>
                        </Button>
                    ) : (
                        quantity()
                    )}
                    <Button variant="primary" size="md" uppercase={false} disabled={unavailable} onClick={orderNow} className="min-w-[4.5rem]">
                        Order
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default memo(StockRow);
