import { motion, AnimatePresence } from "framer-motion";
import type { ItemDto } from "../types/item";
import { InventoryCard } from "./InventoryCard";
import { InventoryLoadingState } from "./InventoryLoadingState";
import { InventoryEmptyState } from "./InventoryEmptyState";
import { InventoryErrorState } from "./InventoryErrorState";

const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

interface InventoryGridProps {
  items: ItemDto[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  onRetry: () => void;
  onViewDetail: (id: string) => void;
  canViewFinancials: boolean;
}

export function InventoryGrid({
  items,
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  onRetry,
  onViewDetail,
  canViewFinancials,
}: InventoryGridProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading && <InventoryLoadingState key="loading" />}

      {!isLoading && isError && (
        <InventoryErrorState
          key="error"
          message={errorMessage}
          onRetry={onRetry}
        />
      )}

      {!isLoading && !isError && isEmpty && (
        <InventoryEmptyState key="empty" />
      )}

      {!isLoading && !isError && !isEmpty && items && (
        <motion.div
          key="grid"
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onViewDetail={onViewDetail}
              canViewFinancials={canViewFinancials}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
