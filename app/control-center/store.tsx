"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { errorRecords, knowledgeDocs, marketItems, mcps, services } from "./data";
import type { ErrorRecord, KnowledgeDoc, MarketItem, McpStatus, McpTool, ServiceItem } from "./types";

export interface AuditEntry {
  id: string;
  action: string;
  target: string;
  actor: string;
  at: string;
  detail: string;
}

interface CatalogState {
  mcps: McpTool[];
  services: ServiceItem[];
  errors: ErrorRecord[];
  marketItems: MarketItem[];
  knowledgeDocs: KnowledgeDoc[];
  audits: AuditEntry[];
}

interface CatalogActions {
  createMcp: (tool: McpTool) => void;
  updateMcp: (id: string, patch: Partial<McpTool>, detail?: string) => void;
  updateMcpStatus: (id: string, status: McpStatus) => void;
  createMcpVersion: (id: string, version: string, detail: string) => void;
  resolveError: (id: string) => void;
  createService: (service: ServiceItem) => void;
  updateService: (id: string, patch: Partial<ServiceItem>) => void;
  installMarketItem: (id: string) => void;
  createKnowledgeDoc: (doc: KnowledgeDoc) => void;
  updateKnowledgeDoc: (id: string, patch: Partial<KnowledgeDoc>) => void;
  deleteKnowledgeDoc: (id: string) => void;
  addAudit: (action: string, target: string, detail: string) => void;
}

const CatalogContext = createContext<(CatalogState & CatalogActions) | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>(() => ({
    mcps: mcps.map((item) => ({ ...item, owners: { ...item.owners }, clients: [...item.clients] })),
    services: services.map((item) => ({ ...item, workspaceIds: [...item.workspaceIds] })),
    errors: errorRecords.map((item) => ({ ...item })),
    marketItems: marketItems.map((item) => ({ ...item, tags: [...item.tags], installStatus: "未接入" })),
    knowledgeDocs: knowledgeDocs.map((item) => ({ ...item, tags: [...item.tags], sections: item.sections.map((section) => ({ ...section })) })),
    audits: [],
  }));

  const actions = useMemo<CatalogActions>(() => ({
    createMcp: (tool) => {
      setState((current) => ({
        ...current,
        mcps: [tool, ...current.mcps],
        audits: [{
          id: `audit-${Date.now()}`,
          action: "创建 MCP",
          target: tool.id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: `创建${tool.displayName}，初始状态为${tool.status}`,
        }, ...current.audits],
      }));
    },
    updateMcp: (id, patch, detail = "更新 MCP 配置") => {
      setState((current) => ({
        ...current,
        mcps: current.mcps.map((item) => item.id === id ? { ...item, ...patch, updatedAt: "刚刚" } : item),
        audits: [{
          id: `audit-${Date.now()}`,
          action: "更新 MCP",
          target: id,
          actor: "Alex Kim",
          at: "刚刚",
          detail,
        }, ...current.audits],
      }));
    },
    updateMcpStatus: (id, status) => {
      setState((current) => ({
        ...current,
        mcps: current.mcps.map((item) => item.id === id ? { ...item, status, updatedAt: "刚刚" } : item),
        audits: [{
          id: `audit-${Date.now()}`,
          action: status === "已上架" ? "上架 MCP" : status === "已下架" ? "下架 MCP" : "更新 MCP 状态",
          target: id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: `状态变更为${status}`,
        }, ...current.audits],
      }));
    },
    createMcpVersion: (id, version, detail) => {
      setState((current) => ({
        ...current,
        mcps: current.mcps.map((item) => item.id === id ? { ...item, version, status: "测试中", updatedAt: "刚刚" } : item),
        audits: [{
          id: `audit-${Date.now()}`,
          action: "创建 MCP 版本",
          target: id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: `${version} · ${detail}`,
        }, ...current.audits],
      }));
    },
    resolveError: (id) => {
      setState((current) => ({
        ...current,
        errors: current.errors.map((item) => item.id === id ? { ...item, status: "已解决" } : item),
        audits: [{
          id: `audit-${Date.now()}`,
          action: "解决错误",
          target: id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: "错误已标记为已解决",
        }, ...current.audits],
      }));
    },
    createService: (service) => {
      setState((current) => ({
        ...current,
        services: [service, ...current.services],
        audits: [{
          id: `audit-${Date.now()}`,
          action: "创建 Service",
          target: service.id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: `创建“${service.name}”，当前状态为${service.status}`,
        }, ...current.audits],
      }));
    },
    updateService: (id, patch) => {
      setState((current) => ({
        ...current,
        services: current.services.map((item) => item.id === id ? { ...item, ...patch, updatedAt: "刚刚" } : item),
        audits: [{
          id: `audit-${Date.now()}`,
          action: "更新 Service",
          target: id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: "更新 Service 的描述、业务归属或负责人",
        }, ...current.audits],
      }));
    },
    installMarketItem: (id) => {
      setState((current) => {
        const item = current.marketItems.find((entry) => entry.id === id);
        return {
          ...current,
          marketItems: current.marketItems.map((entry) => entry.id === id ? { ...entry, installStatus: "审核中" } : entry),
          audits: [{
            id: `audit-${Date.now()}`,
            action: "接入第三方 MCP",
            target: id,
            actor: "Alex Kim",
            at: "刚刚",
            detail: `${item?.name ?? id} 已完成沙盒验证并提交内部审核`,
          }, ...current.audits],
        };
      });
    },
    createKnowledgeDoc: (doc) => {
      setState((current) => ({
        ...current,
        knowledgeDocs: [doc, ...current.knowledgeDocs],
        audits: [{
          id: `audit-${Date.now()}`,
          action: "发布知识文档",
          target: doc.id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: `发布“${doc.title}”`,
        }, ...current.audits],
      }));
    },
    updateKnowledgeDoc: (id, patch) => {
      setState((current) => ({
        ...current,
        knowledgeDocs: current.knowledgeDocs.map((item) => item.id === id ? { ...item, ...patch, updatedAt: "刚刚" } : item),
        audits: [{
          id: `audit-${Date.now()}`,
          action: "更新知识文档",
          target: id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: "更新文档正文并生成新修改记录",
        }, ...current.audits],
      }));
    },
    deleteKnowledgeDoc: (id) => {
      setState((current) => ({
        ...current,
        knowledgeDocs: current.knowledgeDocs.filter((item) => item.id !== id),
        audits: [{
          id: `audit-${Date.now()}`,
          action: "删除知识文档",
          target: id,
          actor: "Alex Kim",
          at: "刚刚",
          detail: "文档已从知识库移除",
        }, ...current.audits],
      }));
    },
    addAudit: (action, target, detail) => {
      setState((current) => ({
        ...current,
        audits: [{
          id: `audit-${Date.now()}`,
          action,
          target,
          actor: "Alex Kim",
          at: "刚刚",
          detail,
        }, ...current.audits],
      }));
    },
  }), []);

  return <CatalogContext.Provider value={{ ...state, ...actions }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog 必须在 CatalogProvider 内使用");
  return value;
}
