import { useEffect, useRef } from 'react'

export const useMatrixEffect = (opacity = 0.3, symbolCount = 3) => {
  const matrixRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const matrixContainer = matrixRef.current
    if (!matrixContainer) return

    const symbols = ['BTC', 'ETH', 'ADA', 'ERG']
    const columns = Math.floor(window.innerWidth / 40) // Increased spacing for fewer symbols
    
    // Create matrix columns
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div')
      column.className = 'matrix-column'
      column.style.cssText = `
        position: absolute;
        left: ${i * 40}px;
        top: 0;
        width: 40px;
        height: 100%;
        overflow: hidden;
      `
      
      // Create symbols in each column (reduced count)
      const randomSymbolCount = Math.floor(Math.random() * symbolCount) + 2
      for (let j = 0; j < randomSymbolCount; j++) {
        const symbol = document.createElement('div')
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
        symbol.textContent = randomSymbol
        symbol.className = 'matrix-symbol'
        symbol.style.cssText = `
          position: absolute;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          font-size: ${Math.random() * 6 + 12}px;
          color: rgba(147, 51, 234, ${Math.random() * 0.6 + 0.3});
          text-shadow: 0 0 10px rgba(147, 51, 234, 0.5);
          animation: matrixFall ${Math.random() * 4 + 3}s linear infinite;
          animation-delay: ${Math.random() * 3}s;
          top: ${Math.random() * 100}%;
          left: 50%;
          transform: translateX(-50%);
        `
        column.appendChild(symbol)
      }
      
      matrixContainer.appendChild(column)
    }

    // Add CSS animation if not already added
    if (!document.getElementById('matrix-styles')) {
      const style = document.createElement('style')
      style.id = 'matrix-styles'
      style.textContent = `
        @keyframes matrixFall {
          0% {
            transform: translateX(-50%) translateY(100vh);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
        }
        
        .matrix-symbol:nth-child(odd) {
          color: rgba(168, 85, 247, 0.7);
          text-shadow: 0 0 12px rgba(168, 85, 247, 0.5);
        }
        
        .matrix-symbol:nth-child(even) {
          color: rgba(147, 51, 234, 0.8);
          text-shadow: 0 0 10px rgba(147, 51, 234, 0.6);
        }
      `
      document.head.appendChild(style)
    }

    return () => {
      if (matrixContainer) {
        matrixContainer.innerHTML = ''
      }
    }
  }, [symbolCount])

  return matrixRef
} 