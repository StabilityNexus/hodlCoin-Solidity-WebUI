import { useState, useEffect, useMemo } from 'react';
import { TokenSchema } from './useTokenList';

function createSearchIndexes(tokens: TokenSchema[]) {
  const indexes = {
    bySymbol: new Map<string, TokenSchema>(),
    bySymbolPrefix: new Map<string, Set<TokenSchema>>(),
    byNamePrefix: new Map<string, Set<TokenSchema>>(),
    byAddress: new Map<string, TokenSchema>(),
  };

  tokens.forEach(token => {
    const symbol = token.symbol.toLowerCase();
    const name = token.name.toLowerCase();
    const address = token.contract_address.toLowerCase();

    // Exact symbol match index
    indexes.bySymbol.set(symbol, token);

    // Symbol prefix index
    for (let i = 1; i <= symbol.length; i++) {
      const prefix = symbol.slice(0, i);
      if (!indexes.bySymbolPrefix.has(prefix)) {
        indexes.bySymbolPrefix.set(prefix, new Set());
      }
      indexes.bySymbolPrefix.get(prefix)!.add(token);
    }

    // Name prefix index
    for (let i = 1; i <= name.length; i++) {
      const prefix = name.slice(0, i);
      if (!indexes.byNamePrefix.has(prefix)) {
        indexes.byNamePrefix.set(prefix, new Set());
      }
      indexes.byNamePrefix.get(prefix)!.add(token);
    }

    // Address index
    indexes.byAddress.set(address, token);
  });

  return indexes;
}

export function useTokenSearch(tokens: TokenSchema[], pageSize: number = 50) {

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // For debouncing search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset pagination when query changes
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Create search indexes
  const indexes = useMemo(() => createSearchIndexes(tokens), [tokens]);

  const filteredTokens = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return tokens; // no pagination when empty query
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    const results = new Set<TokenSchema>();

    // Check exact symbol match
    const exactSymbol = indexes.bySymbol.get(lowerQuery);
    if (exactSymbol) {
      results.add(exactSymbol);
    }

    // Check symbol prefix matches
    const symbolPrefixMatches = indexes.bySymbolPrefix.get(lowerQuery);
    if (symbolPrefixMatches) {
      symbolPrefixMatches.forEach(token => results.add(token));
    }

    // Check name prefix matches
    const namePrefixMatches = indexes.byNamePrefix.get(lowerQuery);
    if (namePrefixMatches) {
      namePrefixMatches.forEach(token => results.add(token));
    }

    // Check address matches
    if (lowerQuery.length >= 2) { // Only search addresses for queries >= 2 chars
      for (const [address, token] of indexes.byAddress.entries()) {
        if (address.includes(lowerQuery)) {
          results.add(token);
        }
      }
    }

    return Array.from(results).slice(0, page * pageSize);
  }, [tokens, debouncedQuery, indexes, page, pageSize]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasMore = debouncedQuery.trim() ? filteredTokens.length === page * pageSize : false;

  return {
    tokens: filteredTokens,
    query,
    setQuery,
    loadMore,
    hasMore,
  };
}
