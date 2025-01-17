import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        level1: "border-transparent bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
        level2: "border-transparent bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
        level3: "border-transparent bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
        level4: "border-transparent bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
        level5: "border-transparent bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
        level6: "border-transparent bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
        dimension: "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        performance: "border-transparent bg-pink-100 text-pink-900 dark:bg-pink-800 dark:text-pink-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }