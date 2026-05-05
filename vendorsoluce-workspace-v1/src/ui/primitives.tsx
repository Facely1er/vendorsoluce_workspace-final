import type { ReactNode } from 'react'

export function Card(props: { children: ReactNode; className?: string }) {
  return <section className={['ws-card', props.className].filter(Boolean).join(' ')}>{props.children}</section>
}

export function Button(props: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'default' | 'primary' | 'danger'
  disabled?: boolean
}) {
  const variant = props.variant ?? 'default'
  return (
    <button
      type={props.type ?? 'button'}
      className={['ws-btn', variant === 'default' ? '' : variant].filter(Boolean).join(' ')}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )
}

export function Badge(props: { children: ReactNode; tone?: 'low' | 'medium' | 'high' }) {
  const tone = props.tone ?? 'low'
  return <span className={['ws-badge', tone].join(' ')}>{props.children}</span>
}

export function Field(props: { label: string; children: ReactNode }) {
  return (
    <label className="ws-field">
      <span className="ws-label">{props.label}</span>
      {props.children}
    </label>
  )
}

