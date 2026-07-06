"use client"

import { cn } from "@workspace/ui/lib/utils"
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { type ComponentType, type ReactNode, useRef, useState } from "react"

export type FloatingDockItem = {
  title: string
  icon: ReactNode
  href: string
  isActive?: boolean
}

export type FloatingDockLinkProps = {
  href: string
  className?: string
  children: ReactNode
  "aria-label"?: string
}

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
  linkComponent: LinkComponent,
  menuIcon,
  showMobile = true,
}: {
  items: FloatingDockItem[]
  desktopClassName?: string
  mobileClassName?: string
  linkComponent?: ComponentType<FloatingDockLinkProps>
  menuIcon?: ReactNode
  showMobile?: boolean
}) {
  const LinkEl = LinkComponent ?? DefaultDockLink

  return (
    <>
      <FloatingDockDesktop
        items={items}
        className={desktopClassName}
        linkComponent={LinkEl}
      />
      {showMobile ? (
        <FloatingDockMobile
          items={items}
          className={mobileClassName}
          linkComponent={LinkEl}
          menuIcon={menuIcon}
        />
      ) : null}
    </>
  )
}

function DefaultDockLink({
  href,
  className,
  children,
  "aria-label": ariaLabel,
}: FloatingDockLinkProps) {
  return (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  )
}

function FloatingDockMobile({
  items,
  className,
  linkComponent: LinkComponent,
  menuIcon,
}: {
  items: FloatingDockItem[]
  className?: string
  linkComponent: ComponentType<FloatingDockLinkProps>
  menuIcon?: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open ? (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col items-end gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <LinkComponent href={item.href} aria-label={item.title}>
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-colors",
                      item.isActive
                        ? "border-[#4169E1]/20 bg-gradient-to-b from-[#4169E1] to-[#5B7FE8] text-white shadow-[#4169E1]/25"
                        : "border-[#E0E7FF]/90 bg-white/95 text-[#7B96ED]"
                    )}
                  >
                    <div className="flex size-5 items-center justify-center [&_svg]:size-5">
                      {item.icon}
                    </div>
                  </div>
                </LinkComponent>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E0E7FF]/90 bg-white/95 text-[#4169E1] shadow-sm"
      >
        {menuIcon ?? (
          <span className="flex flex-col gap-1">
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
            <span className="h-0.5 w-4 rounded-full bg-current" />
          </span>
        )}
      </button>
    </div>
  )
}

function FloatingDockDesktop({
  items,
  className,
  linkComponent: LinkComponent,
}: {
  items: FloatingDockItem[]
  className?: string
  linkComponent: ComponentType<FloatingDockLinkProps>
}) {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-3 rounded-2xl border border-[#E0E7FF]/90 bg-white/90 px-4 pb-3 opacity-45 shadow-[0_12px_40px_-16px_rgba(65,105,225,0.28)] backdrop-blur-xl transition-opacity duration-300 hover:opacity-100 md:flex",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer
          mouseX={mouseX}
          key={item.href}
          linkComponent={LinkComponent}
          {...item}
        />
      ))}
    </motion.div>
  )
}

function IconContainer({
  mouseX,
  title,
  icon,
  href,
  isActive = false,
  linkComponent: LinkComponent,
}: FloatingDockItem & {
  mouseX: MotionValue<number>
  linkComponent: ComponentType<FloatingDockLinkProps>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40])
  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  )
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20]
  )

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <LinkComponent href={href} aria-label={title}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full transition-colors",
          isActive
            ? "bg-gradient-to-b from-[#4169E1] to-[#5B7FE8] text-white shadow-[0_8px_20px_-8px_rgba(65,105,225,0.55)]"
            : "bg-[#F0F4FF] text-[#7B96ED] hover:bg-[#E8EEFF]"
        )}
      >
        <AnimatePresence>
          {hovered ? (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-[#E0E7FF] bg-white px-2 py-0.5 text-xs font-medium whitespace-pre text-[#3D5CC9] shadow-sm"
            >
              {title}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className={cn(
            "flex items-center justify-center [&_svg]:size-full",
            isActive ? "[&_svg]:text-white" : "[&_svg]:text-[#7B96ED]"
          )}
        >
          {icon}
        </motion.div>
      </motion.div>
    </LinkComponent>
  )
}
