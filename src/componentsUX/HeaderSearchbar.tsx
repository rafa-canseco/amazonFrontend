import { SearchBar } from "./SearchBar";
import { useLocation } from "react-router-dom";

export function HeaderSearchbar() {
  const location = useLocation();

  return (
    <header className="fixed top-10 left-150  right-1 h-16 ">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <h1 className="text-2xl font-bold">From Blockchain to doorstep!</h1>
        <SearchBar
          initialQuery={new URLSearchParams(location.search).get("query") || ""}
        />
        <div>button</div> {/* Placeholder for future button */}
      </div>
    </header>
  );
}