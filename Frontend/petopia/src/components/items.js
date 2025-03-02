import { ProductCard } from "@/components/ProductComponent";
import { Card, CardContent } from "@/components/ui/card";

export function NewProducts({ products, handlewishlist, isHeartClicked, title, isLoading = false, href = 'products' }) {
  return (
    <section className="">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl font-semibold mb-3">{title}</h2>
        <div className="text-right">
          <a href={`/${href}`} className="text-black hover:underline text-right">
            Переглянути всі товари ↓
            </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {isLoading ? (
            // Відображення заповнювачів під час завантаження
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
            // Відображення наявних товарів
            products
              .slice(0, 12)
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handlewishlist={handlewishlist}
                  isHeartClicked={isHeartClicked}
                />
              ))
          )}
        </div>
      </div>
    </section>
  );
}
