import { errorRecords, knowledgeDocs, marketItems, mcps, services } from "./data";
import type { ErrorRecord, KnowledgeDoc, MarketItem, McpTool, ServiceItem } from "./types";

/**
 * 首版使用内存演示数据。真实接入时只需实现同一接口并替换 createCatalogApi，
 * 页面和状态仓库不需要了解数据库、Trace 平台或本地代理的具体实现。
 */
export interface CatalogApi {
  getOverview(): Promise<{ mcps: McpTool[]; services: ServiceItem[]; errors: ErrorRecord[] }>;
  getServices(): Promise<ServiceItem[]>;
  getService(serviceId: string): Promise<ServiceItem | undefined>;
  getMcps(): Promise<McpTool[]>;
  getMcp(mcpId: string): Promise<McpTool | undefined>;
  getMcpMetrics(mcpId: string): Promise<Pick<McpTool, "calls" | "successRate" | "avgTokens" | "latency" | "errorRate"> | undefined>;
  getMcpErrors(mcpId: string): Promise<ErrorRecord[]>;
  getErrorContext(errorId: string): Promise<ErrorRecord | undefined>;
  createMcp(tool: McpTool): Promise<McpTool>;
  patchMcp(mcpId: string, patch: Partial<McpTool>): Promise<McpTool | undefined>;
  getMarketplace(): Promise<MarketItem[]>;
  getKnowledgeBase(): Promise<KnowledgeDoc[]>;
}

export const apiEndpoints = {
  overview: "/api/overview",
  services: "/api/services",
  service: (serviceId: string) => `/api/services/${serviceId}`,
  mcps: "/api/mcps",
  mcp: (mcpId: string) => `/api/mcps/${mcpId}`,
  metrics: (mcpId: string) => `/api/mcps/${mcpId}/metrics`,
  errors: (mcpId: string) => `/api/mcps/${mcpId}/errors`,
  errorContext: (errorId: string) => `/api/errors/${errorId}/context`,
  clients: "/api/clients",
  marketplace: "/api/marketplace",
  knowledgeBase: "/api/knowledge-base",
} as const;

export function createDemoCatalogApi(): CatalogApi {
  let demoMcps = mcps.map((item) => ({ ...item }));
  return {
    async getOverview() {
      return { mcps: demoMcps, services, errors: errorRecords };
    },
    async getServices() { return services; },
    async getService(serviceId) { return services.find((item) => item.id === serviceId); },
    async getMcps() { return demoMcps; },
    async getMcp(mcpId) { return demoMcps.find((item) => item.id === mcpId); },
    async getMcpMetrics(mcpId) {
      const item = demoMcps.find((entry) => entry.id === mcpId);
      if (!item) return undefined;
      return {
        calls: item.calls,
        successRate: item.successRate,
        avgTokens: item.avgTokens,
        latency: item.latency,
        errorRate: item.errorRate,
      };
    },
    async getMcpErrors(mcpId) { return errorRecords.filter((item) => item.mcpId === mcpId); },
    async getErrorContext(errorId) { return errorRecords.find((item) => item.id === errorId); },
    async createMcp(tool) {
      demoMcps = [tool, ...demoMcps];
      return tool;
    },
    async patchMcp(mcpId, patch) {
      demoMcps = demoMcps.map((item) => item.id === mcpId ? { ...item, ...patch } : item);
      return demoMcps.find((item) => item.id === mcpId);
    },
    async getMarketplace() { return marketItems; },
    async getKnowledgeBase() { return knowledgeDocs; },
  };
}
