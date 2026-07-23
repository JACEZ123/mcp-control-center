"use client";

import {
  Activity,
  Bell,
  BookOpen,
  Boxes,
  Bug,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  Command,
  FileCheck2,
  LayoutDashboard,
  Menu,
  PackageOpen,
  Plus,
  Search,
  ServerCog,
  Settings2,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  McpDetailPage,
  McpsPage,
  OverviewPage,
  ServiceDetailPage,
  ServicesPage,
} from "./modules-core";
import {
  AnalyticsPage,
  ErrorsPage,
  MaintenancePage,
  PublishPage,
} from "./modules-ops";
import {
  KnowledgePage,
  MarketPage,
  PermissionsPage,
} from "./modules-resources";
import { errorRecords, mcps, services, workspaces } from "./data";
import { Badge } from "./ui";
import { CatalogProvider } from "./store";
import type {
  NavigationIntent,
  PageKey,
  RoleId,
  ToastMessage,
  WorkspaceId,
} from "./types";

const navGroups = [
  {
    label: "工作台",
    items: [
      ["overview", "总览", LayoutDashboard],
      ["services", "Service 管理", Boxes],
      ["mcps", "MCP 列表", PackageOpen],
      ["analytics", "调用分析", ChartNoAxesCombined],
      ["errors", "错误中心", Bug],
    ],
  },
  {
    label: "治理与资源",
    items: [
      ["publish", "上架管理", FileCheck2],
      ["maintenance", "服务维护", ServerCog],
      ["market", "MCP 市场", Store],
      ["knowledge", "知识库", BookOpen],
      ["permissions", "权限管理", ShieldCheck],
    ],
  },
] as const;

const pageTitles: Record<PageKey, string> = {
  overview: "总览",
  services: "Service 管理",
  mcps: "MCP 列表",
  analytics: "调用分析",
  errors: "错误中心",
  publish: "上架管理",
  maintenance: "服务维护",
  market: "MCP 市场",
  knowledge: "知识库",
  permissions: "权限管理",
};

export default function ControlCenterShell() {
  return <CatalogProvider><ControlCenterApp /></CatalogProvider>;
}

