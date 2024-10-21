import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { searchProducts } from "../utils/api";
import { Product, SearchResponse } from "../types/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Navbar from "./Navbar";
import { SearchBar } from "../componentsUX/SearchBar";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 9;

export default function Dashboard() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("query");
    if (query) {
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: SearchResponse = await searchProducts(query);
      setSearchResults(response.products);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error searching products:", error);
      setError("Hubo un error al buscar los productos");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (asin: string) => {
    navigate(`/product/${asin}`);
  };

  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        items.push(
          <PaginationItem key={i}>
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }
    return items;
  };

  return (
    <div className="sm:ml-14 pt-20">
      {" "}
      <div className="container mx-auto p-4">
        <Navbar />
        <SearchBar
          initialQuery={new URLSearchParams(location.search).get("query") || ""}
        />
        <h1 className="text-2xl font-bold mb-4">Amazon Product Search</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isLoading ? (
          <p>Loading...</p>
        ) : paginatedResults.length > 0 ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedResults.map((product, index) => (
                <Card
                  key={`${product.asin}-${index}`}
                  className="w-full hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleProductClick(product.asin)}
                >
                  <CardHeader>
                    <CardTitle>{product.title}</CardTitle>
                    {product.brand && (
                      <CardDescription>Brand: {product.brand}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center mb-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-32 h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "path/to/placeholder-image.jpg";
                            console.error(
                              `Failed to load image for product ${product.asin}:`,
                              product.image,
                            );
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
                        {product.ratings_total !== undefined &&
                          ` (${product.ratings_total} reviews)`}
                      </p>
                    )}
                    {product.position && (
                      <p className="text-xs text-gray-500">
                        Position: {product.position}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.asin);
                      }}
                    >
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
              ))}
            </div>
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : (
          <p>No se encontraron resultados.</p>
        )}
      </div>
    </div>
  );
}
