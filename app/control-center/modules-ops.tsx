"use client";

import {
  Activity,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  CloudCog,
  Code2,
  FileWarning,
  Gauge,
  KeyRound,
  LockKeyhole,
  Network,
  Plus,
  Radio,
  Rocket,
  Server,
  ShieldAlert,
  ShieldCheck,
  TestTube2,
  Webhook,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { errorRecords, mcps, services, workspaces } from "./data";
import { MiniBars, TrendChart } from "./charts";
import { useCatalog } from "./store";
import {
  Badge,
  Button,
  CopyButton,
  EmptyState,
  InlineNotice,
  LoadingButton,
  MetricCard,
  Modal,
  PageIntro,
  Panel,
  SearchField,
  SelectField,
  Tabs,
} from "./ui";
import { WorkspaceSelect } from "./modules-core";
import type { McpTool, NavigationIntent, WorkspaceId } from "./types";

const serviceName = (id: string) => services.find((item) => item.id === id)?.name ?? id;
const toolName = (id: string) => mcps.find((item) => item.id === id)?.displayName ?? id;

export function AnalyticsPage({
  workspaceId,
  setWorkspaceId,
  initialDate,
  navigate,
  notify,
}: {
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
  initialDate?: string;
  navigate: (intent: NavigationIntent) => void;
  notify: (title: string, detail?: string) => void;
}) {
  const [datePreset, setDatePreset] = useState(initialDate ?? "近 30 天");
  const [fromDate, setFromDate] = useState("2026-06-23");
  const [toDate, setToDate] = useState("2026-07-22");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("calls-desc");
  const periodDays = Math.max(1, Math.round((new Date(`${toDate}T00:00:00`).getTime() - new Date(`${fromDate}T00:00:00`).getTime()) / 86400000) + 1);
  const periodLabel = `${fromDate} 至 ${toDate}`;
  const rows = useMemo(() => {
    const factor = periodDays / 30;
    return mcps
      .filter((item) => item.workspaceIds.includes(workspaceId))
      .filter((item) => !query || `${item.displayName}${item.name}`.toLowerCase().includes(query.toLowerCase()))
      .map((item) => ({ ...item, periodCalls: Math.max(1, Math.round(item.calls * factor)) }))
      .sort((a, b) => sort === "success-desc" ? b.successRate - a.successRate : sort === "latency-desc" ? b.latency - a.latency : sort === "tokens-desc" ? b.avgTokens - a.avgTokens : b.periodCalls - a.periodCalls);
  }, [workspaceId, periodDays, query, sort]);
  const total = rows.reduce((sum, item) => sum + item.periodCalls, 0);
  return (
    <>
      <PageIntro
        eyebrow="调用可观测性"
        title="调用分析"
        description="按日期和 Workspace 分析 MCP 使用量、模型选择、质量与性能表现。"
        actions={
          <>
            <WorkspaceSelect value={workspaceId} onChange={setWorkspaceId} />
            <SelectField value={datePreset} onChange={(value) => {
              setDatePreset(value);
              const end = new Date("2026-07-22T00:00:00");
              const days = value === "今天" ? 1 : value === "近 7 天" ? 7 : value === "近 15 天" ? 15 : value === "近 90 天" ? 90 : 30;
              const start = new Date(end);
              start.setDate(end.getDate() - days + 1);
              setFromDate(start.toISOString().slice(0, 10));
              setToDate(end.toISOString().slice(0, 10));
            }}>
              <option>今天</option><option>近 7 天</option><option>近 15 天</option><option>近 30 天</option><option>近 90 天</option>
            </SelectField>
            <label className="date-field"><span>开始</span><input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setDatePreset("自定义"); }} onInput={(event) => { setFromDate(event.currentTarget.value); setDatePreset("自定义"); }} /></label>
            <span className="date-separator">至</span>
            <label className="date-field"><span>结束</span><input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setDatePreset("自定义"); }} onInput={(event) => { setToDate(event.currentTarget.value); setDatePreset("自定义"); }} /></label>
            <Button tone="secondary" onClick={() => notify("分析报告已生成", "演示环境已准备下载文件，真实环境将导出当前筛选条件下的调用明细。")}>导出分析报告</Button>
          </>
        }
      />
      <div className="metric-grid metric-grid-4">
        <MetricCard label="统计周期调用" value={total.toLocaleString()} delta={`${periodLabel} · ${rows.length} 个 MCP`} icon={<Activity size={20} />} />
        <MetricCard label="平均成功率" value="98.6%" delta="较上一周期 +0.8%" tone="success" icon={<CheckCircle2 size={20} />} />
        <MetricCard label="平均响应时长" value="842ms" delta="P95 1,626ms" tone="warning" icon={<Gauge size={20} />} />
        <MetricCard label="平均 Token" value="1,268" delta="较上一周期 -4.2%" tone="info" icon={<Zap size={20} />} />
      </div>
      <div className="detail-grid">
        <Panel className="span-8" title="调用趋势" description={`${periodLabel} · 可点击趋势点切换到具体日期`}>
          <TrendChart
            values={[3280, 3650, 3480, 3920, 4170, 4380, 4510]}
            labels={["7/16", "7/17", "7/18", "7/19", "7/20", "7/21", "7/22"]}
            onPointClick={(index) => {
              const day = `2026-07-${String(16 + index).padStart(2, "0")}`;
              setFromDate(day);
              setToDate(day);
              setDatePreset("自定义");
            }}
          />
        </Panel>
        <Panel className="span-4" title="模型选择来源">
          <div className="source-list">
            {[
              ["AI 自动选择", "82.4%", 82, "purple"],
              ["工作流固定调用", "12.8%", 64, "blue"],
              ["用户手动触发", "3.6%", 36, "amber"],
              ["重试与降级", "1.2%", 18, "red"],
            ].map(([label, value, width, color]) => (
              <div key={String(label)}><span>{label}</span><strong>{value}</strong><i className={`bar-${color}`}><b style={{ width: `${width}%` }} /></i></div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="MCP 调用列表" description={`${periodLabel} 内各 MCP 的调用和质量数据`}>
        <div className="toolbar embedded">
          <SearchField value={query} onChange={setQuery} placeholder="搜索 MCP…" />
          <SelectField value={sort} onChange={setSort}>
            <option value="calls-desc">调用量从高到低</option>
            <option value="success-desc">成功率从高到低</option>
            <option value="latency-desc">响应时长从高到低</option>
            <option value="tokens-desc">Token 消耗从高到低</option>
          </SelectField>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>MCP 工具</th><th>Service</th><th>调用次数</th><th>成功率</th><th>平均响应</th><th>P95</th><th>平均 Token</th><th>AI 选择率</th><th>趋势</th></tr></thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={item.id} onClick={() => navigate({ page: "mcps", mcpId: item.id, detailTab: "analytics" })} className="clickable-row">
                  <td><strong>{item.displayName}</strong><small className="cell-sub">{item.name}</small></td>
                  <td><Badge tone="purple">{serviceName(item.serviceId)}</Badge></td>
                  <td><strong>{item.periodCalls.toLocaleString()}</strong></td>
                  <td><span className={item.successRate < 97 ? "value-danger" : "value-success"}>{item.successRate}%</span></td>
                  <td>{item.latency}ms</td>
                  <td>{Math.round(item.latency * 1.8)}ms</td>
                  <td>{item.avgTokens.toLocaleString()}</td>
                  <td>{(12 + index * 1.7).toFixed(1)}%</td>
                  <td><MiniBars values={[22 + index, 35, 28 + index * 2, 49, 56]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export function ErrorsPage({
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
  const { errors: liveErrors, resolveError } = useCatalog();
  const [from, setFrom] = useState("2026-07-15");
  const [to, setTo] = useState("2026-07-22");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("count-desc");
  const [errorQuery, setErrorQuery] = useState("");
  const [selected, setSelected] = useState<(typeof errorRecords)[number] | null>(null);
  const visible = [...liveErrors]
    .filter((item) => category === "all" || item.category === category)
    .sort((a, b) => sort === "resolve-desc" ? b.resolveMinutes - a.resolveMinutes : b.count - a.count);
  return (
    <>
      <PageIntro
        eyebrow="事故与错误治理"
        title="错误中心"
        description="按时间范围聚合 MCP 错误，明确影响、处理责任和完整调用上下文。"
        actions={<><WorkspaceSelect value={workspaceId} onChange={setWorkspaceId} /><Button tone="secondary" onClick={() => notify("错误报告已生成", "演示环境已准备下载文件，真实环境将从调用日志服务生成 CSV。")}>导出错误报告</Button></>}
      />
      <div className="metric-grid metric-grid-4">
        <MetricCard label="错误总数" value="306" delta="较上一周期 +14.2%" tone="danger" icon={<XCircle size={20} />} />
        <MetricCard label="高优先级" value="8" delta="P0 0 · P1 8" tone="warning" icon={<ShieldAlert size={20} />} />
        <MetricCard label="受影响 MCP" value="6" delta="覆盖 4 个 Service" icon={<FileWarning size={20} />} />
        <MetricCard label="平均解决时长" value="1h 42m" delta="较上月缩短 12%" tone="success" icon={<Clock3 size={20} />} />
      </div>
      <div className="error-overview">
        <Panel title="错误趋势" description={`${from} 至 ${to}`}>
          <TrendChart values={[21, 32, 28, 47, 39, 58, 46]} labels={["7/16", "7/17", "7/18", "7/19", "7/20", "7/21", "7/22"]} />
        </Panel>
        <Panel title="错误类型分布">
          <div className="category-list">
            {[
              ["鉴权失败", 38, "red"],
              ["服务超时", 27, "amber"],
              ["响应格式错误", 19, "purple"],
              ["参数错误", 10, "blue"],
              ["依赖异常", 6, "neutral"],
            ].map(([label, value, tone]) => (
              <button key={String(label)} onClick={() => setCategory(String(label))}>
                <i className={`dot-${tone}`} /><span>{label}</span><b>{value}%</b><ChevronRight size={15} />
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="错误列表" description="点击告警查看错误摘要，点击 MCP 进入报错分析">
        <div className="toolbar embedded">
          <label className="date-field"><span>开始日期</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <span className="date-separator">至</span>
          <label className="date-field"><span>结束日期</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <SelectField value={category} onChange={setCategory}>
            <option value="all">全部错误原因</option>
            {["鉴权失败", "参数错误", "服务超时", "依赖异常", "响应格式错误"].map((item) => <option key={item}>{item}</option>)}
          </SelectField>
          <SelectField value={sort} onChange={setSort}>
            <option value="count-desc">报错数从高到低</option>
            <option value="resolve-desc">解决时长从高到低</option>
          </SelectField>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>告警 / MCP</th><th>错误原因</th><th>报错数</th><th>解决时长</th><th>运维负责人</th><th>开发负责人</th><th>产品负责人</th><th>状态</th><th /></tr></thead>
            <tbody>
              {visible.map((error) => {
                const tool = mcps.find((item) => item.id === error.mcpId)!;
                return (
                  <tr key={error.id}>
                    <td><button className="error-title" onClick={() => navigate({ page: "mcps", mcpId: tool.id, detailTab: "errors" })}><Badge tone="danger">{error.severity}</Badge><span><strong>{error.message}</strong><small>{tool.displayName} · {error.code}</small></span></button></td>
                    <td><Badge tone="warning">{error.category}</Badge></td>
                    <td><strong>{error.count}</strong></td>
                    <td>{Math.floor(error.resolveMinutes / 60)}h {error.resolveMinutes % 60}m</td>
                    <td>{tool.owners.ops}</td><td>{tool.owners.developer}</td><td>{tool.owners.product}</td>
                    <td><Badge tone={error.status === "已解决" ? "success" : "warning"}>{error.status}</Badge></td>
                    <td><Button tone="ghost" size="sm" onClick={() => setSelected(error)}>告警详情</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="错误码定位" description="只知道错误码时输入查询，定位它属于哪个 MCP、哪个 Service 和哪类故障。">
        <div className="self-check-layout">
          <SearchField value={errorQuery} onChange={setErrorQuery} placeholder="输入错误码，例如 MCP-AUTH-401" />
          <div className="error-code-list">
            {liveErrors
              .filter((error) => `${error.code} ${error.category} ${error.message} ${toolName(error.mcpId)}`.toLowerCase().includes(errorQuery.toLowerCase()))
              .map((error) => (
                <button className="error-code-card" key={error.code} onClick={() => navigate({ page: "mcps", mcpId: error.mcpId, detailTab: "errors" })}>
                  <div className="error-code-card-head">
                    <code>{error.code}</code>
                    <Badge tone={error.severity === "P1" ? "danger" : "warning"}>{error.category}</Badge>
                  </div>
                  <strong>{error.message}</strong>
                  <p>归属范围：{toolName(error.mcpId)} · {serviceName(mcps.find((item) => item.id === error.mcpId)?.serviceId ?? "")}</p>
                  <span>错误情况：{error.impact} · 进入 MCP 错误码自查 <ChevronRight size={14} /></span>
                </button>
              ))}
            {liveErrors.filter((error) => `${error.code} ${error.category} ${error.message} ${toolName(error.mcpId)}`.toLowerCase().includes(errorQuery.toLowerCase())).length === 0 && (
              <EmptyState title="没有定位到错误码" description="请确认错误码是否完整，例如 MCP-AUTH-401。" />
            )}
          </div>
        </div>
      </Panel>
      {selected && (
        <Modal title={selected.message} subtitle={`${selected.code} · ${toolName(selected.mcpId)}`} onClose={() => setSelected(null)} size="lg"
          footer={<><Button tone="secondary" onClick={() => setSelected(null)}>关闭</Button>{selected.status !== "已解决" && <Button tone="secondary" onClick={() => { resolveError(selected.id); setSelected(null); notify("错误已标记为已解决", `${selected.code} 已更新状态。`); }}>标记已解决</Button>}<Button onClick={() => navigate({ page: "mcps", mcpId: selected.mcpId, detailTab: "errors" })}>进入 MCP 报错分析</Button></>}>
          <div className="incident-detail">
            <div className="incident-head"><Badge tone="danger">{selected.severity}</Badge><Badge tone="warning">{selected.status}</Badge><span>最近发生：{selected.lastAt}</span></div>
            <InlineNotice tone="danger" title="影响说明" description={selected.impact} />
            <dl className="info-list">
              <div><dt>首次发生</dt><dd>{selected.firstAt}</dd></div>
              <div><dt>发生次数</dt><dd>{selected.count} 次</dd></div>
              <div><dt>平均解决时长</dt><dd>{selected.resolveMinutes} 分钟</dd></div>
              <div><dt>受影响版本</dt><dd>{mcps.find((item) => item.id === selected.mcpId)?.version}</dd></div>
            </dl>
          </div>
        </Modal>
      )}
    </>
  );
}


const publishSteps = [
  { id: "basic", label: "基础信息", description: "归属与责任" },
  { id: "technical", label: "技术配置", description: "连接与契约" },
  { id: "sandbox", label: "沙盒验证", description: "自动化测试" },
  { id: "approval", label: "审批上架", description: "产品与安全" },
  { id: "release", label: "灰度发布", description: "范围与监控" },
];

export function PublishPage({
  workspaceId,
  setWorkspaceId,
  notify,
}: {
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
  notify: (title: string, detail?: string) => void;
}) {
  const { createMcp } = useCatalog();
  const [step, setStep] = useState(0);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const next = () => {
    if (step === 2 && !validated) {
      notify("请先完成沙盒验证", "五类核心用例通过后才能进入审批。");
      return;
    }
    setStep((current) => Math.min(publishSteps.length - 1, current + 1));
  };
  const runValidation = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setValidated(true);
      notify("沙盒验证完成", "18 个用例通过，1 个性能建议，不阻塞上架。");
    }, 850);
  };
  return (
    <>
      <PageIntro
        eyebrow="生命周期管理"
        title="上架新 MCP"
        description="通过标准化配置、沙盒验证、审批和灰度流程，将 MCP 安全引入企业环境。"
        actions={<><WorkspaceSelect value={workspaceId} onChange={setWorkspaceId} /><Badge tone="warning">草稿自动保存</Badge></>}
      />
      <div className="stepper">
        {publishSteps.map((item, index) => (
          <button key={item.id} className={`${index === step ? "active" : ""} ${index < step ? "done" : ""}`} onClick={() => index <= step && setStep(index)}>
            <span>{index < step ? <Check size={16} /> : index + 1}</span>
            <div><strong>{item.label}</strong><small>{item.description}</small></div>
            {index < publishSteps.length - 1 && <i />}
          </button>
        ))}
      </div>
      <Panel className="publish-panel">
        {step === 0 && <PublishBasic />}
        {step === 1 && <PublishTechnical />}
        {step === 2 && <PublishSandbox validated={validated} loading={loading} onRun={runValidation} />}
        {step === 3 && <PublishApproval />}
        {step === 4 && <PublishRelease workspaceId={workspaceId} />}
        <div className="wizard-footer">
          <Button tone="secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>上一步</Button>
          <span>步骤 {step + 1} / {publishSteps.length}</span>
          {step < publishSteps.length - 1 ? (
            <Button onClick={next}>保存并继续</Button>
          ) : (
            <Button icon={<Rocket size={16} />} disabled={published} onClick={() => {
              const draft: McpTool = {
                id: "marketing-copy",
                name: "generate_marketing_copy",
                displayName: "营销文案生成",
                serviceId: "chart",
                workspaceIds: [workspaceId, "sandbox"],
                status: "灰度中",
                version: "v0.1.0",
                calls: 0,
                successRate: 100,
                avgTokens: 0,
                latency: 0,
                errorRate: 0,
                score: 78,
                updatedAt: "刚刚",
                description: "根据产品卖点、目标受众和渠道要求生成可审核的营销文案。",
                owners: { product: "陈希", developer: "高远", ops: "林晓" },
                clients: ["内部 Copilot"],
                authMode: "平台 OpenAPI",
                transport: "Streamable HTTP",
                workflowName: "marketing.copy.generate",
                infraName: "内容生成 · 营销文案",
                inputSchema: '{"type":"object","required":["product","audience"]}',
                outputSchema: '{"type":"object","required":["content","risk_flags"]}',
              };
              createMcp(draft);
              setPublished(true);
              notify("灰度发布已启动", "营销文案生成已加入 MCP 资产目录，当前向研发沙盒和 5% 内部用户开放。");
            }}>{published ? "已进入灰度" : "开始灰度发布"}</Button>
          )}
        </div>
      </Panel>
    </>
  );
}

function PublishBasic() {
  return (
    <div className="wizard-content">
      <div className="wizard-heading"><span><CircleDot size={22} /></span><div><h2>基础信息</h2><p>定义 MCP 的业务归属、展示方式和责任人。</p></div></div>
      <div className="form-grid">
        <label><span>MCP 名称 *</span><input defaultValue="generate_marketing_copy" /></label>
        <label><span>中文显示名称 *</span><input defaultValue="营销文案生成" /></label>
        <label><span>所属 Service *</span><select defaultValue="图表生成">{services.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
        <label><span>业务线 *</span><select><option>企业效率</option><option>数据智能</option></select></label>
        <label className="span-2"><span>一句话简介 *</span><textarea defaultValue="根据产品卖点、受众和渠道要求生成可审核的营销文案。" /></label>
        <label><span>产品负责人 *</span><input defaultValue="陈希" /></label>
        <label><span>开发负责人 *</span><input defaultValue="高远" /></label>
        <label><span>运维负责人 *</span><input defaultValue="林晓" /></label>
        <label><span>风险等级 *</span><select><option>中风险</option><option>低风险</option><option>高风险</option></select></label>
      </div>
    </div>
  );
}

function PublishTechnical() {
  const [transport, setTransport] = useState("http");
  return (
    <div className="wizard-content">
      <div className="wizard-heading"><span><Code2 size={22} /></span><div><h2>技术配置</h2><p>配置服务连接、Transport、鉴权和工具契约。</p></div></div>
      <div className="transport-options">
        {[["http", "Streamable HTTP", "推荐用于生产远程服务"], ["sse", "SSE", "兼容持续推送服务"], ["stdio", "stdio", "适用于本地进程"]].map(([id, title, detail]) => (
          <button key={id} className={transport === id ? "active" : ""} onClick={() => setTransport(id)}><Network size={20} /><strong>{title}</strong><small>{detail}</small>{transport === id && <Check size={16} />}</button>
        ))}
      </div>
      <div className="form-grid">
        <label><span>服务地址 *</span><input defaultValue="https://service.example.com/content" /></label>
        <label><span>健康检查地址 *</span><input defaultValue="https://service.example.com/content/health" /></label>
        <label><span>启动命令</span><input defaultValue="node dist/server.js" /></label>
        <label><span>超时时间</span><input defaultValue="3000" /><small>毫秒</small></label>
        <label><span>鉴权方式 *</span><select><option>平台 OpenAPI</option><option>用户 OAuth 2.0</option><option>用户密钥</option><option>强鉴权 · 每次调用输入密码</option></select></label>
        <label><span>版本号 *</span><input defaultValue="v1.0.0" /></label>
        <label className="span-2"><span>工具描述 *</span><textarea rows={5} defaultValue="当用户明确要求为营销渠道生成文案，并已提供产品卖点、目标受众和渠道时调用。输出必须经过用户确认后才能发布。" /></label>
      </div>
    </div>
  );
}

function PublishSandbox({ validated, loading, onRun }: { validated: boolean; loading: boolean; onRun: () => void }) {
  const cases = [
    ["正常调用", "验证标准参数下的结果质量", "通过"],
    ["缺少必填参数", "验证错误码和参数提示", "通过"],
    ["鉴权失效", "验证重新授权引导", "通过"],
    ["服务超时", "验证降级和重试策略", "通过"],
    ["模型误调用", "验证描述边界和拒绝策略", validated ? "通过" : "待执行"],
  ];
  return (
    <div className="wizard-content">
      <div className="wizard-heading"><span><TestTube2 size={22} /></span><div><h2>沙盒验证</h2><p>运行契约、连接、安全和模型选择测试。</p></div></div>
      <div className="sandbox-head">
        <div><span className={`sandbox-pulse ${validated ? "done" : ""}`}><TestTube2 size={28} /></span><div><strong>{validated ? "沙盒验证通过" : "准备执行自动化验证"}</strong><p>{validated ? "18 个用例通过，1 个性能建议。" : "预计 20～40 秒，不会访问生产数据。"}</p></div></div>
        <LoadingButton loading={loading} onClick={onRun}>{validated ? "重新验证" : "开始验证"}</LoadingButton>
      </div>
      <div className="test-case-list">
        {cases.map(([title, detail, status]) => (
          <div key={title}><span className={status === "通过" ? "passed" : ""}>{status === "通过" ? <Check size={15} /> : <CircleDot size={15} />}</span><div><strong>{title}</strong><small>{detail}</small></div><Badge tone={status === "通过" ? "success" : "neutral"}>{status}</Badge></div>
        ))}
      </div>
      {validated && <InlineNotice tone="warning" title="性能建议" description="并发 50 时 P95 为 2.4 秒，建议在灰度期重点监控长文本输入。" />}
    </div>
  );
}

function PublishApproval() {
  return (
    <div className="wizard-content">
      <div className="wizard-heading"><span><ShieldCheck size={22} /></span><div><h2>审批上架</h2><p>提交产品、技术、安全和运维审批。</p></div></div>
      <div className="approval-grid">
        {[
          ["产品评审", "确认场景、描述和用户体验", "陈希", "已通过", "success"],
          ["技术评审", "确认契约、性能和回滚方案", "高远", "已通过", "success"],
          ["安全评审", "确认权限、凭证和数据范围", "徐安", "待审批", "warning"],
          ["运维评审", "确认监控、告警和响应责任", "林晓", "待审批", "warning"],
        ].map(([title, detail, owner, status, tone]) => (
          <div key={title}><span><ShieldCheck size={20} /></span><div><strong>{title}</strong><p>{detail}</p><small>审批人：{owner}</small></div><Badge tone={tone as "success" | "warning"}>{status}</Badge></div>
        ))}
      </div>
      <label className="form-block"><span>上架说明</span><textarea rows={4} defaultValue="首版支持微信公众号、邮件和官网三个渠道。写入发布系统的能力将在后续版本单独申请。" /></label>
    </div>
  );
}

function PublishRelease({ workspaceId }: { workspaceId: WorkspaceId }) {
  return (
    <div className="wizard-content">
      <div className="wizard-heading"><span><Rocket size={22} /></span><div><h2>灰度发布</h2><p>选择发布范围、观察指标和自动回滚条件。</p></div></div>
      <div className="release-layout">
        <div className="release-card">
          <h3>发布范围</h3>
          {workspaces.map((workspace) => (
            <label className="workspace-check" key={workspace.id}><input type="checkbox" defaultChecked={workspace.id === workspaceId || workspace.id === "sandbox"} /><span style={{ background: workspace.color }} /><div><strong>{workspace.name}</strong><small>{workspace.environment}</small></div></label>
          ))}
        </div>
        <div className="release-card">
          <h3>灰度策略</h3>
          <label className="form-block"><span>首批用户比例</span><input type="range" defaultValue="5" min="1" max="100" /><strong>5%</strong></label>
          <label className="form-block"><span>观察窗口</span><select><option>2 小时</option><option>6 小时</option><option>24 小时</option></select></label>
        </div>
        <div className="release-card">
          <h3>自动回滚条件</h3>
          <label className="rollback-check"><input type="checkbox" defaultChecked /><span>成功率低于 97%</span></label>
          <label className="rollback-check"><input type="checkbox" defaultChecked /><span>P95 超过 3 秒</span></label>
          <label className="rollback-check"><input type="checkbox" defaultChecked /><span>P1 错误超过 3 次</span></label>
        </div>
      </div>
      <InlineNotice tone="info" title="发布前最后检查" description="沙盒验证已通过；仍有 2 项审批等待完成。审批通过后可立即开始灰度。" />
    </div>
  );
}

export function MaintenancePage({
  workspaceId,
  setWorkspaceId,
  notify,
}: {
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
  notify: (title: string, detail?: string) => void;
}) {
  const [tab, setTab] = useState("servers");
  const [pinging, setPinging] = useState(false);
  const [incident, setIncident] = useState(false);
  const [configDialog, setConfigDialog] = useState<{ kind: "server" | "routes" | "service" | "alert" | "local"; title: string } | null>(null);
  const ping = () => {
    setPinging(true);
    window.setTimeout(() => {
      setPinging(false);
      notify("服务连接正常", "TLS 证书有效，健康检查返回 HTTP 200，总耗时 86ms。");
    }, 700);
  };
  return (
    <>
      <PageIntro
        eyebrow="基础设施与网关"
        title="服务维护"
        description="统一管理服务器、网关、环境、告警、凭证和服务异常。"
        actions={<><WorkspaceSelect value={workspaceId} onChange={setWorkspaceId} /><Button icon={<Plus size={16} />} onClick={() => setConfigDialog({ kind: "server", title: "新增服务器" })}>新增服务器</Button></>}
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: "servers", label: "服务器配置" },
          { id: "workspaces", label: "Workspace 环境" },
          { id: "alerts", label: "告警通知" },
          { id: "credentials", label: "安全与凭证" },
          { id: "local", label: "本地 MCP 配置" },
          { id: "risk", label: "上线风险日志" },
          { id: "incidents", label: "服务异常日志", count: 3 },
        ]}
      />
      {tab === "servers" && (
        <div className="detail-grid">
          <Panel className="span-8" title="服务器定义" description="类似 MCPMux 的集中网关与上游服务器管理"
            action={<LoadingButton loading={pinging} onClick={ping}>{pinging ? "正在 Ping…" : "手动 Ping"}</LoadingButton>}>
            <div className="server-card">
              <div className="server-status"><span><Server size={22} /></span><div><strong>mcp-gateway-prod-01</strong><small>生产主网关 · 华北 A 区</small></div><Badge tone="success" dot>在线</Badge></div>
              <dl className="info-list">
                <div><dt>网关地址</dt><dd>https://gateway.example.com</dd></div>
                <div><dt>健康检查</dt><dd>/healthz · 每 30 秒</dd></div>
                <div><dt>服务器定义</dt><dd>12 个 Service · 39 个 MCP</dd></div>
                <div><dt>Transport</dt><dd>Streamable HTTP / SSE</dd></div>
                <div><dt>维护人员</dt><dd>林晓、陈宇</dd></div>
                <div><dt>证书到期</dt><dd>2026-11-28</dd></div>
              </dl>
              <div className="server-actions"><Button tone="secondary" size="sm" onClick={() => setConfigDialog({ kind: "server", title: "编辑生产主网关" })}>编辑配置</Button><Button tone="ghost" size="sm" onClick={() => setConfigDialog({ kind: "routes", title: "网关路由表" })}>查看路由</Button><Button tone="ghost" size="sm" onClick={ping}>运行诊断</Button></div>
            </div>
          </Panel>
          <Panel className="span-4" title="实时健康">
            <div className="health-list">
              {[
                ["网关可用性", "99.99%", "success"],
                ["活跃连接", "286", "info"],
                ["P95 网关延迟", "42ms", "success"],
                ["凭证解密失败", "0", "success"],
                ["待处理告警", "3", "warning"],
              ].map(([label, value, tone]) => <div key={label}><i className={`dot-${tone}`} /><span>{label}</span><strong>{value}</strong></div>)}
            </div>
          </Panel>
          <Panel className="span-12" title="上游 Service">
            <div className="table-scroll">
              <table className="data-table"><thead><tr><th>Service</th><th>托管地址</th><th>MCP 数量</th><th>维护人员</th><th>健康状态</th><th>最近检查</th><th /></tr></thead>
                <tbody>{services.filter((item) => item.workspaceIds.includes(workspaceId)).map((service, index) => <tr key={service.id}><td><strong>{service.name}</strong><small className="cell-sub">{service.code}</small></td><td>https://service.example.com/{service.id}/mcp</td><td>{mcps.filter((item) => item.serviceId === service.id).length}</td><td>{service.owner}</td><td><Badge tone={index === 2 ? "warning" : "success"} dot>{index === 2 ? "降级" : "正常"}</Badge></td><td>{index + 1} 分钟前</td><td><Button tone="ghost" size="sm" onClick={() => setConfigDialog({ kind: "service", title: `${service.name} 服务配置` })}>配置</Button></td></tr>)}</tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
      {tab === "workspaces" && <WorkspaceEnvironment workspaceId={workspaceId} notify={notify} />}
      {tab === "alerts" && <AlertConfiguration notify={notify} openConfig={(title) => setConfigDialog({ kind: "alert", title })} />}
      {tab === "credentials" && <CredentialConfiguration notify={notify} />}
      {tab === "local" && <LocalMcpConfig notify={notify} openConfig={(title) => setConfigDialog({ kind: "local", title })} />}
      {tab === "risk" && <RiskLogs />}
      {tab === "incidents" && <IncidentLogs onOpen={() => setIncident(true)} />}
      {incident && <IncidentModal onClose={() => setIncident(false)} notify={notify} />}
      {configDialog && <MaintenanceConfigModal dialog={configDialog} onClose={() => setConfigDialog(null)} onSave={() => { notify("维护配置已保存", `${configDialog.title} 已更新，并写入上线风险日志。`); setConfigDialog(null); }} />}
    </>
  );
}

function MaintenanceConfigModal({ dialog, onClose, onSave }: { dialog: { kind: "server" | "routes" | "service" | "alert" | "local"; title: string }; onClose: () => void; onSave: () => void }) {
  return (
    <Modal title={dialog.title} subtitle="演示配置会在当前会话保留，并生成操作记录。" onClose={onClose} size={dialog.kind === "routes" ? "lg" : undefined}
      footer={<><Button tone="secondary" onClick={onClose}>取消</Button><Button onClick={onSave}>{dialog.kind === "routes" ? "确认路由" : "保存配置"}</Button></>}>
      {(dialog.kind === "server" || dialog.kind === "service") && (
        <div className="form-grid">
          <label><span>显示名称</span><input defaultValue={dialog.kind === "server" ? "mcp-gateway-prod-01" : dialog.title.replace(" 服务配置", "")} /></label>
          <label><span>Transport</span><select defaultValue="Streamable HTTP"><option>Streamable HTTP</option><option>SSE</option><option>stdio</option></select></label>
          <label className="span-2"><span>服务地址</span><input defaultValue="https://gateway.example.com" /></label>
          <label><span>健康检查地址</span><input defaultValue="/healthz" /></label>
          <label><span>检查间隔</span><select><option>每 30 秒</option><option>每 60 秒</option></select></label>
          <label><span>代码仓库</span><input defaultValue="https://github.com/example/mcp-platform" /></label>
          <label><span>维护人员</span><input defaultValue="林晓、陈宇" /></label>
        </div>
      )}
      {dialog.kind === "routes" && (
        <div className="route-preview">
          {services.slice(0, 4).map((service, index) => <div key={service.id}><Badge tone={index === 2 ? "warning" : "success"}>{index === 2 ? "降级" : "正常"}</Badge><div><strong>/{service.id}/mcp</strong><small>转发至 https://service.example.com/{service.id}/mcp</small></div><span>{mcps.filter((tool) => tool.serviceId === service.id).length} 个工具</span></div>)}
        </div>
      )}
      {dialog.kind === "alert" && (
        <div className="form-grid">
          <label><span>规则名称</span><input defaultValue="MCP 成功率异常" /></label>
          <label><span>事故级别</span><select><option>P1</option><option>P2</option><option>P0</option></select></label>
          <label><span>监控指标</span><select><option>调用成功率</option><option>P95 响应时长</option><option>错误数量</option></select></label>
          <label><span>触发条件</span><input defaultValue="连续 5 分钟低于 97%" /></label>
          <label className="span-2"><span>通知渠道</span><input defaultValue="电话、Slack #mcp-alerts、邮件" /></label>
        </div>
      )}
      {dialog.kind === "local" && (
        <div className="local-config-detail">
          <InlineNotice tone="warning" title="发现 1 个路径风险" description="notion-sync 使用了不存在的相对目录，建议切换为绝对路径并重新检查。" />
          <div className="code-block"><pre>{`{
  "mcpServers": {
    "notion-sync": {
      "command": "node",
      "args": ["D:/mcp/notion-sync/index.js"],
      "env": { "NOTION_TOKEN": "\${secret:NOTION_TOKEN}" }
    }
  }
}`}</pre></div>
          <dl className="info-list"><div><dt>配置文件</dt><dd>~/.cursor/mcp.json</dd></div><div><dt>启用 MCP</dt><dd>5 个</dd></div><div><dt>最近检查</dt><dd>刚刚 · 86ms</dd></div></dl>
        </div>
      )}
    </Modal>
  );
}

function WorkspaceEnvironment({ workspaceId, notify }: { workspaceId: WorkspaceId; notify: (title: string, detail?: string) => void }) {
  const workspace = workspaces.find((item) => item.id === workspaceId)!;
  return (
    <div className="detail-grid">
      <Panel className="span-4" title="当前 Workspace">
        <div className="workspace-hero"><span style={{ background: workspace.color }}><CloudCog size={24} /></span><div><strong>{workspace.name}</strong><p>{workspace.environment}</p></div></div>
        <dl className="info-list"><div><dt>Service</dt><dd>{services.filter((item) => item.workspaceIds.includes(workspaceId)).length}</dd></div><div><dt>MCP</dt><dd>{mcps.filter((item) => item.workspaceIds.includes(workspaceId)).length}</dd></div><div><dt>隔离策略</dt><dd>网络 + 凭证 + 数据</dd></div></dl>
      </Panel>
      <Panel className="span-8" title="沙盒环境配置">
        <div className="environment-grid">
          {[
            ["开发环境", "dev-service.example.com", "main", "运行正常"],
            ["测试环境", "test-service.example.com", "release/*", "运行正常"],
            ["预发布环境", "staging-service.example.com", "release/v*", "需要关注"],
            ["生产环境", "service.example.com", "tag only", "运行正常"],
          ].map(([name, host, branch, status]) => <div key={name}><span><Server size={20} /></span><div><strong>{name}</strong><small>{host}</small></div><Badge tone="purple">{branch}</Badge><Badge tone={status === "运行正常" ? "success" : "warning"}>{status}</Badge><Button tone="ghost" size="sm" onClick={() => notify(`${name}配置已打开`, `当前分支策略：${branch}，服务地址：${host}。`)}>编辑</Button></div>)}
        </div>
      </Panel>
      <Panel className="span-12" title="Workspace 内资产映射">
        <div className="mapping-board">
          {services.filter((item) => item.workspaceIds.includes(workspaceId)).map((service) => <div key={service.id}><div><strong>{service.name}</strong><small>{service.code}</small></div><span>→</span><div className="mapping-tools">{mcps.filter((item) => item.serviceId === service.id && item.workspaceIds.includes(workspaceId)).map((tool) => <Badge key={tool.id} tone="neutral">{tool.displayName}</Badge>)}</div><Button tone="ghost" size="sm" onClick={() => notify(`${service.name}资产映射已打开`, "可以调整 MCP 的工作区、环境和发布范围。")}>调整映射</Button></div>)}
        </div>
      </Panel>
    </div>
  );
}

function AlertConfiguration({ notify, openConfig }: { notify: (title: string) => void; openConfig: (title: string) => void }) {
  return (
    <div className="detail-grid">
      <Panel className="span-7" title="告警规则" action={<Button icon={<Plus size={15} />} onClick={() => openConfig("新增告警规则")}>新增规则</Button>}>
        <div className="rule-list">
          {[
            ["成功率异常", "连续 5 分钟低于 97%", "P1", "电话 + Slack + 邮件"],
            ["响应时长异常", "P95 连续 10 分钟高于 3s", "P2", "Slack + 邮件"],
            ["服务不可用", "连续 3 次健康检查失败", "P0", "电话 + 短信 + Slack"],
            ["Token 异常", "小时均值超过基线 50%", "P2", "Slack"],
          ].map(([name, condition, level, channel]) => <div key={name}><span><Bell size={19} /></span><div><strong>{name}</strong><small>{condition}</small></div><Badge tone={level === "P0" || level === "P1" ? "danger" : "warning"}>{level}</Badge><small>{channel}</small><label className="switch"><input type="checkbox" defaultChecked /><i /></label></div>)}
        </div>
      </Panel>
      <Panel className="span-5" title="通知渠道">
        <div className="channel-list">
          {[[Webhook, "Slack #mcp-alerts", "已连接"], [Bell, "企业短信", "已连接"], [Radio, "PagerDuty", "已连接"], [Webhook, "飞书机器人", "未配置"]].map(([Icon, name, status]) => { const C = Icon as typeof Webhook; return <button key={String(name)} onClick={() => openConfig(`${String(name)} 通知配置`)}><C size={19} /><div><strong>{String(name)}</strong><small>{String(status)}</small></div><Badge tone={status === "已连接" ? "success" : "neutral"}>{String(status)}</Badge></button>; })}
        </div>
        <Button tone="secondary" onClick={() => notify("测试通知已发送")}>发送测试通知</Button>
      </Panel>
    </div>
  );
}

function CredentialConfiguration({ notify }: { notify: (title: string, detail?: string) => void }) {
  const [mode, setMode] = useState("platform");
  return (
    <div className="detail-grid">
      <Panel className="span-5" title="鉴权模式">
        <div className="auth-mode-list">
          {[
            ["platform", "平台集中凭证", "平台加密托管，按 Service 分发短期令牌"],
            ["oauth", "用户 OAuth 2.0", "每位用户独立授权和撤销"],
            ["key", "用户自带密钥", "调用前由用户输入，平台不持久化明文"],
            ["strong", "强鉴权", "高风险工具每次调用输入密码，仅本轮授权"],
            ["none", "无需鉴权", "仅允许低风险和隔离网络服务"],
          ].map(([id, title, detail]) => <button key={id} className={mode === id ? "active" : ""} onClick={() => setMode(id)}><KeyRound size={19} /><div><strong>{title}</strong><small>{detail}</small></div>{mode === id && <Check size={16} />}</button>)}
        </div>
      </Panel>
      <Panel className="span-7" title="凭证加密配置" description="所有敏感值仅显示掩码，不进入调用日志">
        <div className="credential-card">
          <div><span><LockKeyhole size={20} /></span><div><strong>Vault Transit · AES-256-GCM</strong><small>密钥每 90 天自动轮换 · 上次轮换 12 天前</small></div><Badge tone="success">安全</Badge></div>
          <div className="form-grid"><label><span>密钥引用</span><input value="vault://mcp/prod/chart/api-key" readOnly /></label><label><span>凭证值</span><input value="••••••••••••••••" readOnly /></label><label><span>令牌有效期</span><select><option>15 分钟</option><option>1 小时</option></select></label><label><span>轮换周期</span><select><option>90 天</option><option>30 天</option></select></label></div>
          <div className="server-actions"><Button tone="secondary" onClick={() => notify("凭证连接正常", "成功获取短期令牌，未暴露明文凭证。")}>验证凭证</Button><Button tone="ghost" onClick={() => notify("凭证轮换已排队", "演示环境将在安全窗口内生成新版本凭证。")}>立即轮换</Button></div>
        </div>
      </Panel>
    </div>
  );
}

function LocalMcpConfig({ notify, openConfig }: { notify: (title: string, detail?: string) => void; openConfig: (title: string) => void }) {
  const clients = [
    { id: "claude", name: "Claude Desktop", path: "~/Library/Application Support/Claude/claude_desktop_config.json", enabled: 6, status: "配置正常", tone: "success", conflict: "无冲突" },
    { id: "cursor", name: "Cursor", path: "~/.cursor/mcp.json", enabled: 5, status: "发现 1 个路径风险", tone: "warning", conflict: "notion-sync 路径待确认" },
    { id: "windsurf", name: "Windsurf", path: "~/.codeium/windsurf/mcp_config.json", enabled: 4, status: "配置正常", tone: "success", conflict: "无冲突" },
    { id: "vscode", name: "VS Code", path: ".vscode/mcp.json", enabled: 3, status: "未检测到文件", tone: "neutral", conflict: "可导出标准配置" },
  ];
  return (
    <div className="detail-grid">
      <Panel className="span-8" title="本地客户端配置" description="演示环境读取常见客户端的 MCP 配置结构，并检查启动命令、路径和重复服务。">
        <div className="local-config-list">
          {clients.map((client) => (
            <div className="local-config-card" key={client.id}>
              <div className="local-config-head">
                <div><span className={`client-logo client-${client.id}`}>{client.name.slice(0, 1)}</span><div><strong>{client.name}</strong><small>{client.path}</small></div></div>
                <Badge tone={client.tone as "success" | "warning" | "neutral"}>{client.status}</Badge>
              </div>
              <div className="local-config-meta"><span>当前启用 <b>{client.enabled} 个 MCP</b></span><span>冲突检查 <b>{client.conflict}</b></span></div>
              <div className="server-actions">
                <Button tone="secondary" size="sm" onClick={() => openConfig(`${client.name} 本地配置`)}>查看配置</Button>
                <CopyButton text={`{"mcpServers":{"${client.id}-demo":{"command":"mcp-run","args":["--workspace","prod"]}}}`} onCopied={() => notify("配置已复制", `已复制 ${client.name} 的标准 MCP 配置。`)} />
                <Button tone="ghost" size="sm" onClick={() => notify(`${client.name}检查完成`, "启动命令、路径和连接状态均已完成检查。")}>重新检查</Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="span-4" title="本地配置检查">
        <div className="health-list">
          <div><i className="dot-success" /><span>配置文件可读取</span><strong>3 / 4</strong></div>
          <div><i className="dot-success" /><span>启动命令存在</span><strong>18 / 18</strong></div>
          <div><i className="dot-warning" /><span>路径有效</span><strong>17 / 18</strong></div>
          <div><i className="dot-success" /><span>服务可连接</span><strong>15 / 18</strong></div>
          <div><i className="dot-warning" /><span>配置冲突</span><strong>1</strong></div>
        </div>
        <InlineNotice tone="info" title="本地优先" description="真实版本可通过本地代理读取配置文件，不会把密钥上传到平台。" />
        <Button onClick={() => notify("标准配置已导出", "已生成适用于 Claude Desktop、Cursor、Windsurf 和 VS Code 的配置包。")}>导出标准配置</Button>
      </Panel>
    </div>
  );
}

function RiskLogs() {
  return (
    <Panel title="服务上线风险日志" description="记录每次发布前的风险识别、接受和缓解措施">
      <div className="table-scroll"><table className="data-table"><thead><tr><th>发布时间</th><th>Service / 版本</th><th>风险项</th><th>等级</th><th>缓解措施</th><th>审批人</th><th>结果</th></tr></thead>
        <tbody>
          <tr><td>2026-07-22 09:30</td><td><strong>图表生成</strong><small className="cell-sub">v3.0.0-rc2</small></td><td>新渲染引擎 P99 波动</td><td><Badge tone="warning">中</Badge></td><td>5% 灰度，超过 3s 自动回滚</td><td>高远</td><td><Badge tone="success">已接受</Badge></td></tr>
          <tr><td>2026-07-19 16:10</td><td><strong>文档处理</strong><small className="cell-sub">v4.6.2</small></td><td>解析库升级可能改变表格结构</td><td><Badge tone="warning">中</Badge></td><td>双写对比 24 小时</td><td>孙睿</td><td><Badge tone="success">已关闭</Badge></td></tr>
          <tr><td>2026-07-15 11:42</td><td><strong>企业搜索</strong><small className="cell-sub">v2.1.7</small></td><td>来源链接字段兼容性</td><td><Badge tone="danger">高</Badge></td><td>保持旧 Schema，延后上线</td><td>许宁</td><td><Badge tone="danger">已阻断</Badge></td></tr>
        </tbody>
      </table></div>
    </Panel>
  );
}

function IncidentLogs({ onOpen }: { onOpen: () => void }) {
  return (
    <Panel title="服务异常日志" description="点击异常记录查看影响范围、时间线和处置详情">
      <div className="incident-list">
        {[
          ["INC-20260722-03", "企业搜索集群部分节点响应格式异常", "P1", "处理中", "生产工作区", "42 分钟"],
          ["INC-20260721-07", "图表渲染网关连接池耗尽", "P1", "已解决", "生产工作区", "28 分钟"],
          ["INC-20260719-02", "Notion OAuth 回调配置失效", "P2", "已解决", "外部接入区", "1 小时 56 分"],
        ].map(([id, title, level, status, workspace, duration]) => <button key={id} onClick={onOpen}><Badge tone="danger">{level}</Badge><div><strong>{title}</strong><small>{id} · {workspace}</small></div><div><span>持续时间</span><b>{duration}</b></div><Badge tone={status === "已解决" ? "success" : "warning"}>{status}</Badge><ChevronRight size={17} /></button>)}
      </div>
    </Panel>
  );
}

function IncidentModal({ onClose, notify }: { onClose: () => void; notify: (title: string) => void }) {
  return (
    <Modal title="企业搜索集群部分节点响应格式异常" subtitle="INC-20260722-03 · P1 · 处理中" onClose={onClose} size="xl"
      footer={<><Button tone="secondary" onClick={onClose}>关闭</Button><Button onClick={() => { onClose(); notify("事故任务已更新"); }}>更新处理进度</Button></>}>
      <div className="incident-impact-grid">
        <div><span>受影响 Workspace</span><strong>生产工作区</strong></div><div><span>受影响 Service</span><strong>企业搜索</strong></div><div><span>受影响 MCP</span><strong>2 个</strong></div><div><span>受影响调用</span><strong>286 次</strong></div>
      </div>
      <InlineNotice tone="danger" title="产生的影响" description="企业知识搜索返回的 286 次结果中，有 76 次缺少来源链接；AI 答案内容仍可用，但可信引用无法展示。" />
      <div className="incident-timeline">
        {[
          ["10:26:08", "监控触发", "source_url 缺失率超过 5%，自动创建 P1 告警。"],
          ["10:29:41", "人工确认", "运维确认 2 个新版本节点存在响应映射问题。"],
          ["10:36:12", "流量隔离", "将异常节点摘除，错误率从 7.2% 降至 0.8%。"],
          ["10:48:30", "修复验证", "研发已提交字段兼容补丁，正在预发布环境回归。"],
        ].map(([time, title, detail]) => <div key={time}><span>{time}</span><i /><div><strong>{title}</strong><p>{detail}</p></div></div>)}
      </div>
    </Modal>
  );
}
