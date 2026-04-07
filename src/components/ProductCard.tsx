"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { ExternalLink, Download, Globe, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

export function ProductCard({ product }: { product: Product }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, layout: { duration: 0.3, ease: "easeInOut" } }}
      className="glass-panel p-6 rounded-2xl flex flex-col h-full group"
      style={{ borderRadius: "1rem" }}
    >
      <motion.div layout="position" className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-secondary flex items-center justify-center overflow-hidden relative shadow-sm border border-border">
          {product.logo ? (
            <img 
              src={product.logo} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold opacity-50">${getInitials(product.name)}</span>`;
              }}
            />
          ) : (
            <span className="text-xl font-bold text-muted-foreground">{getInitials(product.name)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground truncate" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
              {product.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${product.type === 'App' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'}`}>
              {product.type}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div layout="position" className="flex-grow mb-6 flex flex-col items-start gap-2">
        <motion.p 
          layout="position"
          className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-3' : ''}`}
        >
          {product.description}
        </motion.p>
        
        {product.description && product.description.length > 90 && (
          <motion.button 
            layout="position"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-medium text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors mt-1"
          >
            {isExpanded ? "Show less" : "Read more"}
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </motion.button>
        )}
      </motion.div>

      <motion.div layout="position" className="mt-auto space-y-4">
        {/* Creator Info */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-muted-foreground">
              By <span className="font-medium text-foreground">{product.creatorName}</span>
            </span>
            {product.creatorThreads && (
              <a 
                href={product.creatorThreads} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Creator's Threads Profile"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>
          {product.creatorThreads && (
            <div className="flex justify-end pr-1">
              <span className="text-[10px] text-muted-foreground/60">
                Visit the creator’s Threads for more info
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {product.websiteUrl && (
            <a 
              href={product.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              <Globe className="w-4 h-4" /> Visit
            </a>
          )}
          {product.androidUrl && (
            <a 
              href={product.androidUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors border"
            >
              <Download className="w-4 h-4" /> Android
            </a>
          )}
          {product.iosUrl && (
            <a 
              href={product.iosUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors border"
            >
              <Download className="w-4 h-4" /> iOS
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