function ControlCenterApp() {
  const [page, setPage] = useState<PageKey>("overview");
  const [workspaceId, setWorkspaceId] = useState<WorkspaceId>("prod");
  const [role, setRole] = useState<RoleId>("admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mcpId, setMcpId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<string | undefined>();
  const [listStatus, setListStatus] = useState<string | undefined>();
  const [listSort, setListSort] = useState<string | undefined>();
  const [analyticsDate, setAnalyticsDate] = useState<string | undefined>();

  const currentWorkspace = workspaces.find((item) => item.id === workspaceId)!;
  const notify = (title: string, detail?: string, tone: ToastMessage["tone"] = "success") => {
    const id = Date.now();
    setToasts((items) => [...items, { id, title, detail, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4200);
  };

  const navigate = (intent: NavigationIntent) => {
    setPage(intent.page);
    setSidebarOpen(false);
    setMcpId(intent.mcpId ?? null);
    setServiceId(intent.serviceId ?? null);
    setDetailTab(intent.detailTab);
    setListStatus(intent.status);
    setListSort(intent.sort);
    setAnalyticsDate(intent.date);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setHelpOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const content = (() => {
    if (mcpId) {
      return (
        <McpDetailPage
          mcpId={mcpId}
          initialTab={detailTab}
          role={role}
          navigate={navigate}
          onBack={() => navigate({ page: "mcps", status: listStatus, sort: listSort })}
          notify={notify}
        />
      );
    }
    if (serviceId) {
      return (
        <ServiceDetailPage
          serviceId={serviceId}
          workspaceId={workspaceId}
          navigate={navigate}
          onBack={() => navigate({ page: "services" })}
          notify={notify}
        />
      );
    }
    if (page === "overview") return <OverviewPage navigate={navigate} />;
    if (page === "services") return <ServicesPage workspaceId={workspaceId} setWorkspaceId={setWorkspaceId} navigate={navigate} notify={notify} />;
    if (page === "mcps") return <McpsPage workspaceId={workspaceId} setWorkspaceId={setWorkspaceId} initialStatus={listStatus} initialSort={listSort} navigate={navigate} />;
    if (page === "analytics") return <AnalyticsPage workspaceId={workspaceId} setWorkspaceId={setWorkspaceId} initialDate={analyticsDate} navigate={navigate} notify={notify} />;
    if (page === "errors") return <ErrorsPage workspaceId={workspaceId} setWorkspaceId={setWorkspaceId} navigate={navigate} notify={notify} />;
    if (page === "publish") return <PublishPage workspaceId={workspaceId} setWorkspaceId={setWorkspaceId} notify={notify} />;
    if (page === "maintenance") return <MaintenancePage workspaceId={workspaceId} setWorkspaceId={setWorkspaceId} notify={notify} />;
    if (page === "market") return <MarketPage workspaceId={workspaceId} setWorkspaceId={setWorkspaceId} notify={notify} />;
    if (page === "knowledge") return <KnowledgePage role={role} notify={notify} />;
    return <PermissionsPage notify={notify} />;
  })();

  return (
    <div className="app-shell">
      <div className="ambient-grid" aria-hidden />
      <div className="ambient-orbit" aria-hidden>
        <i /><i /><i /><b /><b /><b />
      </div>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span><Command size={21} /></span>
          <div><strong>MCP Control</strong><small>企业资产控制中心</small></div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="关闭导航"><X size={19} /></button>
        </div>
        <button className="workspace-switch" onClick={() => setWorkspaceMenuOpen((open) => !open)} aria-expanded={workspaceMenuOpen}>
          <i style={{ background: currentWorkspace.color }} />
          <div><strong>{currentWorkspace.name}</strong><small>{currentWorkspace.environment}</small></div>
          <ChevronDown size={15} />
        </button>
        {workspaceMenuOpen && (
          <div className="workspace-menu">
            <small>切换当前工作区</small>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={workspace.id === workspaceId ? "active" : ""}
                onClick={() => { setWorkspaceId(workspace.id); setWorkspaceMenuOpen(false); notify("工作区已切换", `当前正在查看${workspace.name}的数据。`); }}
              >
                <i style={{ background: workspace.color }} />
                <span><strong>{workspace.name}</strong><small>{workspace.environment}</small></span>
                {workspace.id === workspaceId && <Badge tone="success">当前</Badge>}
              </button>
            ))}
            <button className="workspace-menu-link" onClick={() => { setWorkspaceMenuOpen(false); navigate({ page: "maintenance" }); }}>进入服务维护 →</button>
          </div>
        )}
        <nav className="main-nav">
          {navGroups.map((group) => (
            <div key={group.label}>
              <span className="nav-label">{group.label}</span>
              {group.items.map(([id, label, Icon]) => (
                <button
                  key={id}
                  className={page === id && !mcpId && !serviceId ? "active" : ""}
                  onClick={() => navigate({ page: id as PageKey })}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {id === "errors" && <em>8</em>}
                  {id === "market" && <small>新</small>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-health">
          <div><span className="health-orb"><i /><i /></span><div><strong>平台运行正常</strong><small>12 个 Service 在线</small></div></div>
          <button onClick={() => navigate({ page: "maintenance" })}>查看状态</button>
        </div>
        <div className="user-card">
          <span className="avatar">AK</span>
          <div className="user-identity">
            <strong>Alex Kim</strong>
            <select
              className="role-inline-select"
              value={role}
              onChange={(event) => setRole(event.target.value as RoleId)}
              aria-label="切换演示角色"
            >
              <option value="admin">平台管理员</option>
              <option value="product">产品负责人</option>
              <option value="developer">开发负责人</option>
              <option value="ops">运维负责人</option>
              <option value="viewer">只读访客</option>
            </select>
          </div>
          <button onClick={() => navigate({ page: "permissions" })}><Settings2 size={16} /></button>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="关闭导航遮罩" />}
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="打开导航"><Menu size={20} /></button>
            <div className="breadcrumbs"><span>MCP 资产中心</span><i>/</i><strong>{mcpId ? "MCP 详情" : serviceId ? "Service 详情" : pageTitles[page]}</strong></div>
          </div>
          <div className="topbar-actions">
            <button className="command-trigger" onClick={() => setCommandOpen(true)}><Search size={15} /><span>搜索 MCP、Service、错误…</span><kbd>⌘ K</kbd></button>
            <button className="icon-button" onClick={() => setHelpOpen(true)} aria-label="帮助"><CircleHelp size={18} /></button>
            <button className="icon-button notification-button" onClick={() => navigate({ page: "errors" })} aria-label="通知"><Bell size={18} /><i /></button>
            <button className="quick-create" onClick={() => navigate({ page: "publish" })}><Plus size={16} /><span>上架 MCP</span></button>
          </div>
        </header>
        <main className="page-content">{content}</main>
      </div>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone ?? "success"}`}>
            <span>{toast.tone === "danger" ? <Bug size={18} /> : <CheckCircleIcon />}</span>
            <div><strong>{toast.title}</strong>{toast.detail && <p>{toast.detail}</p>}</div>
            <button onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}><X size={15} /></button>
          </div>
        ))}
      </div>
      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} navigate={(intent) => { setCommandOpen(false); navigate(intent); }} />}
      {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} navigate={navigate} />}
    </div>
  );
}

function CheckCircleIcon() {
  return <ShieldCheck size={18} />;
}

function CommandPalette({
  onClose,
  navigate,
}: {
  onClose: () => void;
  navigate: (intent: NavigationIntent) => void;
}) {
  const [query, setQuery] = useState("");
  const actions = [
    ["进入总览", "查看平台运行数据", { page: "overview" as PageKey }, LayoutDashboard],
    ["搜索全部 MCP", "资产、负责人和运行质量", { page: "mcps" as PageKey }, PackageOpen],
    ["查看待处理错误", "8 个高优先级告警", { page: "errors" as PageKey }, Bug],
    ["上架新 MCP", "进入五步上架流程", { page: "publish" as PageKey }, Plus],
    ["打开服务维护", "服务器、网关和凭证", { page: "maintenance" as PageKey }, ServerCog],
    ["查看知识库", "产品和技术开发手册", { page: "knowledge" as PageKey }, BookOpen],
  ].filter(([title, detail]) => !query || `${title}${detail}`.toLowerCase().includes(query.toLowerCase()));
  const entityResults = query.length > 1
    ? [
        ...mcps.filter((item) => `${item.displayName} ${item.name}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4).map((item) => ({
          title: item.displayName,
          detail: `MCP · ${item.name}`,
          intent: { page: "mcps" as PageKey, mcpId: item.id, detailTab: "overview" },
          Icon: PackageOpen,
        })),
        ...services.filter((item) => `${item.name} ${item.code}`.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((item) => ({
          title: item.name,
          detail: `Service · ${item.code}`,
          intent: { page: "services" as PageKey, serviceId: item.id },
          Icon: Boxes,
        })),
        ...errorRecords.filter((item) => `${item.code} ${item.message}`.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((item) => ({
          title: item.code,
          detail: `错误 · ${item.message}`,
          intent: { page: "mcps" as PageKey, mcpId: item.mcpId, detailTab: "errors" },
          Icon: Bug,
        })),
      ]
    : [];
  return (
    <div className="command-overlay" onMouseDown={onClose}>
      <div className="command-palette" onMouseDown={(event) => event.stopPropagation()}>
        <label><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索页面、MCP、Service 或操作…" /><kbd>ESC</kbd></label>
        <div className="command-results">
          <span>快速导航</span>
          {entityResults.map(({ title, detail, intent, Icon }) => (
            <button key={`${title}-${detail}`} onClick={() => navigate(intent)}><i><Icon size={17} /></i><div><strong>{title}</strong><small>{detail}</small></div><span>↵</span></button>
          ))}
          {actions.map(([title, detail, intent, Icon]) => {
            const C = Icon as typeof Activity;
            return <button key={String(title)} onClick={() => navigate(intent as NavigationIntent)}><i><C size={17} /></i><div><strong>{String(title)}</strong><small>{String(detail)}</small></div><span>↵</span></button>;
          })}
        </div>
      </div>
    </div>
  );
}

function HelpPanel({
  onClose,
  navigate,
}: {
  onClose: () => void;
  navigate: (intent: NavigationIntent) => void;
}) {
  return (
    <div className="help-panel">
      <header><div><strong>帮助与快捷入口</strong><small>MCP Control Center</small></div><button onClick={onClose}><X size={18} /></button></header>
      <div className="help-content">
        <div className="help-hero"><Command size={24} /><h3>今天想完成什么？</h3><p>从产品设计、技术接入到事故处理，都可以在这里找到规范和入口。</p></div>
        <button onClick={() => { onClose(); navigate({ page: "knowledge" }); }}><BookOpen size={18} /><div><strong>MCP 产品设计规范</strong><small>工具边界、描述和参数设计</small></div><span>›</span></button>
        <button onClick={() => { onClose(); navigate({ page: "knowledge" }); }}><ServerCog size={18} /><div><strong>技术接入手册</strong><small>Transport、鉴权和 Trace</small></div><span>›</span></button>
        <button onClick={() => { onClose(); navigate({ page: "errors" }); }}><Bug size={18} /><div><strong>事故响应流程</strong><small>分级、止损、回滚和复盘</small></div><span>›</span></button>
        <InlineHelp />
      </div>
    </div>
  );
}

function InlineHelp() {
  return <div className="help-tip"><Command size={17} /><span>按 <kbd>⌘ K</kbd> 可随时打开全局搜索。</span></div>;
}
