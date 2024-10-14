import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  initialQuery?: string;
}

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="fixed top-0 left-14 right-0 bg-background z-10 shadow-md flex justify-center">
      <div className="container mx-auto p-4 flex justify-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
          <Input
            type="text"
            placeholder="Search for products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      </div>
    </div>
  );
}