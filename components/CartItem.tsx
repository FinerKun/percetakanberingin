import { Button } from "@/components/ui/button";
import { useShoppingCart } from "@/context/ShoppingCartContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { useFetchProducts } from "@/utils/api";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CartItemProps } from "@/lib/types";

export function CartItem({ id, quantity, label }: CartItemProps) {
  const products = useFetchProducts();
  const { removeFromCart } = useShoppingCart();
  const item = products.find((i) => i.id === id);
  if (item == null) return null;

  return (
    <div className="flex gap-4">
      <div className="relative aspect-square w-16 rounded-xl border-2">
        <Image
          src={item.img}
          alt={item.description}
          placeholder="empty"
          className="object-cover"
          fill
          sizes="fill"
        />
      </div>
      <div className="flex w-full items-center justify-between">
        <div>
          <h1>
            {item.name} {label !== "" ? `| Uk. ${label}` : null}
          </h1>
          <h3 className="font-semibold" style={{ fontSize: ".75rem" }}>
            {quantity} x {formatCurrency(item.price)}
          </h3>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => removeFromCart(item.id)}
        >
          <Trash2 size={20} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

export function TransactionsItem({ id, quantity, label }: CartItemProps) {
  const products = useFetchProducts();
  const item = products.find((i) => i.id === id);
  if (item == null) return null;

  return (
    <div className="flex gap-4">
      <div className="relative aspect-square w-16 rounded-xl border-2">
        <Image
          src={item.img}
          alt={item.description}
          placeholder="empty"
          className="object-cover"
          fill
          sizes="fill"
        />
      </div>
      <div className="flex w-full items-center justify-between">
        <div>
          <h1>
            {item.name} {label !== "" ? `| Uk. ${label}` : null}
          </h1>
          <h3 className="font-semibold" style={{ fontSize: ".75rem" }}>
            {quantity} x {formatCurrency(item.price)}
          </h3>
        </div>
      </div>
    </div>
  );
}
