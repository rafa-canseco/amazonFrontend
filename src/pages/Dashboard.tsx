import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchProducts } from "../utils/api";
import { Product, SearchResponse } from "../types/types";
import { SearchResults } from "../componentsUX/SearchResults";
import { Loader2 } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background"> 
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : searchResults.length > 0 ? (
          <SearchResults
            products={paginatedResults}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onProductClick={handleProductClick}
          />
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4">No se encontraron resultados.</p>
            <p className="text-md">Intenta buscar otro producto.</p>
          </div>
        )}
      </main>
    </div>
  );
}