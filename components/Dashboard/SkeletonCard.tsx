import { motion } from 'framer-motion'

interface SkeletonCardProps {
  delay?: number
}

export function SkeletonCard({ delay = 0 }: SkeletonCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      style={{
        border: '1px solid var(--anime-card-border)',
        background: 'var(--anime-card)',
        borderTop: '3px solid var(--anime-card-border)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="skeleton-shimmer h-3.5 w-24 rounded-full" />
          <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
        </div>

        {/* Amount */}
        <div className="skeleton-shimmer h-8 w-32 rounded-md" />

        {/* Description */}
        <div className="skeleton-shimmer mt-2 h-3 w-20 rounded-full" />
      </div>
    </motion.div>
  )
}
