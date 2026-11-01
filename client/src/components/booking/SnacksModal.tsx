import React, { useState } from 'react';
import { Plus, Minus, Popcorn, Coffee, UtensilsCrossed, Sparkles, X, ArrowRight } from 'lucide-react';

export interface SnackItem {
  id: string;
  name: string;
  category: 'Popcorn' | 'Combos' | 'Beverages' | 'Bites';
  price: number;
  description: string;
  imageUrl: string;
  badge?: string;
}

const SNACK_CATALOG: SnackItem[] = [
  {
    id: 'snack-1',
    name: 'Jumbo Butter Popcorn (Salted)',
    category: 'Popcorn',
    price: 290,
    description: 'Freshly popped golden corn tossed in rich melted European butter.',
    imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?q=80&w=600&auto=format&fit=crop',
    badge: 'Bestseller',
  },
  {
    id: 'snack-2',
    name: 'Gourmet Caramel Crunch Popcorn',
    category: 'Popcorn',
    price: 320,
    description: 'Crispy artisanal caramel glaze infused with Madagascar vanilla.',
    imageUrl: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'snack-3',
    name: 'Blockbuster Duo Combo',
    category: 'Combos',
    price: 690,
    description: '1 Jumbo Butter Popcorn + 2 Cold Beverages (Pepsi/Coke) + Cheesy Nachos.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
    badge: 'Save ₹120',
  },
  {
    id: 'snack-4',
    name: 'Mexican Cheesy Nachos & Salsa',
    category: 'Bites',
    price: 260,
    description: 'Crisp corn tortilla chips served with warm melted cheddar dip & spicy salsa.',
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'snack-5',
    name: 'Chilled Pepsi Zero / Classic 500ml',
    category: 'Beverages',
    price: 160,
    description: 'Ice-cold fountain soda poured fresh with lemon twist.',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop',
  },
];

interface SnacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (selectedSnacks: { item: SnackItem; quantity: number }[]) => void;
  ticketSubtotal: number;
}

export const SnacksModal: React.FC<SnacksModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  ticketSubtotal,
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const handleUpdateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const selectedSnacksList = Object.entries(quantities)
    .map(([id, qty]) => {
      const item = SNACK_CATALOG.find((s) => s.id === id);
      return item ? { item, quantity: qty } : null;
    })
    .filter(Boolean) as { item: SnackItem; quantity: number }[];

  const snacksSubtotal = selectedSnacksList.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0
  );

  const grandTotal = ticketSubtotal + snacksSubtotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0F121C] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Gourmet Cinema Dining</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white font-display">
              Add Movie Snacks & Beverages
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Delivered hot and fresh directly to your seat before showtime.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snack List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {SNACK_CATALOG.map((snack) => {
            const qty = quantities[snack.id] || 0;
            return (
              <div
                key={snack.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={snack.imageUrl}
                    alt={snack.name}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{snack.name}</h4>
                      {snack.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                          {snack.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs mt-0.5">{snack.description}</p>
                    <span className="text-sm font-extrabold text-amber-400 mt-1 inline-block">
                      ₹{snack.price}
                    </span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => handleUpdateQty(snack.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono text-white">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(snack.id, 1)}
                        className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 flex items-center justify-center text-black font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUpdateQty(snack.id, 1)}
                      className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-xs font-bold text-slate-200 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with totals & proceed button */}
        <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Payable</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">₹{grandTotal}</span>
              {snacksSubtotal > 0 && (
                <span className="text-xs text-amber-400">
                  (Includes ₹{snacksSubtotal} snacks)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onProceed([])}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Skip Snacks
            </button>

            <button
              onClick={() => onProceed(selectedSnacksList)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-black text-sm tracking-wide shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>PROCEED TO PAYMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
