import type { ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer: ReactNode
}) {
  if (!open) return null
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <h2>{title}</h2>
        {description && <p className="sub">{description}</p>}
        {children}
        <div className="modal-foot">{footer}</div>
      </div>
    </div>
  )
}
