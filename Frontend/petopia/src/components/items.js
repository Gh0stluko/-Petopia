import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';
import Link from 'next/link';

export function NewProducts({ products, handlewishlist, isHeartClicked, title, isLoading = false }) {
  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * (discount / 100));
  };

  const formatPrice = (price) => {
    return Math.floor(price).toLocaleString('uk-UA');
  };

  return (
    <section className="">
      <div className="container mx-auto px-4 mb-6 ">
        <h2 className="text-2xl font-semibold mb-3">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Render skeletons when loading
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="group relative">
                <CardContent className="p-3">
                  <div className="aspect-square mb-3 bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Render actual products when not loading
            products.slice(0, 12).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((product) => (
              <Card key={product.id} className="group relative">
                <CardContent className="p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-5 top-5 z-10"
                    aria-label="Add to wishlist"
                    onClick={() => handlewishlist(product.id)}
                  >
                    <Heart
                      className={`w-5 h-5 ${isHeartClicked[product.id] ? 'text-yellow-500' : 'text-muted-foreground'}`}
                    />
                  </Button>
                  <div className="aspect-square mb-3">
                    <img
                      src={product.images[0].image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-md"
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
                            <p className="text-sm text-muted-foreground line-through">
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
                        <p className="font-bold text-primary">
                          {formatPrice(product.price)} ₴
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

