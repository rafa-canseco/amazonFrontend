import { Product } from "../types/types";
import { ProductCard } from "./ProductCard";
import { SearchPagination } from "./SearchPagination";

interface SearchResultsProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onProductClick: (asin: string) => void;
}

export function SearchResults({
  products,
  currentPage,
  totalPages,
  onPageChange,
  onProductClick,
}: SearchResultsProps) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <ProductCard key={`${product.asin}-${index}`} product={product} onClick={onProductClick} />
        ))}
      </div>
      <SearchPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}