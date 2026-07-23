"use client";

import {
  Activity,
  AlertTriangle,
  Bot,
  Box,
  Braces,
  CheckCircle2,
  Clock3,
  Code2,
  ChevronRight,
  Gauge,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Rocket,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { errorRecords, services, trendByRange, workspaces } from "./data";
import { DistributionDonut, MiniBars, TrendChart } from "./charts";
import { useCatalog } from "./store";
import {
  Badge,
  Button,
  CopyButton,
  Drawer,
  EmptyState,
  InlineNotice,
  LoadingButton,
  MetricCard,
  Modal,
  PageIntro,
  Panel,
  ProgressRing,
  SearchField,
  SelectField,
  TableLink,
  Tabs,
} from "./ui";
import type {
  McpTool,
  NavigationIntent,
  RoleId,
  ServiceItem,
  WorkspaceId,
} from "./types";

const serviceName = (id: string) => services.find((service) => service.id === id)?.name ?? id;
const statusTone = (status: string) =>
  status === "已上架" || status === "运行正常"
    ? "success"
    : status === "维护中" || status === "需要关注"
      ? "warning"
      : status === "已下架"
        ? "neutral"
        : "info";

export function OverviewPage({
  navigate,
}: {
  navigate: (intent: NavigationIntent) => void;
}) {
  const { mcps } = useCatalog();
  const [range, setRange] = useState("30");
  const values = trendByRange[range];
  const labels = values.map((_, index) =>
    range === "7"
      ? `7月${17 + index}日`
      : range === "15"
        ? `7月${8 + index}日`
        : `第 ${index + 1} 个统计点`,
  );
  const rangeScale = Number(range) / 30;
  const calls = Math.round(mcps.reduce((sum, item) => sum + item.calls, 0) * rangeScale);
  const topTools = [...mcps].sort((a, b) => b.calls - a.calls).slice(0, 5);
  const focusTools = [...mcps].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <>
      <PageIntro
        eyebrow="实时治理驾驶舱"
        title="企业 MCP 运行总览"
        description="从调用价值、稳定性和描述质量三个角度，识别今天最值得处理的 MCP。"
        actions={
          <>
            <SelectField value={range} onChange={setRange}>
              {["7", "15", "30", "90", "180"].map((item) => (
                <option key={item} value={item}>
                  近 {item} 天
                </option>
              ))}
            </SelectField>
            <Button icon={<Rocket size={16} />} onClick={() => navigate({ page: "publish" })}>
              上架 MCP
            </Button>
          </>
        }
      />

      <div className="metric-grid">
        <MetricCard
          label="MCP 总数"
          value="48"
          delta="本月新增 6 个"
          icon={<Box size={20} />}
          onClick={() => navigate({ page: "mcps" })}
        />
        <MetricCard
          label="已上架 MCP"
          value="39"
          delta="覆盖 12 个业务域"
          tone="success"
          icon={<CheckCircle2 size={20} />}
          onClick={() => navigate({ page: "mcps", status: "已上架" })}
        />
        <MetricCard
          label="今日调用"
          value="12,846"
          delta="较昨日 +18.4%"
          tone="info"
          icon={<Activity size={20} />}
          onClick={() => navigate({ page: "analytics", date: "今天" })}
        />
        <MetricCard
          label="平均成功率"
          value="98.6%"
          delta="较上周 +0.8%"
          tone="success"
          icon={<ShieldCheck size={20} />}
          onClick={() => navigate({ page: "mcps", sort: "success-desc" })}
        />
        <MetricCard
          label="平均响应时长"
          value="842ms"
          delta="较上周 -6.2%"
          tone="warning"
          icon={<Gauge size={20} />}
          onClick={() => navigate({ page: "mcps", sort: "latency-desc" })}
        />
        <MetricCard
          label="待处理错误"
          value="42"
          delta="8 个高优先级"
          tone="danger"
          icon={<AlertTriangle size={20} />}
          onClick={() => navigate({ page: "errors" })}
        />
      </div>

      <div className="dashboard-grid">
        <Panel
          className="span-8"
          title="MCP 调用趋势"
          description={`近 ${range} 天 · ${calls.toLocaleString()} 次调用`}
          action={<Badge tone="success" dot>实时数据</Badge>}
        >
          <TrendChart
            values={values}
            labels={labels}
            onPointClick={(index) =>
              navigate({ page: "analytics", date: labels[index] })
            }
          />
        </Panel>

        <Panel
          className="span-4"
          title="调用量排行"
          description="点击进入对应 MCP 的调用分析"
        >
          <div className="rank-list">
            {topTools.map((tool, index) => (
              <button
                key={tool.id}
                onClick={() =>
                  navigate({ page: "mcps", mcpId: tool.id, detailTab: "analytics" })
                }
              >
                <span className={`rank-number rank-${index + 1}`}>{String(index + 1).padStart(2, "0")}</span>
                <span className="rank-copy">
                  <strong>{tool.displayName}</strong>
                  <small>{serviceName(tool.serviceId)}</small>
                </span>
                <MiniBars values={[32 + index, 48, 41 + index * 4, 63, 78 - index * 3]} />
                <b>{tool.calls.toLocaleString()}</b>
              </button>
            ))}
          </div>
        </Panel>

        <Panel
          className="span-5"
          title="Service 使用分布"
          description="按近 30 天调用占比统计"
        >
          <DistributionDonut
            segments={[
              { label: "图表生成", value: 38, color: "#7c6df2" },
              { label: "文档处理", value: 29, color: "#2fa8ff" },
              { label: "企业搜索", value: 23, color: "#22c55e" },
              { label: "协同办公", value: 10, color: "#f59e0b" },
            ]}
          />
        </Panel>

        <Panel
          className="span-7"
          title="描述质量与维护优先级"
          description="综合调用量、评分、错误率和更新时间生成"
          action={<Button tone="ghost" size="sm" onClick={() => navigate({ page: "mcps" })}>查看全部</Button>}
        >
          <div className="focus-list">
            {focusTools.map((tool, index) => (
              <button
                key={tool.id}
                onClick={() => navigate({ page: "mcps", mcpId: tool.id, detailTab: "overview" })}
              >
                <div className={`focus-index focus-${index + 1}`}>{index + 1}</div>
                <div>
                  <strong>{tool.displayName}</strong>
                  <span>{tool.score < 75 ? "描述边界不清晰，存在误调用风险" : "错误率偏高，建议补充异常处理说明"}</span>
                </div>
                <div className="score-pill">
                  <small>AI 评分</small>
                  <b>{tool.score}</b>
                </div>
                <span className="focus-action">立即优化</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="insight-strip">
        <span><Sparkles size={18} /></span>
        <div>
          <strong>今日治理建议</strong>
          <p>“Notion 页面同步”调用量持续增长，但鉴权失败占错误的 61%。建议先优化 OAuth 失效后的用户引导，再扩大灰度范围。</p>
        </div>
        <Button
          tone="secondary"
          size="sm"
          onClick={() => navigate({ page: "mcps", mcpId: "notion-sync", detailTab: "overview" })}
        >
          查看诊断
        </Button>
      </div>
    </>
  );
}

export function ServicesPage({
  workspaceId,
  setWorkspaceId,
  navigate,
  notify,
}: {
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
  navigate: (intent: NavigationIntent) => void;
  notify: (title: string, detail?: string) => void;
}) {
  const { services, mcps, createService } = useCatalog();
  const [opened, setOpened] = useState<ServiceItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const visibleServices = services.filter((item) => item.workspaceIds.includes(workspaceId));

  return (
    <>
      <PageIntro
        eyebrow="业务能力分组"
        title="Service 管理"
        description="以稳定业务能力为边界管理 MCP，查看每个 Service 的调用、质量和维护责任。"
        actions={
          <>
            <WorkspaceSelect value={workspaceId} onChange={setWorkspaceId} />
            <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              新建 Service
            </Button>
          </>
        }
      />

      <div className="service-summary">
        {[
          ["Service 总数", visibleServices.length, "本月新增 1 个"],
          ["运行正常", visibleServices.filter((item) => item.status === "运行正常").length, "整体可用"],
          ["需要关注", visibleServices.filter((item) => item.status !== "运行正常").length, "存在维护事项"],
          ["覆盖 MCP", mcps.filter((tool) => tool.workspaceIds.includes(workspaceId)).length, "当前工作区"],
        ].map(([label, value, detail]) => (
          <div key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </div>
        ))}
      </div>

      <div className="service-list">
        {visibleServices.map((service) => {
          const tools = mcps.filter(
            (tool) => tool.serviceId === service.id && tool.workspaceIds.includes(workspaceId),
          );
          const totalCalls = tools.reduce((sum, tool) => sum + tool.calls, 0);
          const avgSuccess =
            tools.reduce((sum, tool) => sum + tool.successRate, 0) / Math.max(tools.length, 1);
          const avgTokens =
            tools.reduce((sum, tool) => sum + tool.avgTokens, 0) / Math.max(tools.length, 1);
          const avgLatency =
            tools.reduce((sum, tool) => sum + tool.latency, 0) / Math.max(tools.length, 1);
          const attention = tools.filter((tool) => tool.score < 80 || tool.errorRate > 3).length;
          return (
            <button className="service-row" key={service.id} onClick={() => setOpened(service)}>
              <div className="service-identity">
                <span className={`service-monogram service-${service.id}`}>{service.name.at(0)}</span>
                <div>
                  <strong>{service.name}</strong>
                  <small>{service.code} · {service.businessLine}</small>
                </div>
              </div>
              <Badge tone={statusTone(service.status)} dot>{service.status}</Badge>
              <div className="service-stat"><b>{totalCalls.toLocaleString()}</b><span>调用次数</span></div>
              <div className="service-stat"><b>{avgSuccess.toFixed(1)}%</b><span>平均成功率</span></div>
              <div className="service-stat"><b>{Math.round(avgTokens).toLocaleString()}</b><span>平均 Token</span></div>
              <div className="service-stat"><b>{Math.round(avgLatency)}ms</b><span>平均响应</span></div>
              <div className="service-stat attention"><b>{attention}</b><span>应关注 MCP</span></div>
              <div className="service-owner">
                <span>{service.owner.at(0)}</span>
                <div><b>{service.owner}</b><small>Service 负责人</small></div>
              </div>
              <span className="row-arrow">›</span>
            </button>
          );
        })}
      </div>

      {opened && (
        <ServiceDrawer
          service={opened}
          workspaceId={workspaceId}
          onClose={() => setOpened(null)}
          navigate={navigate}
        />
      )}
      {createOpen && (
        <CreateServiceModal
          onClose={() => setCreateOpen(false)}
          onSubmit={(draft) => {
            createService(draft);
            setCreateOpen(false);
            setOpened(draft);
            notify("Service 草稿已创建", "已写入 Service 列表，并打开详情抽屉。");
          }}
        />
      )}
    </>
  );
}

function ServiceDrawer({
  service,
  workspaceId,
  onClose,
  navigate,
}: {
  service: ServiceItem;
  workspaceId: WorkspaceId;
  onClose: () => void;
  navigate: (intent: NavigationIntent) => void;
}) {
  const { mcps, errors } = useCatalog();
  const [tab, setTab] = useState("tools");
  const tools = mcps.filter(
    (tool) => tool.serviceId === service.id && tool.workspaceIds.includes(workspaceId),
  );
  const totalCalls = tools.reduce((sum, item) => sum + item.calls, 0);
  return (
    <Drawer
      title={service.name}
      subtitle={`${service.code} · ${service.department}`}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>关闭</Button>
          <Button
            onClick={() => {
              onClose();
              navigate({ page: "services", serviceId: service.id });
            }}
          >
            进入 Service 详情
          </Button>
        </>
      }
    >
      <div className="drawer-hero">
        <div className={`service-monogram service-${service.id}`}>{service.name.at(0)}</div>
        <div>
          <Badge tone={statusTone(service.status)} dot>{service.status}</Badge>
          <p>{service.summary}</p>
        </div>
      </div>
      <div className="drawer-metrics">
        <div><strong>{tools.length}</strong><span>MCP 工具</span></div>
        <div><strong>{totalCalls.toLocaleString()}</strong><span>近 30 天调用</span></div>
        <div><strong>{(tools.reduce((sum, item) => sum + item.successRate, 0) / Math.max(tools.length, 1)).toFixed(1)}%</strong><span>平均成功率</span></div>
      </div>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "tools", label: "MCP 列表", count: tools.length },
          { id: "calls", label: "调用情况" },
          { id: "errors", label: "错误情况" },
        ]}
      />
      {tab === "tools" && (
        <div className="drawer-tool-list">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                onClose();
                navigate({ page: "mcps", mcpId: tool.id, detailTab: "overview" });
              }}
            >
              <div><strong>{tool.displayName}</strong><small>{tool.name} · {tool.version}</small></div>
              <Badge tone={statusTone(tool.status)}>{tool.status}</Badge>
              <div><b>{tool.calls.toLocaleString()}</b><span>调用</span></div>
              <div><b>{tool.successRate}%</b><span>成功率</span></div>
              <div><b>{tool.avgTokens}</b><span>Token</span></div>
              <div><b>{tool.latency}ms</b><span>响应</span></div>
              {tool.score < 80 && <Badge tone="warning">描述待优化</Badge>}
            </button>
          ))}
        </div>
      )}
      {tab === "calls" && (
        <div className="drawer-chart">
          <TrendChart
            values={[1200, 1460, 1380, 1720, 1890, 2040, 2280]}
            labels={["7/16", "7/17", "7/18", "7/19", "7/20", "7/21", "7/22"]}
            onPointClick={() => {
              onClose();
              navigate({ page: "analytics" });
            }}
          />
          <InlineNotice
            tone="success"
            title="调用量稳定增长"
            description="近 7 天调用量增长 18.6%，主要由条形图生成和折线图生成贡献。"
          />
        </div>
      )}
      {tab === "errors" && (
        <div className="drawer-error-list">
          {errors.filter((record) => tools.some((tool) => tool.id === record.mcpId)).length ? (
            errors
              .filter((record) => tools.some((tool) => tool.id === record.mcpId))
              .map((record) => (
                <button
                  key={record.id}
                  onClick={() => {
                    onClose();
                    navigate({ page: "mcps", mcpId: record.mcpId, detailTab: "errors" });
                  }}
                >
                  <Badge tone="danger">{record.severity}</Badge>
                  <div><strong>{record.message}</strong><small>{record.code} · 最近 {record.lastAt}</small></div>
                  <b>{record.count} 次</b>
                </button>
              ))
          ) : (
            <EmptyState title="当前没有活跃错误" description="该 Service 近 7 天未出现需要处理的错误。" />
          )}
        </div>
      )}
    </Drawer>
  );
}

function CreateServiceModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (service: ServiceItem) => void }) {
  const [name, setName] = useState("营销内容生成");
  const [code, setCode] = useState("CONTENT-SERVICE");
  const [businessLine, setBusinessLine] = useState("企业效率");
  const [department, setDepartment] = useState("智能产品部");
  const [summary, setSummary] = useState("为企业营销场景提供文案、图片和渠道适配能力。");
  const [productOwner, setProductOwner] = useState("陈希");
  const [techOwner, setTechOwner] = useState("高远");
  const submit = () => onSubmit({
    id: `service-${Date.now()}`,
    name,
    code,
    businessLine,
    department,
    summary,
    productOwner,
    techOwner,
    owner: productOwner,
    updatedAt: "刚刚",
    status: "需要关注",
    workspaceIds: ["prod", "sandbox"],
  });
  return (
    <Modal
      title="新建 Service"
      subtitle="创建稳定的业务能力边界，后续可在其中添加多个 MCP。"
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>取消</Button>
          <Button disabled={!name.trim() || !code.trim()} onClick={submit}>创建草稿</Button>
        </>
      }
    >
      <div className="form-grid">
        <label><span>Service 名称</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label><span>Service Code</span><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} /></label>
        <label><span>所属业务线</span><select value={businessLine} onChange={(event) => setBusinessLine(event.target.value)}><option>企业效率</option><option>数据智能</option><option>知识智能</option></select></label>
        <label><span>业务部门</span><input value={department} onChange={(event) => setDepartment(event.target.value)} /></label>
        <label className="span-2"><span>能力描述</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
        <label><span>产品负责人</span><input value={productOwner} onChange={(event) => setProductOwner(event.target.value)} /></label>
        <label><span>技术负责人</span><input value={techOwner} onChange={(event) => setTechOwner(event.target.value)} /></label>
      </div>
    </Modal>
  );
}

