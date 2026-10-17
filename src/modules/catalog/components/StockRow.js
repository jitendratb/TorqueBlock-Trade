"use client";

import { memo, useState } from "react";
import { FiCheck, FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";
import { formatINR } from "@/lib/format";
import { useUiStore } from "@/store/ui.store";
import { useOrderListStore, toLine } from "@/modules/orders/orderList.store";
import { usePlaceOrder } from "@/modules/orders/hooks/usePlaceOrder";
import { useAuthStore } from "@/modules/auth/auth.store";
import { addToBackendCart } from "@/modules/orders/orders.api";

export const STOCK_GRID = "md:grid-cols-[1.2fr_0.7fr_0.9fr_1fr_1fr_240px]";

function StockBadge({ size }) {
    if (size.availability === "out_of_stock") return <Badge tone="red">Out of stock</Badge>;
    if (size.availability === "backorder") return <Badge tone="sky">Backorder</Badge>;
    if (size.stock == null) return <Badge tone="green">In stock</Badge>;
    return size.stock <= 5 ? <Badge tone="orange">Only {size.stock} left</Badge> : <Badge tone="green">{size.stock} in stock</Badge>;
}

function PriceCell({ size, dealerPrice, isDealer }) {
    const price = isDealer ? dealerPrice ?? size.price : size.price;
    const showMrp = size.mrp && price && size.mrp > price;
    return (
        <div>
            <p className="text-lg font-black text-white">{formatINR(price)}</p>
            <p className="text-[11px] text-zinc-500">
                {showMrp && (
                    <>
                        MRP <span className="line-through">{formatINR(size.mrp)}</span>{" "}
                    </>
                )}
                {!isDealer && <span className="text-orange-400/80">{showMrp ? "· " : ""}Dealer price after login</span>}
            </p>
        </div>
    );
}

function StockRow({ product, size, isDealer, dealerPrice }) {
    const add = useOrderListStore((s) => s.add);
    const setQuantity = useOrderListStore((s) => s.setQuantity);
    const remove = useOrderListStore((s) => s.remove);
    const cartItem = useOrderListStore((s) => s.items.find((i) => i.id === size.id));
    const notify = useUiStore((s) => s.notify);
    const { placeOrder } = usePlaceOrder();
    const token = useAuthStore((s) => s.token);
    const [state, setState] = useState("idle");

    const unavailable = size.availability === "out_of_stock" || !size.price;
    const max = size.availability === "in_stock" && size.stock ? size.stock : 999;
    const inCart = Boolean(cartItem);
    const cartQty = cartItem?.quantity || 0;

    const handleAddToCart = () => {
        const line = toLine(product, size, 1);
        add(line);
        notify("success", `Added 1 × ${product.name} (${size.size}) to cart.`);

        if (token) {
            const unitPrice = isDealer ? (dealerPrice ?? size.price) : size.price;
            addToBackendCart({
                productId: size.id,
                productName: product.name,
                size: size.size,
                quantity: 1,
                unitPrice,
            }).catch(() => {});
        }
    };

    const handleIncrement = () => {
        if (cartQty >= max) return;
        const nextQty = cartQty + 1;
        setQuantity(size.id, nextQty);
        if (token) {
            const unitPrice = isDealer ? (dealerPrice ?? size.price) : size.price;
            addToBackendCart({
                productId: size.id,
                productName: product.name,
                size: size.size,
                quantity: nextQty,
                unitPrice,
            }).catch(() => {});
        }
    };

    const handleDecrement = () => {
        if (cartQty > 1) {
            const nextQty = cartQty - 1;
            setQuantity(size.id, nextQty);
        } else {
            remove(size.id);
            notify("info", `Removed ${product.name} (${size.size}) from cart.`);
        }
    };

    const handleDirectQtyChange = (val) => {
        if (!Number.isFinite(val) || val <= 0) {
            remove(size.id);
            notify("info", `Removed ${product.name} (${size.size}) from cart.`);
            return;
        }
        const clamped = Math.min(max, val);
        setQuantity(size.id, clamped);
    };

    const orderNow = () => {
        const orderQty = inCart ? cartQty : 1;
        if (!inCart) {
            const line = toLine(product, size, orderQty);
            add(line);
            if (token) {
                const unitPrice = isDealer ? (dealerPrice ?? size.price) : size.price;
                addToBackendCart({
                    productId: size.id,
                    productName: product.name,
                    size: size.size,
                    quantity: orderQty,
                    unitPrice,
                }).catch(() => {});
            }
        }
        useUiStore.getState().setOrderListOpen(true);
    };

    return (
        <div className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3 md:gap-4 ${STOCK_GRID} ${unavailable ? "opacity-50" : ""}`}>
            <div>
                <p className="whitespace-nowrap text-base font-black text-white">{size.size}</p>
                <p className="text-[11px] font-semibold text-zinc-400 md:hidden">{[size.position, size.spec].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="hidden text-sm font-semibold text-zinc-300 md:block">{size.position || "—"}</p>
            <p className="hidden text-sm font-semibold text-zinc-300 md:block">{size.spec || "—"}</p>
            <div className="justify-self-end md:justify-self-start">
                <StockBadge size={size} />
            </div>
            <PriceCell size={size} dealerPrice={dealerPrice} isDealer={isDealer} />
            <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
                {!inCart ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="min-w-[96px] gap-1.5 font-bold"
                        disabled={unavailable}
                        onClick={handleAddToCart}
                    >
                        <FiShoppingCart className="text-sm" /> Add
                    </Button>
                ) : (
                    <div className="inline-flex h-9 items-center rounded-lg border border-orange-500/40 bg-orange-500/10 shadow-sm">
                        <button
                            type="button"
                            aria-label={cartQty === 1 ? "Remove from cart" : "Decrease quantity"}
                            disabled={unavailable}
                            onClick={handleDecrement}
                            className="flex h-full w-8 items-center justify-center text-orange-400 hover:bg-orange-500/20 hover:text-white rounded-l-lg transition-colors disabled:opacity-30"
                        >
                            {cartQty === 1 ? <FiTrash2 className="text-xs" /> : <FiMinus className="text-xs" />}
                        </button>
                        <input
                            type="number"
                            inputMode="numeric"
                            aria-label={`Quantity for ${product.name} ${size.size}`}
                            min={1}
                            max={max}
                            value={cartQty}
                            disabled={unavailable}
                            onChange={(e) => handleDirectQtyChange(parseInt(e.target.value, 10))}
                            className="no-spin h-full w-9 bg-transparent text-center text-sm font-black text-white outline-none"
                        />
                        <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={unavailable || cartQty >= max}
                            onClick={handleIncrement}
                            className="flex h-full w-8 items-center justify-center text-orange-400 hover:bg-orange-500/20 hover:text-white rounded-r-lg transition-colors disabled:opacity-30"
                        >
                            <FiPlus className="text-xs" />
                        </button>
                    </div>
                )}
                <Button
                    variant="primary"
                    size="sm"
                    className="min-w-[84px]"
                    disabled={unavailable}
                    onClick={orderNow}
                >
                    Order
                </Button>
            </div>
        </div>
    );
}

export default memo(StockRow);
