"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FixedSizeList as List } from "react-window";
import {
  Search,
  X,
  AlertCircle,
  Loader2,
  ChevronDown,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TokenSchema, useTokenList } from "../hooks/useTokenList";
import { useTokenSearch } from "../hooks/useTokenSearch";


export interface TokenPickerProps {
  selected?: TokenSchema | null;
  onSelect: (token: TokenSchema) => void;
  placeholder?: string;
  maxResults?: number;
  className?: string;
  disabled?: boolean;
  chainId: number;
}


function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span
            key={index}
            className="bg-primary/10 text-primary rounded px-0.5 font-medium"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

const TokenItem = React.memo(function TokenItem({
  token,
  query,
  isSelected,
  onSelect,
}: {
  token: TokenSchema;
  query: string;
  isSelected: boolean;
  onSelect: (token: TokenSchema) => void;
}) {
  const handleClick = React.useCallback(() => {
    onSelect(token);
  }, [onSelect, token]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg",
        "hover:bg-blue-200 dark:hover:bg-gray-600 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
        "group relative overflow-hidden hover:scale-[1.005] active:scale-[0.995] transition-transform",
        isSelected && "bg-primary/5 dark:bg-gray-800 ring-1 ring-primary/20"
      )}
    >
      <Avatar className="w-10 h-10 ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-105">
        <AvatarImage
          src={token.image || "/placeholder.svg"}
          alt={`${token.name} icon`}
        />
        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
          {token.symbol.slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2 mb-1">
          <div className="max-w-[180px] min-w-0 truncate">
            <span className="font-medium block truncate">
              <HighlightMatch text={token.name} query={query} />
            </span>
          </div>
          <Badge
            variant="secondary"
            className="bg-muted/50 hover:bg-muted/50 text-xs font-medium flex-shrink-0"
          >
            <HighlightMatch text={token.symbol.toUpperCase()} query={query} />
          </Badge>
        </div>
        <div className="text-muted-foreground text-sm font-mono truncate opacity-80">
          {token.contract_address.slice(0, 8)}...
          {token.contract_address.slice(-6)}
        </div>
      </div>

      {isSelected && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary absolute right-4 opacity-80" />
      )}

      {isSelected && (
        <div
          className="absolute inset-0 bg-primary/5 pointer-events-none transition-opacity duration-200"
          style={{ opacity: isSelected ? 1 : 0 }}
        />
      )}
    </button>
  );
});

// After the TokenItem component and before TokenPicker
interface VirtualizedItemData {
  items: TokenSchema[];
  query: string;
  selectedAddress?: string;
  onSelect: (token: TokenSchema) => void;
}

interface VirtualizedItemProps {
  index: number;
  style: React.CSSProperties;
  data: VirtualizedItemData;
}

const VirtualizedTokenItem = React.memo(({ index, style, data }: VirtualizedItemProps) => {
  const token = data.items[index];
  return (
    <div style={style}>
      <TokenItem
        token={token}
        query={data.query}
        isSelected={data.selectedAddress === token.contract_address}
        onSelect={data.onSelect}
      />
    </div>
  );
});

VirtualizedTokenItem.displayName = 'VirtualizedTokenItem';

export function TokenPicker({
  selected,
  onSelect,
  placeholder = "Search tokens",
  chainId,
  className,
  disabled = false,
}: TokenPickerProps) {
  const [open, setOpen] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {
    tokens,
    loading: tokensLoading,
    error: tokensError,
  } = useTokenList(chainId);

  const {
    tokens: filteredTokens,
    query,
    setQuery,
  } = useTokenSearch(tokens);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open, setQuery]);

  const handleSelect = (token: TokenSchema) => {
    onSelect(token);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-12 px-4 w-full justify-between bg-background/50 hover:bg-background/80 backdrop-blur-sm",
            "border border-border/50 hover:border-border/80 transition-all duration-300",
            "shadow-sm hover:shadow-md hover:shadow-primary/5",
            className
          )}
        >
          {selected ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-6 h-6 ring-1 ring-border/50">
                <AvatarImage
                  src={selected.image || "/placeholder.svg"}
                  alt={`${selected.name} icon`}
                />
                <AvatarFallback className="text-xs font-medium bg-muted">
                  {selected.symbol.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="font-medium">{selected.symbol}</span>
                <span className="text-muted-foreground text-sm hidden sm:inline">
                  {selected.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Coins className="w-5 h-5" />
              <span>Select Token</span>
            </div>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 p-0 shadow-lg shadow-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Select Token
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-12 bg-muted/50 border-border/50 placeholder:text-muted-foreground 
                          focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/30"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 
                           text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          <div className="p-2">
            {tokensLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-muted-foreground text-sm">
                    Loading tokens...
                  </span>
                </div>
              </div>
            ) : tokensError ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <AlertCircle className="w-8 h-8" />
                  {tokensError.includes("manually input") ? (
                    <>
                      <span className="text-sm font-medium">
                        Testnet:{" "}
                        {"Citrea's Testnet"} (
                        {chainId})
                      </span>
                      <span className="text-xs text-center max-w-[280px]">
                        Token Selection is not supported in testnets.
                      </span>
                      <span className="text-xs text-center max-w-[280px]">
                        {tokensError}
                      </span>
                    </>
                  ) : tokensError.includes("not supported") ? (
                    <>
                      <span className="text-sm font-medium">
                        Chain Not Supported
                      </span>
                      <span className="text-xs text-center">{tokensError}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">Failed to load tokens</span>
                      <span className="text-xs text-muted-foreground">
                        {tokensError}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Search className="w-8 h-8 opacity-50" />
                  <span className="text-sm">No tokens found</span>
                  {query && (
                    <span className="text-xs">Try a different search term</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-80">
                <List
                  height={320}
                  width="100%"
                  itemCount={filteredTokens.length}
                  itemSize={76} // Height of each TokenItem
                  itemData={{
                    items: filteredTokens,
                    query,
                    selectedAddress: selected?.contract_address,
                    onSelect: handleSelect,
                  }}
                >
{VirtualizedTokenItem}
                </List>
              </div>
            )}
          </div>

          {/* Results count for screen readers */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {filteredTokens.length} tokens found
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default TokenPicker;
