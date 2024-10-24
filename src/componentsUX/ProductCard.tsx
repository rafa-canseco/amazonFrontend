import { Product } from "../types/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onClick: (asin: string) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="w-full hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick(product.asin)}
    >
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
        {product.brand && <CardDescription>Brand: {product.brand}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-32 h-32 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.jpg";
              }}
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
              No image
            </div>
          )}
        </div>
        <p className="font-semibold">{product.price.raw}</p>
        {product.rating !== undefined && (
          <p className="text-sm">
            Rating: {product.rating}/5
            {product.ratings_total !== undefined && ` (${product.ratings_total} reviews)`}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={(e) => { e.stopPropagation(); onClick(product.asin); }}>
          Ver Detalles
        </Button>
        <Button asChild variant="outline">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Ver en Amazon
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}