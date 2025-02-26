import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product, handlewishlist, isHeartClicked }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently unavailable",
        variant: "destructive"
      });
      return;
    }
    
    addToCart(product, (addedProduct, wasInCart) => {
      toast({
        title: wasInCart 
          ? `Quantity updated in your cart` 
          : `${addedProduct.name} added to your cart`,
        description: wasInCart 
          ? `Increased quantity in your cart` 
          : `The item has been added to your shopping cart`,
        status: "success"
      });
    });
  };
  
  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const formatPrice = (price) => {
    return Math.floor(price).toLocaleString("uk-UA");
  };

  return (
    <Card className="group relative">
      <CardContent className="p-3">
        <div className="absolute right-5 top-5 z-10 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add to wishlist"
            onClick={() => handlewishlist(product.id)}
          >
            <Heart
              className={`w-5 h-5 ${isHeartClicked[product.id] ? "text-yellow-500" : "text-muted-foreground"}`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
        
        {/* Stock Status Badge */}
        <div className="absolute left-5 top-5 z-10">
          {product.stock > 0 ? (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        <div className="aspect-square mb-3">
          <img
            src={product.images[0].image}
            alt={product.name}
            className={`w-full h-full object-cover rounded-md ${product.stock === 0 ? 'opacity-70' : ''}`}
          />
        </div>
        <div className="space-y-2">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-medium line-clamp-2 text-sm hover:underline">{product.name}</h3>
          </Link>
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <div className="relative">
                  <p className="text-sm text-muted-foreground line-through" style={{ textDecorationColor: 'red' }}>
                    {formatPrice(product.price)} ₴
                  </p>
                  {product.discount > 0 && (
                    <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded">
                      {product.discount}% off
                    </span>
                  )}
                </div>
                <p className="font-bold text-primary">
                  {formatPrice(calculateDiscountedPrice(product.price, product.discount))} ₴
                </p>
              </>
            ) : (
              <p className="font-bold text-primary">{formatPrice(product.price)} ₴</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
