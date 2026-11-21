"use client";

import { memo } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Button, CustomImage, QuantityInput } from "@/components/ui";
import { formatINR } from "@/lib/format";

// One cart line — same card as the website cart, with trade pricing.
function CartLineItem({ line, onQuantity, onRemove }) {
    const specs = [line.size && `Size: ${line.size}`, line.position].filter(Boolean).join(" | ");
    const lineTotal = line.price != null ? line.price * line.quantity : null;

    return (
        <div className="group relative flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-4 transition-all duration-300 hover:border-white/10 hover:bg-white/15">
            <div className="relative flex h-15 w-15 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black/40 md:h-20 md:w-20">
                <CustomImage
                    src={line.image}
                    alt={line.productName}
                    fill
                    sizes="80px"
                    imageClassName="object-contain transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="mb-0.5 flex items-center gap-1.5">
                            {line.brandName && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-orange-500 md:text-[9px]">
                                    {line.brandName}
                                </span>
                            )}
                            <span className="rounded border border-orange-500/30 bg-orange-500/20 px-1.5 text-[7px] font-black tracking-wider text-orange-400 md:text-[8px]">
                                TYRE
                            </span>
                        </div>
                        <h4 className="truncate text-[11px] font-bold tracking-tight text-white transition-colors group-hover:text-orange-400 md:text-sm">
                            {line.productName}
                        </h4>
                    </div>
                    <Button
                        variant="text"
                        size="xs"
                        iconOnly
                        onClick={() => onRemove(line.id)}
                        aria-label={`Remove ${line.productName} ${line.size}`}
                        icon={<FiTrash2 />}
                    />
                </div>

                {specs && (
                    <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-400 md:text-[9px]">{specs}</p>
                )}

                <div className="mt-1 flex items-center justify-between gap-2 md:mt-3">
                    <QuantityInput
                        variant="glass"
                        value={line.quantity}
                        onChange={(q) => onQuantity(line.id, q)}
                        label={`Quantity for ${line.productName} ${line.size}`}
                    />
                    <span className="shrink-0 text-xs font-black text-white md:text-sm">
                        {lineTotal != null ? formatINR(lineTotal) : <span className="text-[10px] font-semibold text-zinc-400">Price on approval</span>}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default memo(CartLineItem);
