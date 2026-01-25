"use client";

import { Search } from "../icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center h-10 w-full max-w-md mx-4"
    >
      <input
        type="text"
        placeholder="Search streams, users, categories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-muted border border-border px-4 py-2 text-sm rounded-l-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground transition-all"
      />
      <button
        type="submit"
        className="bg-muted hover:bg-muted/80 text-foreground px-4 h-full rounded-r-lg border border-l-0 border-border transition-colors"
      >
        <Search />
      </button>
    </form>
  );
}
