"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Network, Wifi } from "lucide-react";
import { getChainName, getSupportedChainIds } from "@/utils/chains";

// Define supported chain IDs
type SupportedChainId = 1 | 137 | 534351 | 5115 | 61 | 2001 | 8453 | 56;

// Chain colors for visual distinction
const CHAIN_COLORS: Record<SupportedChainId, string> = {
  1: "bg-blue-500",
  137: "bg-violet-500",
  534351: "bg-orange-500",
  5115: "bg-yellow-300", 
  61: "bg-green-500",
  2001: "bg-purple-500",
  8453: "bg-blue-500",
  56: "bg-yellow-500",
};

// Chain icons
const CHAIN_ICONS: Record<SupportedChainId, string> = {
  1: "🟦",
  137: "🟣",
  534351: "🟠",
  5115: "🟡",
  61: "🟢",
  2001: "🟤",
  8453: "🔵",
  56: "🟨",
};

interface ChainDropdownProps {
  selectedChainId: SupportedChainId | "all";
  onChainSelect: (chainId: SupportedChainId | "all") => void;
  currentChainId?: number;
  availableChains: SupportedChainId[];
  className?: string;
}

export function ChainDropdown({ 
  selectedChainId, 
  onChainSelect, 
  currentChainId,
  availableChains,
  className = ""
}: ChainDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDisplayText = () => {
    if (selectedChainId === "all") {
      return "All Networks";
    }
    return getChainName(selectedChainId as SupportedChainId);
  };

  const getDisplayIcon = () => {
    if (selectedChainId === "all") {
      return <Network className='h-4 w-4 text-muted-foreground' />;
    }
    return <span className='text-lg'>{CHAIN_ICONS[selectedChainId as SupportedChainId]}</span>;
  };

  const handleSelect = (chainId: SupportedChainId | "all") => {
    onChainSelect(chainId);
    setIsOpen(false);
  };

  const isConnectedToChain = (chainId: SupportedChainId) => {
    return currentChainId === chainId;
  };

  // Sort chains: connected first, then others
  const getSortedChains = () => {
    if (!currentChainId) return availableChains;
    
    return availableChains.sort((a, b) => {
      const aConnected = a === currentChainId;
      const bConnected = b === currentChainId;
      if (aConnected && !bConnected) return -1;
      if (!aConnected && bConnected) return 1;
      return 0;
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sm:w-[240px] h-11 px-4 bg-background border border-border/60 rounded-lg hover:border-primary/60 focus:border-primary/60 transition-colors"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2">
          {getDisplayIcon()}
          <span className="font-medium text-foreground">{getDisplayText()}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 py-2 bg-background/95 backdrop-blur-sm border border-border/60 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto w-[240px]"
          >
            {/* All Networks Option */}
            <motion.button
              onClick={() => handleSelect("all")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
              whileHover={{ x: 2 }}
            >
              <div className="flex items-center gap-3">
                <div className='w-6 h-6 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center'>
                  <Network className='h-3 w-3 text-primary' />
                </div>
                <span className="font-medium text-foreground">All Networks</span>
              </div>
              {selectedChainId === "all" && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </motion.button>

            {/* Connected Network Section */}
            {currentChainId && availableChains.includes(currentChainId as SupportedChainId) && (
              <>
                <div className="px-4 py-2 border-t border-border/40 mt-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Connected Network
                  </p>
                </div>
                <motion.button
                  onClick={() => handleSelect(currentChainId as SupportedChainId)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className='text-lg'>{CHAIN_ICONS[currentChainId as SupportedChainId]}</span>
                      <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background'>
                        <Wifi className='h-2 w-2 text-white absolute top-0.5 left-0.5' />
                      </div>
                    </div>
                    <span className="font-medium text-foreground">
                      {getChainName(currentChainId as SupportedChainId)}
                    </span>
                  </div>
                  {selectedChainId === currentChainId && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </motion.button>
              </>
            )}

            {/* Other Networks Section */}
            <div className="px-4 py-2 border-t border-border/40 mt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {currentChainId && availableChains.includes(currentChainId as SupportedChainId) ? 'Other Networks' : 'Available Networks'}
              </p>
            </div>

            {/* Other Chain Options */}
            {getSortedChains()
              .filter(chainId => chainId !== currentChainId)
              .map((chainId) => (
                  <motion.button
                    key={chainId}
                  onClick={() => handleSelect(chainId)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
                  whileHover={{ x: 2 }}
                  >
                  <div className="flex items-center gap-3">
                    <span className='text-lg'>{CHAIN_ICONS[chainId]}</span>
                    <span className="font-medium text-foreground">
                      {getChainName(chainId)}
                      </span>
                    </div>
                  {selectedChainId === chainId && (
                    <Check className="w-4 h-4 text-primary" />
                    )}
                  </motion.button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 