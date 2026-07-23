"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

export function Button({
  children,
  tone = "primary",
  size = "md",
  icon,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      className={`btn btn-${tone} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info" | "purple";
  dot?: boolean;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <i aria-hidden />}
      {children}
    </span>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="panel-header">
          <div>
            {title && <h3>{title}</h3>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  onBack,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="page-intro">
      <div className="page-title-row">
        {onBack && (
          <button className="back-button" onClick={onBack} aria-label="返回">
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search-field">
      <Search size={16} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button onClick={() => onChange("")} aria-label="清空搜索" type="button">
          <X size={14} />
        </button>
      )}
    </label>
  );
}

export function SelectField({
  value,
  onChange,
  children,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  label?: string;
}) {
  return (
    <label className="select-field">
      {label && <span>{label}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  footer,
  size = "md",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭弹窗">
            <X size={20} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

export function Drawer({
  title,
  subtitle,
  children,
  onClose,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  return (
    <div className="overlay drawer-overlay" role="presentation" onMouseDown={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭抽屉">
            <X size={20} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </aside>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Search size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  tone = "neutral",
  icon,
  onClick,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  icon: ReactNode;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`metric-card metric-${tone}`} onClick={onClick}>
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
      {onClick && <ArrowUpRight className="metric-arrow" size={16} />}
    </Tag>
  );
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: Array<{ id: string; label: string; count?: number }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          className={value === item.id ? "active" : ""}
          onClick={() => onChange(item.id)}
          role="tab"
          aria-selected={value === item.id}
        >
          {item.label}
          {item.count !== undefined && <span>{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function CopyButton({ text, onCopied }: { text: string; onCopied: () => void }) {
  return (
    <button
      className="copy-button"
      onClick={async () => {
        await navigator.clipboard?.writeText(text);
        onCopied();
      }}
      aria-label="复制内容"
    >
      <Copy size={14} />
    </button>
  );
}

export function ProgressRing({
  value,
  label,
  size = 112,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const style = {
    "--score": `${value * 3.6}deg`,
    "--ring-size": `${size}px`,
  } as React.CSSProperties;
  return (
    <div className="progress-ring" style={style}>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export function InlineNotice({
  title,
  description,
  tone = "info",
}: {
  title: string;
  description: string;
  tone?: "info" | "warning" | "danger" | "success";
}) {
  const icon =
    tone === "success" ? (
      <Check size={18} />
    ) : tone === "info" ? (
      <CircleHelp size={18} />
    ) : (
      <AlertTriangle size={18} />
    );
  return (
    <div className={`inline-notice notice-${tone}`}>
      {icon}
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function TableLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="table-link" onClick={onClick}>
      {children}
      <ChevronRight size={14} />
    </button>
  );
}

export function LoadingButton({
  loading,
  children,
  onClick,
}: {
  loading: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      icon={loading ? <LoaderCircle className="spin" size={16} /> : undefined}
    >
      {children}
    </Button>
  );
}
