'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { SubscriptionCard } from '@/components/Common/SubscriptionCard'
import type { Subscription } from '@/types'

interface SortableSubscriptionCardProps {
  subscription: Subscription
  onEdit: (sub: Subscription) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function SortableSubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  onToggle,
}: SortableSubscriptionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: subscription.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  // Merge attributes and listeners into a single object for the drag handle
  const sortableProps = { ...attributes, ...listeners }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
    >
      <SubscriptionCard
        subscription={subscription}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        isDragging={isDragging}
        dragHandleProps={{ sortableProps }}
      />
    </motion.div>
  )
}
