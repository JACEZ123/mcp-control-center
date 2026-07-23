export type PageKey =
  | "overview"
  | "services"
  | "mcps"
  | "analytics"
  | "errors"
  | "publish"
  | "maintenance"
  | "market"
  | "knowledge"
  | "permissions";

export type WorkspaceId = "prod" | "sandbox" | "external";
export type RoleId = "admin" | "product" | "developer" | "ops" | "viewer";
export type McpStatus = "已上架" | "灰度中" | "测试中" | "维护中" | "已下架";

export interface Owner {
  product: string;
  developer: string;
  ops: string;
}

export interface McpTool {
  id: string;
  name: string;
  displayName: string;
  serviceId: string;
  workspaceIds: WorkspaceId[];
  status: McpStatus;
  version: string;
  calls: number;
  successRate: number;
  avgTokens: number;
  latency: number;
  errorRate: number;
  score: number;
  updatedAt: string;
  description: string;
  owners: Owner;
  clients: string[];
  authMode: "平台 OpenAPI" | "用户 OAuth 2.0" | "用户密钥" | "强鉴权" | "无需鉴权";
  transport: "Streamable HTTP" | "SSE" | "stdio";
  workflowName: string;
  infraName: string;
  inputSchema: string;
  outputSchema: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  code: string;
  summary: string;
  businessLine: string;
  department: string;
  status: "运行正常" | "需要关注" | "维护中";
  workspaceIds: WorkspaceId[];
  owner: string;
  productOwner: string;
  techOwner: string;
  updatedAt: string;
}

export interface ErrorRecord {
  id: string;
  mcpId: string;
  code: string;
  category: "鉴权失败" | "参数错误" | "服务超时" | "依赖异常" | "响应格式错误";
  message: string;
  count: number;
  firstAt: string;
  lastAt: string;
  resolveMinutes: number;
  severity: "P0" | "P1" | "P2" | "P3";
  status: "待处理" | "处理中" | "已解决";
  impact: string;
  userMessage: string;
  llmMessage: string;
  toolInput: string;
  toolOutput: string;
  summary: string;
}

export interface MarketItem {
  id: string;
  name: string;
  provider: string;
  category: string;
  summary: string;
  protocol: string;
  auth: string;
  llmSupport: string;
  pricing: string;
  visibility: string;
  verified: boolean;
  installs: number;
  tags: string[];
  installStatus?: "未接入" | "沙盒验证中" | "审核中" | "已接入";
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
  owner: string;
  version: string;
  updatedAt: string;
  readMinutes: number;
  tags: string[];
  sections: Array<{ title: string; content: string }>;
}

export interface NavigationIntent {
  page: PageKey;
  mcpId?: string;
  serviceId?: string;
  detailTab?: string;
  status?: string;
  sort?: string;
  date?: string;
}

export interface Workspace {
  id: WorkspaceId;
  name: string;
  environment: string;
  color: string;
}

export interface ToastMessage {
  id: number;
  title: string;
  detail?: string;
  tone?: "success" | "warning" | "danger" | "info";
}