export function ServiceDetailPage({
  serviceId,
  workspaceId,
  navigate,
  onBack,
  notify,
}: {
  serviceId: string;
  workspaceId: WorkspaceId;
  navigate: (intent: NavigationIntent) => void;
  onBack: () => void;
  notify: (title: string, detail?: string) => void;
}) {
  const { services, mcps, updateService } = useCatalog();
  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const tools = mcps.filter(
    (tool) => tool.serviceId === service.id && tool.workspaceIds.includes(workspaceId),
  );
  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  return (
    <>
      <PageIntro
        eyebrow={`${service.code} · ${service.businessLine}`}
        title={service.name}
        description={service.summary}
        onBack={onBack}
        actions={
          <>
            <Badge tone={statusTone(service.status)} dot>{service.status}</Badge>
            <Button tone="secondary" icon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>编辑 Service</Button>
            <Button icon={<Plus size={16} />} onClick={() => navigate({ page: "publish" })}>添加 MCP</Button>
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "overview", label: "运行总览" },
          { id: "tools", label: "包含工具", count: tools.length },
          { id: "versions", label: "版本与上下架" },
          { id: "clients", label: "客户端接入" },
        ]}
      />
      {tab === "overview" && (
        <div className="detail-grid">
          <Panel className="span-8" title="Service 调用趋势" description="近 30 天调用、成功率和响应时长">
            <TrendChart
              values={[1680, 1920, 1840, 2210, 2490, 2380, 2710, 3020, 2940, 3310]}
              labels={["7/13", "7/14", "7/15", "7/16", "7/17", "7/18", "7/19", "7/20", "7/21", "7/22"]}
              onPointClick={() => navigate({ page: "analytics" })}
            />
          </Panel>
          <Panel className="span-4" title="管理责任">
            <div className="owner-stack">
              {[
                ["Service 负责人", service.owner],
                ["产品负责人", service.productOwner],
                ["技术负责人", service.techOwner],
                ["业务部门", service.department],
              ].map(([label, value]) => (
                <div key={label}><span>{value.at(0)}</span><div><strong>{value}</strong><small>{label}</small></div></div>
              ))}
            </div>
          </Panel>
          <Panel className="span-12" title="MCP 运行总览" description="点击工具名称进入 MCP 详情">
            <McpTable tools={tools} navigate={navigate} compact />
          </Panel>
        </div>
      )}
      {tab === "tools" && (
        <Panel title="包含工具" description="管理该 Service 中的全部 MCP 工具">
          <McpTable tools={tools} navigate={navigate} />
        </Panel>
      )}
      {tab === "versions" && (
        <Panel title="版本与上下架分布">
          <div className="version-board">
            {tools.map((tool) => (
              <div key={tool.id}>
                <span className="version-rail"><i /></span>
                <div><strong>{tool.displayName}</strong><small>{tool.updatedAt}</small></div>
                <Badge tone="purple">{tool.version}</Badge>
                <Badge tone={statusTone(tool.status)}>{tool.status}</Badge>
                <Button tone="ghost" size="sm" onClick={() => navigate({ page: "mcps", mcpId: tool.id, detailTab: "versions" })}>查看版本</Button>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {tab === "clients" && (
        <Panel title="AI 客户端接入情况" description="查看该 Service 被哪些 AI 平台启用">
          <div className="client-grid">
            {["ChatGPT Enterprise", "Claude Desktop", "内部 Copilot", "Cursor"].map((client, index) => (
              <div key={client}>
                <Bot size={22} />
                <div><strong>{client}</strong><small>{index === 3 ? "仅研发沙盒" : "生产环境已启用"}</small></div>
                <Badge tone={index === 3 ? "warning" : "success"}>{index === 3 ? "受限" : "正常"}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      )}
      {editOpen && (
        <EditServiceModal
          service={service}
          onClose={() => setEditOpen(false)}
          onSave={(patch) => {
            updateService(service.id, patch);
            setEditOpen(false);
            notify("Service 已更新", "负责人、业务归属与能力描述已同步。");
          }}
        />
      )}
    </>
  );
}

function EditServiceModal({ service, onClose, onSave }: { service: ServiceItem; onClose: () => void; onSave: (patch: Partial<ServiceItem>) => void }) {
  const [summary, setSummary] = useState(service.summary);
  const [businessLine, setBusinessLine] = useState(service.businessLine);
  const [owner, setOwner] = useState(service.owner);
  const [techOwner, setTechOwner] = useState(service.techOwner);
  return (
    <Modal title={`编辑 ${service.name}`} subtitle="修改后会生成审计记录，并立即同步到 Service 详情。" onClose={onClose}
      footer={<><Button tone="secondary" onClick={onClose}>取消</Button><Button onClick={() => onSave({ summary, businessLine, owner, productOwner: owner, techOwner })}>保存修改</Button></>}>
      <div className="form-grid">
        <label><span>所属业务线</span><input value={businessLine} onChange={(event) => setBusinessLine(event.target.value)} /></label>
        <label><span>Service 负责人</span><input value={owner} onChange={(event) => setOwner(event.target.value)} /></label>
        <label><span>技术负责人</span><input value={techOwner} onChange={(event) => setTechOwner(event.target.value)} /></label>
        <label className="span-2"><span>能力描述</span><textarea value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
      </div>
    </Modal>
  );
}

export function McpsPage({
  workspaceId,
  setWorkspaceId,
  initialStatus,
  initialSort,
  navigate,
}: {
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
  initialStatus?: string;
  initialSort?: string;
  navigate: (intent: NavigationIntent) => void;
}) {
  const { mcps: liveMcps } = useCatalog();
  const [query, setQuery] = useState("");
  const [service, setService] = useState("all");
  const [status, setStatus] = useState(initialStatus ?? "all");
  const [sort, setSort] = useState(initialSort ?? "calls-desc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const visible = useMemo(() => {
    let rows = liveMcps.filter((tool) => tool.workspaceIds.includes(workspaceId));
    if (query) rows = rows.filter((tool) => `${tool.displayName}${tool.name}${serviceName(tool.serviceId)}`.toLowerCase().includes(query.toLowerCase()));
    if (service !== "all") rows = rows.filter((tool) => tool.serviceId === service);
    if (status !== "all") rows = rows.filter((tool) => tool.status === status);
    return [...rows].sort((a, b) => {
      if (sort === "success-desc") return b.successRate - a.successRate;
      if (sort === "latency-desc") return b.latency - a.latency;
      if (sort === "errors-desc") return b.errorRate - a.errorRate;
      if (sort === "updated-desc") return a.updatedAt.localeCompare(b.updatedAt);
      return b.calls - a.calls;
    });
  }, [liveMcps, workspaceId, query, service, status, sort]);

  return (
    <>
      <PageIntro
        eyebrow="MCP 资产目录"
        title="全部 MCP"
        description="查询、比较和维护企业内所有 MCP 工具的契约、运行质量与生命周期。"
        actions={
          <>
            <WorkspaceSelect value={workspaceId} onChange={setWorkspaceId} />
            <Button icon={<Plus size={16} />} onClick={() => navigate({ page: "publish" })}>新建 MCP</Button>
          </>
        }
      />
      <div className="toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="搜索 MCP 名称、工具名或 Service…" />
        <SelectField value={service} onChange={setService}>
          <option value="all">全部 Service</option>
          {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </SelectField>
        <SelectField value={status} onChange={setStatus}>
          <option value="all">全部状态</option>
          {["已上架", "灰度中", "测试中", "维护中", "已下架"].map((item) => <option key={item}>{item}</option>)}
        </SelectField>
        <SelectField value={sort} onChange={setSort}>
          <option value="calls-desc">调用次数从高到低</option>
          <option value="success-desc">成功率从高到低</option>
          <option value="latency-desc">响应时长从高到低</option>
          <option value="errors-desc">错误率从高到低</option>
          <option value="updated-desc">最近更新优先</option>
        </SelectField>
        <Button tone="ghost" size="sm" onClick={() => setFiltersOpen(true)}>高级筛选</Button>
      </div>
      <Panel
        title={`MCP 列表 · ${visible.length}`}
        description={`当前展示 ${workspaces.find((item) => item.id === workspaceId)?.name} 的资产`}
      >
        {visible.length ? (
          <McpTable tools={visible} navigate={navigate} />
        ) : (
          <EmptyState
            title="没有符合条件的 MCP"
            description="尝试调整搜索词、Service 或状态筛选。"
            action={<Button tone="secondary" onClick={() => { setQuery(""); setService("all"); setStatus("all"); }}>重置筛选</Button>}
          />
        )}
      </Panel>
      {filtersOpen && (
        <Modal title="高级筛选" subtitle="按负责人、AI 客户端和维护状态缩小范围" onClose={() => setFiltersOpen(false)}
          footer={<><Button tone="secondary" onClick={() => setFiltersOpen(false)}>取消</Button><Button onClick={() => setFiltersOpen(false)}>应用筛选</Button></>}>
          <div className="form-grid">
            <label><span>产品负责人</span><select><option>全部负责人</option><option>陈希</option><option>周可</option></select></label>
            <label><span>运维负责人</span><select><option>全部负责人</option><option>林晓</option><option>王晨</option></select></label>
            <label><span>AI 客户端</span><select><option>全部客户端</option><option>ChatGPT Enterprise</option><option>Claude Desktop</option></select></label>
            <label><span>维护状态</span><select><option>全部</option><option>需要维护</option><option>长期未更新</option></select></label>
            <label><span>最低调用次数</span><input type="number" defaultValue="1000" /></label>
            <label><span>最低错误率</span><input type="number" defaultValue="1" /></label>
          </div>
        </Modal>
      )}
    </>
  );
}

function McpTable({
  tools,
  navigate,
  compact = false,
}: {
  tools: McpTool[];
  navigate: (intent: NavigationIntent) => void;
  compact?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>MCP 工具</th>
            {!compact && <th>Service</th>}
            <th>状态 / 版本</th>
            <th>调用次数</th>
            <th>成功率</th>
            <th>平均 Token</th>
            <th>平均响应</th>
            {!compact && <th>错误率</th>}
            <th>负责人</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.id}>
              <td>
                <TableLink onClick={() => navigate({ page: "mcps", mcpId: tool.id, detailTab: "overview" })}>
                  <span className="tool-icon"><Braces size={17} /></span>
                  <span><strong>{tool.displayName}</strong><small>{tool.name}</small></span>
                </TableLink>
              </td>
              {!compact && <td><Badge tone="purple">{serviceName(tool.serviceId)}</Badge></td>}
              <td><Badge tone={statusTone(tool.status)} dot>{tool.status}</Badge><small className="cell-sub">{tool.version}</small></td>
              <td><strong>{tool.calls.toLocaleString()}</strong><MiniBars values={[28, 34, 30, 49, 58]} /></td>
              <td><span className={tool.successRate < 97 ? "value-danger" : "value-success"}>{tool.successRate}%</span></td>
              <td>{tool.avgTokens.toLocaleString()}</td>
              <td>{tool.latency >= 1500 ? <span className="value-danger">{tool.latency}ms</span> : `${tool.latency}ms`}</td>
              {!compact && <td>{tool.errorRate > 3 ? <Badge tone="danger">{tool.errorRate}%</Badge> : `${tool.errorRate}%`}</td>}
              <td><span className="owner-chip">{tool.owners.ops.at(0)}<small>{tool.owners.ops}</small></span></td>
              <td><button className="icon-button" aria-label={`打开 ${tool.displayName} 快捷操作`} onClick={() => navigate({ page: "mcps", mcpId: tool.id, detailTab: "overview" })}><MoreHorizontal size={17} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function McpDetailPage({
  mcpId,
  initialTab,
  role,
  navigate,
  onBack,
  notify,
}: {
  mcpId: string;
  initialTab?: string;
  role: RoleId;
  navigate: (intent: NavigationIntent) => void;
  onBack: () => void;
  notify: (title: string, detail?: string) => void;
}) {
  const { mcps: liveMcps, errors: liveErrors, updateMcp, updateMcpStatus, createMcpVersion } = useCatalog();
  const tool = liveMcps.find((item) => item.id === mcpId) ?? liveMcps[0];
  const [tab, setTab] = useState(initialTab ?? "overview");
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(tool.description);
  const canEdit = role !== "viewer";
  const relatedErrors = liveErrors.filter((item) => item.mcpId === tool.id);

  return (
    <>
      <PageIntro
        eyebrow={`${serviceName(tool.serviceId)} / ${tool.name}`}
        title={tool.displayName}
        description={`${tool.version} · 最近更新 ${tool.updatedAt}`}
        onBack={onBack}
        actions={
          <>
            <Badge tone={statusTone(tool.status)} dot>{tool.status}</Badge>
            <Button tone="secondary" icon={<Play size={15} />} onClick={() => setTab("test")}>手动调用</Button>
            {canEdit && <Button tone="ghost" onClick={() => updateMcpStatus(tool.id, tool.status === "已下架" ? "测试中" : "已下架")}>{tool.status === "已下架" ? "恢复上架" : "下架"}</Button>}
            <Button icon={<Pencil size={15} />} disabled={!canEdit} onClick={() => setEditing(true)}>编辑配置</Button>
          </>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "overview", label: "概览" },
          { id: "contract", label: "技术契约" },
          { id: "analytics", label: "调用分析" },
          { id: "errors", label: "报错分析", count: relatedErrors.length },
          { id: "test", label: "手动测试" },
          { id: "versions", label: "版本记录" },
        ]}
      />
      {tab === "overview" && <McpOverview tool={tool} navigate={navigate} />}
      {tab === "contract" && <McpContract tool={tool} notify={notify} />}
      {tab === "analytics" && <McpAnalytics tool={tool} />}
      {tab === "errors" && <McpErrors tool={tool} errors={relatedErrors} notify={notify} />}
      {tab === "test" && <McpManualTest tool={tool} notify={notify} />}
      {tab === "versions" && <McpVersions tool={tool} notify={notify} createVersion={createMcpVersion} />}
      {editing && (
        <EditMcpModal
          tool={tool}
          description={description}
          setDescription={setDescription}
          onClose={() => setEditing(false)}
          onSave={(patch) => {
            updateMcp(tool.id, patch, "更新基本信息、工具描述、鉴权、工作流与负责人");
            setEditing(false);
            notify("MCP 配置已保存", "变更已写入草稿版本，尚未影响生产环境。");
          }}
        />
      )}
    </>
  );
}

function McpOverview({ tool, navigate }: { tool: McpTool; navigate: (intent: NavigationIntent) => void }) {
  return (
    <div className="detail-grid">
      <Panel className="span-8" title="工具描述" description="模型依据这段描述决定是否选择该工具"
        action={<Badge tone={tool.score < 80 ? "warning" : "success"}>描述评分 {tool.score}</Badge>}>
        <div className="description-card">
          <Sparkles size={20} />
          <p>{tool.description}</p>
        </div>
        {tool.score < 80 && (
          <InlineNotice tone="warning" title="存在误调用风险" description="建议补充不适合调用的场景、鉴权前置条件和失败后的替代方案。" />
        )}
      </Panel>
      <Panel className="span-4 score-panel">
        <ProgressRing value={tool.score} label="综合评分" />
        <div className="score-breakdown">
          {[
            ["描述质量", tool.score],
            ["参数完整性", 92],
            ["运行稳定性", Math.round(tool.successRate)],
            ["维护及时性", tool.updatedAt.includes("天") ? 78 : 96],
          ].map(([label, value]) => (
            <div key={String(label)}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>
          ))}
        </div>
      </Panel>
      <Panel className="span-7" title="AI 调用场景模拟" description="由治理模型基于描述和历史 Trace 总结">
        <div className="scenario-list">
          {[
            ["适合调用", "用户明确要求生成可视化，并且数据结构满足该图表类型。", "success"],
            ["常见触发", "“帮我画图”“比较各部门”“展示过去一年的趋势”。", "info"],
            ["不适合调用", "用户只需要计算结果、数据少于两个类别或未授权读取数据源。", "warning"],
            ["替代建议", "需要时间趋势时优先使用折线图；需要占比时使用饼状图。", "purple"],
          ].map(([label, content, tone]) => (
            <div key={label}><Badge tone={tone as "success" | "info" | "warning" | "purple"}>{label}</Badge><p>{content}</p></div>
          ))}
        </div>
      </Panel>
      <Panel className="span-5" title="基本信息">
        <dl className="info-list">
          <div><dt>上线时间</dt><dd>2026-03-18 14:30</dd></div>
          <div><dt>产品负责人</dt><dd>{tool.owners.product}</dd></div>
          <div><dt>开发负责人</dt><dd>{tool.owners.developer}</dd></div>
          <div><dt>运维负责人</dt><dd>{tool.owners.ops}</dd></div>
          <div><dt>鉴权方式</dt><dd>{tool.authMode}</dd></div>
          <div><dt>Transport</dt><dd>{tool.transport}</dd></div>
        </dl>
      </Panel>
      <Panel className="span-12" title="接入与运行环境">
        <div className="endpoint-grid">
          {[
            [Server, "服务托管地址", "https://service.example.com/chart"],
            [Code2, "代码仓库", "git.example.com/ai/chart-mcp"],
            [Workflow, "LLM 工作流名称", tool.workflowName],
            [Box, "Infra 展示名称", tool.infraName],
          ].map(([Icon, label, value]) => {
            const IconComponent = Icon as typeof Server;
            return (
              <button key={String(label)} onClick={() => navigate({ page: "maintenance" })}>
                <IconComponent size={19} /><div><span>{String(label)}</span><strong>{String(value)}</strong></div><span>›</span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function McpContract({ tool, notify }: { tool: McpTool; notify: (title: string) => void }) {
  const [contractTab, setContractTab] = useState("input");
  return (
    <div className="detail-grid">
      <Panel className="span-8" title="输入输出 Schema" description="JSON Schema 2020-12">
        <Tabs
          value={contractTab}
          onChange={setContractTab}
          items={[
            { id: "input", label: "输入参数" },
            { id: "output", label: "输出参数" },
            { id: "example", label: "调用示例" },
          ]}
        />
        <div className="code-block">
          <CopyButton text={contractTab === "output" ? tool.outputSchema : tool.inputSchema} onCopied={() => notify("内容已复制")} />
          <pre>{contractTab === "output" ? tool.outputSchema : contractTab === "example" ? `{\n  "title": "各产品线季度收入",\n  "data": [{"label": "A", "value": 120}],\n  "theme": "brand"\n}` : tool.inputSchema}</pre>
        </div>
      </Panel>
      <Panel className="span-4" title="技术配置">
        <dl className="info-list">
          <div><dt>Transport</dt><dd>{tool.transport}</dd></div>
          <div><dt>鉴权方式</dt><dd>{tool.authMode}</dd></div>
          <div><dt>超时时间</dt><dd>3,000 ms</dd></div>
          <div><dt>最大 Token</dt><dd>4,096</dd></div>
          <div><dt>重试策略</dt><dd>指数退避 · 最多 2 次</dd></div>
          <div><dt>Schema 版本</dt><dd>2020-12</dd></div>
        </dl>
      </Panel>
      <Panel className="span-6" title="Resources">
        <div className="resource-list">
          <div><Code2 size={18} /><span><strong>chart://themes</strong><small>可用图表主题和品牌变量</small></span><Badge tone="success">可用</Badge></div>
          <div><Code2 size={18} /><span><strong>chart://examples</strong><small>高质量图表示例集合</small></span><Badge tone="success">可用</Badge></div>
        </div>
      </Panel>
      <Panel className="span-6" title="Prompts">
        <div className="resource-list">
          <div><WandSparkles size={18} /><span><strong>choose_chart_type</strong><small>根据数据和意图选择图表类型</small></span><Badge tone="purple">v1.3</Badge></div>
          <div><WandSparkles size={18} /><span><strong>summarize_chart</strong><small>生成图表无障碍摘要</small></span><Badge tone="purple">v2.0</Badge></div>
        </div>
      </Panel>
    </div>
  );
}

function McpAnalytics({ tool }: { tool: McpTool }) {
  return (
    <>
      <div className="metric-grid metric-grid-4">
        <MetricCard label="平均每对话调用" value="1.42 次" delta="近 10,000 次对话" icon={<Activity size={20} />} />
        <MetricCard label="首次调用成功率" value={`${tool.successRate}%`} delta="较上版本 +0.6%" tone="success" icon={<CheckCircle2 size={20} />} />
        <MetricCard label="P95 响应时长" value={`${Math.round(tool.latency * 1.8)}ms`} delta={`P50 ${Math.round(tool.latency * .72)}ms`} tone="warning" icon={<Clock3 size={20} />} />
        <MetricCard label="AI 选择比例" value="18.7%" delta="人工强制调用 1.2%" tone="info" icon={<Bot size={20} />} />
      </div>
      <div className="detail-grid">
        <Panel className="span-8" title="调用与成功率趋势" description="近 30 天">
          <TrendChart values={[1620, 1850, 1760, 2210, 2420, 2340, 2690, 2880, 2750, 3120, 3380, 3540]} labels={["7/11", "7/12", "7/13", "7/14", "7/15", "7/16", "7/17", "7/18", "7/19", "7/20", "7/21", "7/22"]} />
        </Panel>
        <Panel className="span-4" title="性能分位数">
          <div className="percentile-list">
            {[
              ["P50", Math.round(tool.latency * .72), 42],
              ["P75", Math.round(tool.latency * 1.1), 58],
              ["P95", Math.round(tool.latency * 1.8), 82],
              ["P99", Math.round(tool.latency * 2.7), 100],
            ].map(([label, value, width]) => (
              <div key={label}><span>{label}</span><i><b style={{ width: `${width}%` }} /></i><strong>{value}ms</strong></div>
            ))}
          </div>
          <InlineNotice tone="warning" title="P99 存在长尾" description="高数据量请求会显著增加渲染时长，建议在 2,000 个数据点以上启用采样。" />
        </Panel>
      </div>
    </>
  );
}

function McpErrors({
  tool,
  errors,
  notify,
}: {
  tool: McpTool;
  errors: typeof errorRecords;
  notify: (title: string, detail?: string) => void;
}) {
  const { resolveError } = useCatalog();
  const [selected, setSelected] = useState<(typeof errorRecords)[number] | null>(null);
  const [codeQuery, setCodeQuery] = useState("");
  const locatedErrors = errors.filter((error) => `${error.code} ${error.message} ${error.category}`.toLowerCase().includes(codeQuery.toLowerCase()));
  return (
    <>
      <div className="metric-grid metric-grid-4">
        <MetricCard label="近 30 天错误" value={`${Math.round(tool.calls * tool.errorRate / 100)}`} delta={`错误率 ${tool.errorRate}%`} tone="danger" icon={<XCircle size={20} />} />
        <MetricCard label="平均解决时长" value="1h 26m" delta="较上月缩短 18 分钟" tone="warning" icon={<Clock3 size={20} />} />
        <MetricCard label="受影响对话" value="286" delta="占全部对话 1.1%" icon={<Bot size={20} />} />
        <MetricCard label="重试成功率" value="72.4%" delta="自动重试 164 次" tone="success" icon={<Zap size={20} />} />
      </div>
      <Panel title="错误记录" description="点击错误查看用户、LLM 和工具调用的完整上下文">
        {errors.length ? (
          <div className="error-cards">
            {errors.map((error) => (
              <button key={error.id} onClick={() => setSelected(error)}>
                <Badge tone="danger">{error.severity}</Badge>
                <div><strong>{error.message}</strong><small>{error.code} · 最近发生 {error.lastAt}</small></div>
                <div><b>{error.count}</b><span>发生次数</span></div>
                <Badge tone={error.status === "已解决" ? "success" : "warning"}>{error.status}</Badge>
                <span>查看上下文 ›</span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无错误记录" description="该 MCP 在当前统计周期内没有错误。" />
        )}
      </Panel>
      <Panel title="错误码自查" description="已经定位到该 MCP 后，可进一步查看错误原因、处理建议和影响范围。">
        <div className="self-check-layout">
          <SearchField value={codeQuery} onChange={setCodeQuery} placeholder="在当前 MCP 内搜索错误码…" />
          <div className="error-code-list">
            {locatedErrors.map((error) => (
              <button className="error-code-card" key={error.id} onClick={() => setSelected(error)}>
                <div className="error-code-card-head"><code>{error.code}</code><Badge tone={error.severity === "P1" ? "danger" : "warning"}>{error.category}</Badge></div>
                <strong>{error.message}</strong>
                <p>原因：{error.category === "鉴权失败" ? "凭证过期、权限范围不足或第三方授权被撤销。" : error.category === "服务超时" ? "上游任务超过网关限制，通常与输入规模或依赖负载有关。" : "返回结构与工具契约不一致，需要检查字段类型和必填字段。"}</p>
                <span>解决：{error.category === "鉴权失败" ? "检查授权状态并引导用户重新连接。" : error.category === "服务超时" ? "拆分请求、增加异步任务或调整超时配置。" : "对照输出 Schema 修复字段，并补充契约测试。"} <ChevronRight size={14} /></span>
              </button>
            ))}
            {!locatedErrors.length && <EmptyState title="当前 MCP 没有匹配的错误码" description="尝试输入完整错误码，例如 MCP-TIMEOUT-504。" />}
          </div>
        </div>
      </Panel>
      {selected && (
        <ErrorContextModal
          error={selected}
          tool={tool}
          onClose={() => setSelected(null)}
          onResolve={() => {
            resolveError(selected.id);
            setSelected(null);
            notify("错误已标记为已解决", `${selected.code} 已写入处理审计记录。`);
          }}
          onCreateTask={() => {
            setSelected(null);
            notify("修复任务已创建", `已分配给 ${tool.owners.developer}，错误上下文已自动附加。`);
          }}
        />
      )}
    </>
  );
}

function ErrorContextModal({
  error,
  tool,
  onClose,
  onResolve,
  onCreateTask,
}: {
  error: (typeof errorRecords)[number];
  tool: McpTool;
  onClose: () => void;
  onResolve: () => void;
  onCreateTask: () => void;
}) {
  return (
    <Modal title={error.message} subtitle={`${error.code} · ${error.lastAt}`} onClose={onClose} size="xl"
      footer={<><Button tone="secondary" onClick={onClose}>关闭</Button>{error.status !== "已解决" && <Button tone="secondary" onClick={onResolve}>标记已解决</Button>}<Button onClick={onCreateTask}>创建修复任务</Button></>}>
      <div className="error-context-summary">
        <Badge tone="danger">{error.severity}</Badge>
        <div><span>完整耗时</span><strong>0 时 0 分 3.24 秒</strong></div>
        <div><span>工具调用</span><strong>3 个工具</strong></div>
        <div><span>模型</span><strong>GPT-5 · enterprise</strong></div>
        <div><span>MCP 版本</span><strong>{tool.version}</strong></div>
      </div>
      <InlineNotice tone="danger" title="AI 回复受到影响" description={error.summary} />
      <div className="conversation-trace">
        <div className="trace-line user"><span>用户</span><div><strong>用户原始问题</strong><p>{error.userMessage}</p></div></div>
        <div className="trace-line assistant"><span>AI</span><div><strong>AI 调用决策</strong><p>{error.llmMessage}</p><small>选择原因：用户意图与工具描述匹配度 92%，且满足前置参数要求。</small></div></div>
        <div className="trace-line tool"><span>MCP</span><div><strong>{tool.displayName} · 请求参数</strong><pre>{error.toolInput}</pre></div></div>
        <div className="trace-line error"><span>错误</span><div><strong>工具返回</strong><pre>{error.toolOutput}</pre><p>{error.impact}</p></div></div>
      </div>
      <div className="fix-suggestion">
        <WandSparkles size={20} />
        <div><strong>建议修复方式</strong><p>{error.category === "鉴权失败" ? "在调用前检查令牌有效期；对 invalid_token 返回可执行的重新授权链接；避免自动重试不可恢复的 401。" : "调整网关超时并对大数据集启用采样；同时向模型返回可重试标记和文字降级结果。"}</p></div>
      </div>
    </Modal>
  );
}

function McpManualTest({ tool, notify }: { tool: McpTool; notify: (title: string, detail?: string) => void }) {
  const [payload, setPayload] = useState(`{\n  "title": "2026 年各产品线收入",\n  "data": [\n    {"label": "企业版", "value": 1280},\n    {"label": "团队版", "value": 860}\n  ],\n  "theme": "brand"\n}`);
  const [mode, setMode] = useState<"success" | "error">("success");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [strongAuthOpen, setStrongAuthOpen] = useState(false);
  const [authorizedThisCall, setAuthorizedThisCall] = useState(false);
  const runCall = () => {
    setLoading(true);
    setResult(null);
    window.setTimeout(() => {
      setLoading(false);
      setResult(mode === "success"
        ? `{\n  "assetUrl": "https://assets.example.com/chart/7fd2.png",\n  "width": 1280,\n  "height": 720,\n  "altText": "企业版收入 1280，团队版收入 860"\n}`
        : `{\n  "error": {\n    "code": "MCP-PARAM-422",\n    "message": "data 至少需要两个有效分类",\n    "retryable": false\n  }\n}`);
      notify(mode === "success" ? "调用成功" : "已生成模拟错误", mode === "success" ? "本次调用耗时 684ms，消耗 1,126 Token。" : "错误契约和模型可读性检查已完成。");
      setAuthorizedThisCall(false);
    }, 650);
  };
  const run = () => {
    if (tool.authMode === "强鉴权" && !authorizedThisCall) {
      setStrongAuthOpen(true);
      return;
    }
    runCall();
  };
  return (
    <div className="test-workbench">
      <Panel title="测试请求" description={`目标：${tool.displayName} · ${tool.version}`}
        action={<div className="segmented"><button className={mode === "success" ? "active" : ""} onClick={() => setMode("success")}>正常调用</button><button className={mode === "error" ? "active" : ""} onClick={() => setMode("error")}>模拟报错</button></div>}>
        <label className="code-editor"><span>输入参数</span><textarea value={payload} onChange={(event) => setPayload(event.target.value)} spellCheck={false} /></label>
        <div className="test-options">
          <label><span>环境</span><select><option>研发沙盒</option><option>预发布环境</option></select></label>
          <label><span>AI 客户端</span><select><option>ChatGPT Enterprise</option><option>Claude Desktop</option></select></label>
          <label><span>超时</span><input value="3000 ms" readOnly /></label>
        </div>
        <LoadingButton loading={loading} onClick={run}>{loading ? "正在调用…" : "执行测试调用"}</LoadingButton>
      </Panel>
      <Panel title="调用结果" description="展示原始输出、Trace 与性能信息">
        {result ? (
          <>
            <div className={`test-status ${mode === "success" ? "status-success" : "status-error"}`}>
              {mode === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <div><strong>{mode === "success" ? "调用成功" : "调用返回预期错误"}</strong><span>{mode === "success" ? "HTTP 200 · 684ms" : "HTTP 422 · 126ms"}</span></div>
            </div>
            <div className="code-block"><CopyButton text={result} onCopied={() => notify("结果已复制")} /><pre>{result}</pre></div>
            <div className="trace-stats">
              <div><span>输入 Token</span><strong>486</strong></div>
              <div><span>输出 Token</span><strong>640</strong></div>
              <div><span>服务耗时</span><strong>{mode === "success" ? "684ms" : "126ms"}</strong></div>
              <div><span>Trace ID</span><strong>tr_8fa29c</strong></div>
            </div>
          </>
        ) : (
          <EmptyState title="等待执行测试" description="左侧输入参数并执行后，将在这里展示完整结果。" />
        )}
      </Panel>
      {strongAuthOpen && <StrongAuthModal onClose={() => setStrongAuthOpen(false)} onAuthorize={() => { setStrongAuthOpen(false); setAuthorizedThisCall(true); window.setTimeout(runCall, 0); }} />}
    </div>
  );
}

function StrongAuthModal({ onClose, onAuthorize }: { onClose: () => void; onAuthorize: () => void }) {
  const [password, setPassword] = useState("");
  return (
    <Modal title="本轮强鉴权" subtitle="该 MCP 属于高风险或风控敏感工具，每次调用都必须重新输入密码。" onClose={onClose}
      footer={<><Button tone="secondary" onClick={onClose}>取消调用</Button><Button disabled={!password} onClick={onAuthorize}>授权本轮调用</Button></>}>
      <InlineNotice tone="warning" title="一次性授权" description="密码仅用于完成本轮调用授权，不会保存、不会复用到下一次调用，也不会写入 Trace 日志。" />
      <label className="form-block strong-auth-field"><span>调用密码</span><input type="password" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入本轮调用密码" /></label>
      <div className="strong-auth-facts"><span>风险等级<strong>高风险</strong></span><span>授权有效期<strong>仅本轮调用</strong></span><span>日志记录<strong>仅记录授权结果</strong></span></div>
    </Modal>
  );
}

function McpVersions({ tool, notify, createVersion }: { tool: McpTool; notify: (title: string) => void; createVersion: (id: string, version: string, detail: string) => void }) {
  const [compareVersion, setCompareVersion] = useState<string | null>(null);
  return (
    <>
    <Panel title="版本记录" description="查看工具描述、Schema 和运行配置的历史变更"
      action={<Button icon={<Plus size={15} />} onClick={() => { createVersion(tool.id, "v3.1.0-draft", "补充工具边界和异常处理说明"); notify("新版本草稿已创建", "版本已进入测试中状态，可继续进行契约验证。"); }}>创建新版本</Button>}>
      <div className="timeline">
        {[
          [tool.version, "当前生产版本", "优化工具描述，补充不适合调用的场景；P95 延迟降低 12%。", "今天 09:42", "高远", "success"],
          ["v2.4.0", "已归档", "增加 brand 主题和无障碍替代文本字段。", "2026-07-05", "何川", "neutral"],
          ["v2.3.1", "已回滚", "尝试切换到新渲染引擎，因长尾延迟回滚。", "2026-06-18", "高远", "danger"],
          ["v2.3.0", "已归档", "支持水平条形图和数值标签。", "2026-05-29", "周扬", "neutral"],
        ].map(([version, status, detail, date, owner, tone]) => (
          <div key={version}>
            <span className="timeline-dot" />
            <div><strong>{version}</strong><Badge tone={tone as "success" | "neutral" | "danger"}>{status}</Badge><p>{detail}</p><small>{date} · {owner}</small></div>
            <Button tone="ghost" size="sm" onClick={() => setCompareVersion(version)}>版本对比</Button>
          </div>
        ))}
      </div>
    </Panel>
    {compareVersion && (
      <Modal title={`版本对比：${compareVersion} ↔ v2.4.0`} subtitle="逐项查看工具描述、Schema 与运行配置变化" onClose={() => setCompareVersion(null)} size="lg"
        footer={<><Button tone="secondary" onClick={() => setCompareVersion(null)}>关闭</Button><Button onClick={() => { setCompareVersion(null); notify("已基于对比结果创建变更草稿"); }}>基于此版本创建草稿</Button></>}>
        <div className="version-diff">
          <div><Badge tone="danger">删除</Badge><code>“生成任意图表”</code><p>描述范围过宽，可能与折线图、饼状图工具发生竞争。</p></div>
          <div><Badge tone="success">新增</Badge><code>“仅用于 2～50 个分类的横向或纵向比较”</code><p>补充适用数据规模和任务边界。</p></div>
          <div><Badge tone="success">新增字段</Badge><code>accessibility_summary: string</code><p>返回适合读屏软件使用的图表摘要。</p></div>
          <div><Badge tone="warning">配置变化</Badge><code>timeout: 2500ms → 3000ms</code><p>为品牌字体加载保留额外时间，并同步调整 P95 告警线。</p></div>
        </div>
      </Modal>
    )}
    </>
  );
}

function EditMcpModal({
  tool,
  description,
  setDescription,
  onClose,
  onSave,
}: {
  tool: McpTool;
  description: string;
  setDescription: (value: string) => void;
  onClose: () => void;
  onSave: (patch: Partial<McpTool>) => void;
}) {
  const [section, setSection] = useState("basic");
  const [displayName, setDisplayName] = useState(tool.displayName);
  const [serviceId, setServiceId] = useState(tool.serviceId);
  const [authMode, setAuthMode] = useState<McpTool["authMode"]>(tool.authMode);
  const [workflowName, setWorkflowName] = useState(tool.workflowName);
  const [infraName, setInfraName] = useState(tool.infraName);
  const [productOwner, setProductOwner] = useState(tool.owners.product);
  const [developerOwner, setDeveloperOwner] = useState(tool.owners.developer);
  const [opsOwner, setOpsOwner] = useState(tool.owners.ops);
  const save = () => onSave({
    displayName,
    serviceId,
    description,
    authMode,
    workflowName,
    infraName,
    owners: { product: productOwner, developer: developerOwner, ops: opsOwner },
  });
  return (
    <Modal title={`编辑 ${tool.displayName}`} subtitle="保存后生成配置草稿，不会直接修改生产版本" onClose={onClose} size="xl"
      footer={<><Button tone="secondary" onClick={onClose}>取消</Button><Button icon={<Save size={15} />} onClick={save}>保存草稿</Button></>}>
      <div className="edit-layout">
        <nav>
          {[["basic", "基本信息"], ["description", "工具描述"], ["auth", "鉴权配置"], ["workflow", "工作流展示"], ["owners", "负责人"]].map(([id, label]) => (
            <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}>{label}</button>
          ))}
        </nav>
        <div className="edit-content">
          {section === "basic" && <div className="form-grid"><label><span>MCP 唯一名称</span><input value={tool.name} readOnly /></label><label><span>显示名称</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><label><span>所属 Service</span><select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span>当前版本</span><input value={tool.version} readOnly /></label></div>}
          {section === "description" && <><label className="form-block"><span>工具描述 Prompt</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={8} /></label><InlineNotice tone="info" title="AI 优化建议" description="建议明确禁止调用的场景，并把“多个类别”改为可执行的数量约束，例如 2～50 个分类。" /></>}
          {section === "auth" && <div className="auth-options">{(["平台 OpenAPI", "用户 OAuth 2.0", "用户密钥", "强鉴权", "无需鉴权"] as McpTool["authMode"][]).map((item) => <label key={item} className={item === "强鉴权" ? "high-risk-auth" : ""}><input type="radio" name="auth" checked={item === authMode} onChange={() => setAuthMode(item)} /><KeyRound size={19} /><span><strong>{item}</strong><small>{item === "平台 OpenAPI" ? "凭证由平台加密托管，所有授权用户共享调用" : item === "用户 OAuth 2.0" ? "每位用户首次调用时完成独立授权" : item === "用户密钥" ? "适用于受控的内部或低风险工具" : item === "强鉴权" ? "高风险或风控敏感工具，每次调用都要求用户输入密码，仅本轮有效" : "仅允许低风险和隔离网络服务"}</small></span></label>)}</div>}
          {section === "workflow" && <div className="form-grid"><label><span>LLM 工作流调用名称</span><input value={workflowName} onChange={(event) => setWorkflowName(event.target.value)} /></label><label><span>Infra 工作流展示名称</span><input value={infraName} onChange={(event) => setInfraName(event.target.value)} /></label><label className="span-2"><span>Infra 展示描述</span><textarea defaultValue="根据结构化数据生成企业品牌规范的图表，并返回图片地址和无障碍摘要。" /></label></div>}
          {section === "owners" && <div className="form-grid"><label><span>产品负责人</span><input value={productOwner} onChange={(event) => setProductOwner(event.target.value)} /></label><label><span>开发负责人</span><input value={developerOwner} onChange={(event) => setDeveloperOwner(event.target.value)} /></label><label><span>运维负责人</span><input value={opsOwner} onChange={(event) => setOpsOwner(event.target.value)} /></label><label><span>安全负责人</span><input defaultValue="徐安" /></label></div>}
        </div>
      </div>
    </Modal>
  );
}

export function WorkspaceSelect({
  value,
  onChange,
}: {
  value: WorkspaceId;
  onChange: (id: WorkspaceId) => void;
}) {
  return (
    <SelectField value={value} onChange={(next) => onChange(next as WorkspaceId)}>
      {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
    </SelectField>
  );
}
