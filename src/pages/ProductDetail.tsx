import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductDetails, useAddToCart } from '../hooks';
import { useUser } from '../contexts/UserContext';
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Navbar from './Navbar';
import { SearchBar } from '../componentsUX/SearchBar';

export default function ProductDetailPage() {
  const { asin } = useParams<{ asin: string }>();
  const { userData } = useUser();
  const { data: productResponse, isLoading, error } = useProductDetails(asin || '');
  const addToCartMutation = useAddToCart();
  const [activeImage, setActiveImage] = useState(0);
  const { toast } = useToast();


  const handleAddToCart = async () => {
    if (!productResponse?.product || !userData) {
      console.log('Product or user data is missing');
      return;
    }
  
    const cartItem = {
      asin: productResponse.product.asin,
      title: productResponse.product.title,
      price: productResponse.product.price?.value || 0,
      quantity: 1,
      image_url: productResponse.product.images?.[0] || '',
    };
  
    addToCartMutation.mutate(
      { userId: userData.privy_id, item: cartItem },
      {
        onSuccess: () => {
          toast({
            title: "Added to Cart",
            description: `${productResponse.product.title} has been added to your cart.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add item to cart. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!productResponse?.product) return <div>No product found</div>;

  const product = productResponse.product;

  return (
    <div className="sm:ml-14 pt-20"> 
      <div className="container mx-auto p-4">
      <Navbar/>
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
                                activeImage === index ? "ring-2 ring-primary" : ""
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
            <p className="text-xl font-semibold mb-2">{product.price?.raw}</p>
            {product.rating && (
              <p className="mb-2">Rating: {product.rating}/5 ({product.ratings_total} reviews)</p>
            )}
            {product.brand && <p className="mb-2">Brand: {product.brand}</p>}
            {product.availability && (
              <p className="mb-2">Availability: {product.availability.raw}</p>
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
                disabled={addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                className="mt-4"
              >
                <a href={product.link} target="_blank" rel="noopener noreferrer">
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