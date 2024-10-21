import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProductDetails, useAddToCart, useVariantPrice } from "../hooks";
import { useUser } from "../contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import {
  ProductVariant,
  ProductVariantDimension,
  CartItem,
} from "../types/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import { SearchBar } from "../componentsUX/SearchBar";

export default function ProductDetailPage() {
  const { asin } = useParams<{ asin: string }>();
  const { userData } = useUser();
  const {
    data: productResponse,
    isLoading,
    error,
  } = useProductDetails(asin || "");
  const addToCartMutation = useAddToCart();
  const [activeImage, setActiveImage] = useState(0);
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [dimensions, setDimensions] = useState<{
    [key: string]: string[];
  }>({});
  const [selectedDimensions, setSelectedDimensions] = useState<{
    [key: string]: string;
  }>({});

  const { data: variantPrice, isLoading: isPriceLoading } = useVariantPrice(
    selectedVariant?.asin || "",
  );

  useEffect(() => {
    if (productResponse?.product) {
      const variants = productResponse.product.variants;
      if (variants && variants.length > 0) {
        setSelectedVariant(variants[0]);

        const dimensionsMap: { [key: string]: Set<string> } = {};
        variants.forEach((variant: ProductVariant) => {
          variant.dimensions.forEach((dimension: ProductVariantDimension) => {
            if (!dimensionsMap[dimension.name]) {
              dimensionsMap[dimension.name] = new Set();
            }
            dimensionsMap[dimension.name].add(dimension.value);
          });
        });

        const formattedDimensions: { [key: string]: string[] } = {};
        Object.entries(dimensionsMap).forEach(([key, valueSet]) => {
          formattedDimensions[key] = Array.from(valueSet);
        });

        setDimensions(formattedDimensions);

        const initialSelectedDimensions: { [key: string]: string } = {};
        Object.entries(formattedDimensions).forEach(([key, values]) => {
          initialSelectedDimensions[key] = values[0];
        });
        setSelectedDimensions(initialSelectedDimensions);
      }
    }
  }, [productResponse]);

  const handleDimensionChange = (dimensionName: string, value: string) => {
    const newSelectedDimensions = {
      ...selectedDimensions,
      [dimensionName]: value,
    };
    setSelectedDimensions(newSelectedDimensions);

    const newVariant = productResponse?.product?.variants?.find(
      (variant: ProductVariant) =>
        variant.dimensions.every(
          (dim: ProductVariantDimension) =>
            newSelectedDimensions[dim.name] === dim.value,
        ),
    );

    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };

  const handleAddToCart = async () => {
    if (!productResponse?.product || !userData) {
      console.log("Product or user data is missing");
      return;
    }

    const cartItem: CartItem = {
      asin: productResponse.product.asin,
      title: productResponse.product.title,
      price: variantPrice || productResponse.product.price?.value || 0,
      quantity: 1,
      image_url: productResponse.product.images?.[0] || "",
      product_link: selectedVariant?.link || productResponse.product.link,
      variant_asin: selectedVariant ? selectedVariant.asin : undefined,
      variant_dimensions: selectedVariant
        ? selectedVariant.dimensions.reduce(
            (acc, dim) => {
              acc[dim.name] = dim.value;
              return acc;
            },
            {} as { [key: string]: string },
          )
        : undefined,
    };

    addToCartMutation.mutate(
      { userId: userData.privy_id, item: cartItem },
      {
        onSuccess: () => {
          toast({
            title: "Added to Cart",
            description: `${cartItem.title} has been added to your cart.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add item to cart. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!productResponse?.product) return <div>No product found</div>;

  const product = productResponse.product;

  return (
    <div className="sm:ml-14 pt-20">
      <div className="container mx-auto p-4">
        <Navbar />
        <SearchBar />
        <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {product.images && product.images.length > 0 && (
              <div className="mb-4">
                <img
                  src={product.images[activeImage]}
                  alt={`${product.title} - Main`}
                  className="w-full h-auto rounded-lg shadow-lg mx-auto"
                />
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent className="-ml-2">
                  {product.images.map((image, index) => (
                    <CarouselItem key={index} className="pl-2 basis-1/3">
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-2">
                            <img
                              src={image}
                              alt={`${product.title} - ${index + 1}`}
                              className={cn(
                                "h-full w-full object-cover transition-all hover:scale-105 cursor-pointer",
                                activeImage === index
                                  ? "ring-2 ring-primary"
                                  : "",
                              )}
                              onClick={() => setActiveImage(index)}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}
          </div>
          <div>
            <p className="text-xl font-semibold mb-2">
              {isPriceLoading
                ? "Loading price..."
                : variantPrice
                  ? `$${variantPrice.toFixed(2)}`
                  : productResponse?.product?.price?.raw}
            </p>
            {product.rating && (
              <p className="mb-2">
                Rating: {product.rating}/5 ({product.ratings_total} reviews)
              </p>
            )}
            {product.brand && <p className="mb-2">Brand: {product.brand}</p>}
            {Object.entries(dimensions).map(([dimensionName, values]) => (
              <div key={dimensionName} className="mb-4">
                <Select
                  onValueChange={(value) =>
                    handleDimensionChange(dimensionName, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={`Select ${dimensionName}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {values.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {selectedVariant?.availability && (
              <p className="mb-2">
                Availability: {selectedVariant.availability.status}
              </p>
            )}
            {product.feature_bullets && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Features:</h2>
                <ul className="list-disc pl-5">
                  {product.feature_bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.description && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Description:</h2>
                <p>{product.description}</p>
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                onClick={handleAddToCart}
                className="mt-4"
                disabled={addToCartMutation.isPending || !selectedVariant}
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  "Add to Cart"
                )}
              </Button>
              <Button asChild variant="outline" className="mt-4">
                <a
                  href={selectedVariant?.link || product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Amazon
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
