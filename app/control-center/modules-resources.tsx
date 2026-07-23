"use client";

import {
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  CloudDownload,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  Github,
  KeyRound,
  LockKeyhole,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  UploadCloud,
  Users,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Badge,
  Button,
  EmptyState,
  InlineNotice,
  Modal,
  PageIntro,
  Panel,
  SearchField,
  SelectField,
} from "./ui";
import type { KnowledgeDoc, MarketItem, RoleId, WorkspaceId } from "./types";
import { WorkspaceSelect } from "./modules-core";
import { useCatalog } from "./store";

export function MarketPage({
  workspaceId,
  setWorkspaceId,
  notify,
}: {
  workspaceId: WorkspaceId;
  setWorkspaceId: (id: WorkspaceId) => void;
  notify: (title: string, detail?: string) => void;
}) {
  const { marketItems, installMarketItem } = useCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState<MarketItem | null>(null);
  const [installStep, setInstallStep] = useState(0);
  const categories = ["全部", "设计协作", "研发工具", "知识管理", "数据与分析", "监控运维"];
  const visible = marketItems.filter((item) =>
    (category === "全部" || item.category === category) &&
    (!query || `${item.name}${item.provider}${item.summary}${item.tags.join("")}`.toLowerCase().includes(query.toLowerCase())),
  );
  return (
    <>
      <PageIntro
        eyebrow="第三方能力目录"
        title="MCP 市场"
        description="发现、评估和接入官方、社区与第三方 MCP，并纳入企业统一治理。"
        actions={<><WorkspaceSelect value={workspaceId} onChange={setWorkspaceId} /><Button tone="secondary" icon={<Github size={16} />} onClick={() => notify("开源 MCP 提交流程已打开", "请提供来源地址、许可证、权限范围和安全联系人。")}>提交开源 MCP</Button></>}
      />
      <div className="market-hero">
        <div><Badge tone="purple"><Sparkles size={13} /> 企业精选</Badge><h2>把可信的外部能力，安全地带进企业 AI</h2><p>统一审查来源、协议、权限、付费方式和服务方可见性，再安装到隔离沙盒。</p></div>
        <div className="market-orbit"><span><Store size={28} /></span><i /><i /><i /></div>
      </div>
      <div className="market-toolbar">
        <SearchField value={query} onChange={setQuery} placeholder="搜索 MCP、服务提供方或能力…" />
        <div className="category-tabs">
          {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
      </div>
      {visible.length ? (
        <div className="market-grid">
          {visible.map((item) => (
            <button className="market-card" key={item.id} onClick={() => { setSelected(item); setInstallStep(0); }}>
              <div className={`market-logo market-${item.id}`}>{item.name.at(0)}</div>
              <div className="market-card-head"><div><strong>{item.name}</strong><span>{item.provider}</span></div>{item.verified && <ShieldCheck size={17} />}</div>
              <p>{item.summary}</p>
              <div className="market-tags">{item.tags.map((tag) => <Badge key={tag} tone={tag === "高风险" ? "danger" : "neutral"}>{tag}</Badge>)}</div>
              <div className="market-meta"><span><CloudDownload size={14} /> {item.installs.toLocaleString()}</span><span><KeyRound size={14} /> {item.auth.split(" ")[0]}</span><Badge tone={item.installStatus === "审核中" ? "warning" : item.installStatus === "已接入" ? "success" : "neutral"}>{item.installStatus}</Badge><span>查看详情 <ChevronRight size={14} /></span></div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="没有找到匹配的 MCP" description="尝试切换分类或使用更短的关键词。" />
      )}
      {selected && (
        <MarketDetailModal
          item={selected}
          step={installStep}
          setStep={setInstallStep}
          onClose={() => setSelected(null)}
          onDone={() => {
            installMarketItem(selected.id);
            setSelected(null);
            notify("已提交内部审核", `${selected.name} 已安装到研发沙盒，健康检查通过。`);
          }}
        />
      )}
    </>
  );
}

function MarketDetailModal({
  item,
  step,
  setStep,
  onClose,
  onDone,
}: {
  item: MarketItem;
  step: number;
  setStep: (step: number) => void;
  onClose: () => void;
  onDone: () => void;
}) {
  const steps = ["来源与能力", "权限与付费", "安装到沙盒", "提交审核"];
  return (
    <Modal title={item.name} subtitle={`${item.provider} · ${item.category}`} onClose={onClose} size="xl"
      footer={
        <>
          <Button tone="secondary" onClick={step ? () => setStep(step - 1) : onClose}>{step ? "上一步" : "关闭"}</Button>
          <span className="modal-step">步骤 {step + 1} / {steps.length}</span>
          <Button onClick={step === steps.length - 1 ? onDone : () => setStep(step + 1)}>{step === steps.length - 1 ? "提交内部审核" : "继续"}</Button>
        </>
      }>
      <div className="install-stepper">{steps.map((label, index) => <div key={label} className={`${index === step ? "active" : ""} ${index < step ? "done" : ""}`}><span>{index < step ? <Check size={14} /> : index + 1}</span><strong>{label}</strong></div>)}</div>
      {step === 0 && (
        <div className="market-detail-layout">
          <div>
            <div className="market-title-card"><div className={`market-logo market-${item.id}`}>{item.name.at(0)}</div><div><h3>{item.name}</h3><p>{item.summary}</p></div>{item.verified && <Badge tone="success"><ShieldCheck size={13} /> 已验证来源</Badge>}</div>
            <h3 className="section-label">包含的工具</h3>
            <div className="tool-capability-list">
              {["搜索和读取内容", "创建或更新资源", "列出可访问的工作区", "获取当前用户权限"].map((tool, index) => <div key={tool}><Workflow size={17} /><span><strong>{tool}</strong><small>{index > 1 ? "只读操作" : "需要授权"}</small></span><Badge tone={index > 1 ? "success" : "warning"}>{index > 1 ? "低风险" : "中风险"}</Badge></div>)}
            </div>
          </div>
          <aside className="market-facts">
            <h3>接入信息</h3>
            <dl><div><dt>协议类型</dt><dd>{item.protocol}</dd></div><div><dt>LLM 支持</dt><dd>{item.llmSupport}</dd></div><div><dt>鉴权方式</dt><dd>{item.auth}</dd></div><div><dt>安装量</dt><dd>{item.installs.toLocaleString()}</dd></div></dl>
          </aside>
        </div>
      )}
      {step === 1 && (
        <div className="decision-grid">
          <div><span><KeyRound size={21} /></span><div><strong>用户授权方式</strong><p>{item.auth}</p><small>平台不会在日志中记录明文令牌，用户可随时撤销授权。</small></div></div>
          <div><span><Bot size={21} /></span><div><strong>支持的模型</strong><p>{item.llmSupport}</p><small>不支持的客户端将在目录中自动隐藏。</small></div></div>
          <div><span><CircleDollarSign size={21} /></span><div><strong>付费与采购</strong><p>{item.pricing}</p><small>采购方式可在内部上架前调整。</small></div></div>
          <div><span><Eye size={21} /></span><div><strong>服务方可见性</strong><p>{item.visibility}</p><small>用户侧名称和描述可使用企业品牌重新包装。</small></div></div>
          <InlineNotice tone={item.verified ? "success" : "warning"} title={item.verified ? "安全审查基础项通过" : "社区来源需要人工复核"} description={item.verified ? "仓库来源、发布者身份和权限范围已验证。" : "安装前需要锁定提交版本、执行依赖扫描并限制网络访问。"} />
        </div>
      )}
      {step === 2 && (
        <div className="sandbox-install">
          <div className="form-grid"><label><span>目标 Workspace</span><select><option>研发沙盒</option><option>外部接入区</option></select></label><label><span>内部显示名称</span><input defaultValue={item.name.replace("MCP", "企业连接器")} /></label><label><span>安装版本</span><select><option>最新稳定版</option><option>锁定指定 Commit</option></select></label><label><span>网络策略</span><select><option>仅允许服务方域名</option><option>完全隔离</option></select></label></div>
          <div className="install-checks">
            {["校验来源和签名", "扫描依赖与许可证", "创建加密凭证槽位", "执行健康检查", "列出工具与权限"].map((item, index) => <div key={item}><span className={index < 3 ? "done" : ""}>{index < 3 ? <Check size={15} /> : index + 1}</span><strong>{item}</strong><Badge tone={index < 3 ? "success" : "neutral"}>{index < 3 ? "已完成" : "待执行"}</Badge></div>)}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="review-summary">
          <span className="review-icon"><PackageCheck size={34} /></span>
          <h3>沙盒安装准备完成</h3>
          <p>提交后将执行完整健康检查，并依次进入技术、安全和采购审核。</p>
          <div><span>目标 Workspace</span><strong>研发沙盒</strong></div><div><span>内部显示名称</span><strong>{item.name.replace("MCP", "企业连接器")}</strong></div><div><span>鉴权方式</span><strong>{item.auth}</strong></div><div><span>预计审核时间</span><strong>1～2 个工作日</strong></div>
        </div>
      )}
    </Modal>
  );
}

export function KnowledgePage({
  role,
  notify,
}: {
  role: RoleId;
  notify: (title: string, detail?: string) => void;
}) {
  const { knowledgeDocs, createKnowledgeDoc, updateKnowledgeDoc, deleteKnowledgeDoc } = useCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState<KnowledgeDoc | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const visible = useMemo(() => knowledgeDocs.filter((doc) => (category === "全部" || doc.category === category) && (!query || `${doc.title}${doc.summary}${doc.tags.join("")}`.toLowerCase().includes(query.toLowerCase()))), [knowledgeDocs, query, category]);
  const canEdit = role !== "viewer";
  return (
    <>
      <PageIntro
        eyebrow="规范与经验中心"
        title="知识库"
        description="沉淀 MCP 产品、技术、接入和运维规范，让每一次设计和故障处理可复用。"
        actions={<Button icon={<UploadCloud size={16} />} disabled={!canEdit} onClick={() => { setUploadOpen(true); setUploadStep(0); }}>上传文档</Button>}
      />
      <div className="knowledge-layout">
        <aside className="knowledge-sidebar">
          <SearchField value={query} onChange={setQuery} placeholder="搜索文档…" />
          <nav>
            {["全部", "产品开发手册", "技术开发手册", "接入流程", "运维处理流程"].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}><FileText size={16} /><span>{item}</span><small>{item === "全部" ? knowledgeDocs.length : knowledgeDocs.filter((doc) => doc.category === item).length}</small></button>)}
          </nav>
          <div className="knowledge-tip"><BookOpen size={20} /><strong>文档健康度 92%</strong><p>有 2 篇文档超过 90 天未复核。</p></div>
        </aside>
        <div className="knowledge-main">
          <div className="knowledge-header"><div><h2>{category}</h2><p>{visible.length} 篇文档 · 按最近更新排序</p></div><SelectField value="updated" onChange={() => undefined}><option value="updated">最近更新</option><option value="popular">最多阅读</option></SelectField></div>
          {visible.length ? visible.map((doc) => (
            <button className="doc-row" key={doc.id} onClick={() => setSelected(doc)}>
              <span className="doc-icon"><FileText size={20} /></span>
              <div><strong>{doc.title}</strong><p>{doc.summary}</p><div>{doc.tags.map((tag) => <Badge key={tag} tone="neutral">{tag}</Badge>)}</div></div>
              <div className="doc-meta"><span>{doc.owner}</span><span>{doc.version}</span><span>{doc.updatedAt}</span></div>
              <ChevronRight size={18} />
            </button>
          )) : <EmptyState title="没有匹配的文档" description="调整关键词或分类后重试。" />}
        </div>
      </div>
      {selected && <KnowledgeDetail
        doc={knowledgeDocs.find((doc) => doc.id === selected.id) ?? selected}
        canEdit={canEdit}
        onClose={() => setSelected(null)}
        onSave={(content) => {
          const latest = knowledgeDocs.find((doc) => doc.id === selected.id) ?? selected;
          updateKnowledgeDoc(selected.id, {
            sections: latest.sections.map((section, index) => index === content.index ? { ...section, content: content.value } : section),
          });
          notify("文档修改已保存");
        }}
        onDelete={() => {
          deleteKnowledgeDoc(selected.id);
          setSelected(null);
          notify("文档已删除");
        }}
      />}
      {uploadOpen && <UploadDocumentModal step={uploadStep} setStep={setUploadStep} onClose={() => setUploadOpen(false)} notify={notify} onDone={() => {
        createKnowledgeDoc({
          id: `doc-${Date.now()}`,
          title: "MCP 服务异常处理手册",
          category: "运维处理流程",
          summary: "从事故分级、值班响应到服务降级、回滚与复盘的完整操作手册。",
          owner: "林晓",
          version: "v1.0",
          updatedAt: "刚刚",
          readMinutes: 12,
          tags: ["故障处理", "回滚", "值班"],
          sections: [
            { title: "事故分级标准", content: "按照用户影响、调用失败范围和持续时间将事故划分为 P0 至 P3。P0 需要立即启动应急响应，P1 需在 15 分钟内完成责任人确认。" },
            { title: "值班响应流程", content: "告警触发后先确认影响范围和最近变更，再执行隔离、降级或回滚，并持续记录时间线。" },
            { title: "服务降级与回滚", content: "优先关闭高风险写操作，保留只读能力；回滚后执行健康检查与关键调用回放。" },
          ],
        });
        setUploadOpen(false);
        notify("文档已发布", "内容解析、章节提取和 MCP 关联已完成，已写入知识库列表。");
      }} />}
    </>
  );
}

function KnowledgeDetail({ doc, canEdit, onClose, onSave, onDelete }: { doc: KnowledgeDoc; canEdit: boolean; onClose: () => void; onSave: (content: { index: number; value: string }) => void; onDelete: () => void }) {
  const [active, setActive] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(doc.sections[0]?.content ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const selectSection = (index: number) => {
    setActive(index);
    setDraft(doc.sections[index]?.content ?? "");
    setEditing(false);
  };
  const save = () => {
    onSave({ index: active, value: draft });
    setEditing(false);
  };
  return (
    <Modal title={doc.title} subtitle={`${doc.category} · ${doc.version} · ${doc.readMinutes} 分钟阅读`} onClose={onClose} size="xl"
      footer={<><Button tone="danger" disabled={!canEdit} icon={<Trash2 size={15} />} onClick={() => setDeleteOpen(true)}>删除</Button><span className="modal-spacer" /><Button tone="secondary" onClick={onClose}>关闭</Button><Button disabled={!canEdit} icon={<Edit3 size={15} />} onClick={editing ? save : () => setEditing(true)}>{editing ? "保存编辑" : "编辑文档"}</Button></>}>
      <div className="doc-reader">
        <aside><strong>文档目录</strong>{doc.sections.map((section, index) => <button key={section.title} className={active === index ? "active" : ""} onClick={() => selectSection(index)}><span>{index + 1}</span>{section.title}</button>)}<div><span>文档负责人</span><strong>{doc.owner}</strong><span>最近更新</span><strong>{doc.updatedAt}</strong></div></aside>
        <article>
          <Badge tone="purple">{doc.category}</Badge>
          <h2>{doc.sections[active].title}</h2>
          {editing ? <textarea className="doc-editor" value={draft} onChange={(event) => setDraft(event.target.value)} /> : <p>{doc.sections[active].content}</p>}
          <div className="doc-example">
            <strong>实践检查清单</strong>
            <ul><li>边界是否清晰，模型能否判断不该调用的场景？</li><li>参数是否可由模型从上下文中稳定获取？</li><li>失败时是否提供可重试和用户行动建议？</li><li>是否记录版本、Trace 和责任人？</li></ul>
          </div>
          <InlineNotice tone="info" title="关联资产" description="本文档已关联图表生成 Service、4 个 MCP 和 2 个错误码。" />
        </article>
      </div>
      {deleteOpen && (
        <Modal title="确认删除文档？" subtitle="此操作会写入审计日志，删除后不再出现在知识库列表。" onClose={() => setDeleteOpen(false)}
          footer={<><Button tone="secondary" onClick={() => setDeleteOpen(false)}>取消</Button><Button tone="danger" onClick={onDelete}>确认删除</Button></>}>
          <InlineNotice tone="warning" title={doc.title} description={`当前版本 ${doc.version}，负责人 ${doc.owner}。演示数据可在刷新页面后恢复。`} />
        </Modal>
      )}
    </Modal>
  );
}

function UploadDocumentModal({ step, setStep, onClose, notify, onDone }: { step: number; setStep: (step: number) => void; onClose: () => void; notify: (title: string, detail?: string) => void; onDone: () => void }) {
  const steps = ["上传文件", "解析内容", "提取章节", "关联资产", "确认发布"];
  return (
    <Modal title="上传知识库文档" subtitle="支持 Markdown、Word、PDF 和纯文本" onClose={onClose} size="lg"
      footer={<><Button tone="secondary" onClick={step ? () => setStep(step - 1) : onClose}>{step ? "上一步" : "取消"}</Button><span className="modal-step">步骤 {step + 1} / {steps.length}</span><Button onClick={step === steps.length - 1 ? onDone : () => setStep(step + 1)}>{step === steps.length - 1 ? "发布文档" : "下一步"}</Button></>}>
      <div className="upload-progress">{steps.map((label, index) => <div key={label} className={`${index === step ? "active" : ""} ${index < step ? "done" : ""}`}><span>{index < step ? <Check size={13} /> : index + 1}</span><small>{label}</small></div>)}</div>
      {step === 0 && <div className="drop-zone"><UploadCloud size={32} /><strong>拖拽文档到这里，或点击选择文件</strong><p>单个文件最大 20MB · 内容仅用于企业知识库</p><Button tone="secondary" onClick={() => setStep(1)}>选择演示文档</Button></div>}
      {step === 1 && <div className="parse-result"><span className="parse-icon"><FileCheck2 size={30} /></span><h3>文档解析完成</h3><p>MCP-服务异常处理手册-v2.docx</p><div><span>正文</span><strong>6,482 字</strong></div><div><span>图片</span><strong>4 张</strong></div><div><span>表格</span><strong>2 个</strong></div></div>}
      {step === 2 && <div className="chapter-editor">{["事故分级标准", "值班响应流程", "服务降级与回滚", "事故复盘模板"].map((title, index) => <label key={title}><span>{index + 1}</span><input defaultValue={title} /><button type="button" onClick={() => notify("章节已标记删除", `“${title}”将在发布时从目录中移除。`)}><Trash2 size={14} /></button></label>)}</div>}
      {step === 3 && <div className="form-grid"><label><span>文档分类</span><select><option>运维处理流程</option><option>技术开发手册</option></select></label><label><span>文档负责人</span><input defaultValue="林晓" /></label><label><span>关联 Service</span><select multiple defaultValue={["企业搜索"]}><option>图表生成</option><option>文档处理</option><option>企业搜索</option></select></label><label><span>关联错误码</span><select multiple defaultValue={["MCP-TIMEOUT-504"]}><option>MCP-TIMEOUT-504</option><option>MCP-AUTH-401</option></select></label></div>}
      {step === 4 && <div className="review-summary"><span className="review-icon"><BookOpen size={34} /></span><h3>文档已准备发布</h3><p>解析结果包含 4 个章节，并关联企业搜索 Service 和 2 个错误码。</p><div><span>可见范围</span><strong>全部内部成员</strong></div><div><span>文档负责人</span><strong>林晓</strong></div><div><span>初始版本</span><strong>v1.0</strong></div></div>}
    </Modal>
  );
}

const permissionModules = [
  ["总览", "查看企业运行总览和治理建议"],
  ["Service 管理", "维护业务能力分组和负责人"],
  ["MCP 列表", "查看和编辑 MCP 配置"],
  ["调用分析", "查看调用、Token 和性能数据"],
  ["错误中心", "查看上下文并处理事故"],
  ["上架管理", "创建版本、审批和发布"],
  ["服务维护", "配置服务器、网关和凭证"],
  ["MCP 市场", "安装和审核第三方 MCP"],
  ["知识库", "查看、上传、编辑和删除文档"],
];

type RoleMember = { id: string; name: string; email: string; team: string; title: string };
const initialRoleMembers: Record<string, RoleMember[]> = {
  admin: [
    { id: "alex", name: "Alex Kim", email: "alex.kim@example.com", team: "平台工程", title: "平台管理员" },
    { id: "lin", name: "林晓", email: "lin.xiao@example.com", team: "平台工程", title: "平台管理员" },
    { id: "chen", name: "陈宇", email: "chen.yu@example.com", team: "平台工程", title: "安全管理员" },
  ],
  product: [
    { id: "zheng", name: "郑航", email: "zheng.hang@example.com", team: "智能产品部", title: "产品负责人" },
    { id: "liu", name: "刘佳", email: "liu.jia@example.com", team: "智能产品部", title: "产品经理" },
  ],
  developer: [
    { id: "gao", name: "高远", email: "gao.yuan@example.com", team: "MCP 开发组", title: "开发负责人" },
    { id: "xu", name: "许宁", email: "xu.ning@example.com", team: "MCP 开发组", title: "后端工程师" },
    { id: "tang", name: "唐森", email: "tang.sen@example.com", team: "协同平台", title: "后端工程师" },
  ],
  ops: [
    { id: "zhao", name: "赵一", email: "zhao.yi@example.com", team: "平台运维部", title: "运维负责人" },
    { id: "lin-ops", name: "林晓", email: "lin.xiao@example.com", team: "平台运维部", title: "SRE" },
    { id: "chen-ops", name: "陈宇", email: "chen.yu@example.com", team: "平台运维部", title: "SRE" },
  ],
  viewer: [
    { id: "wang", name: "王宁", email: "wang.ning@example.com", team: "数据分析部", title: "只读成员" },
  ],
};

export function PermissionsPage({ notify }: { notify: (title: string, detail?: string) => void }) {
  const { audits, addAudit } = useCatalog();
  const [role, setRole] = useState("ops");
  const [workspace, setWorkspace] = useState("prod");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [permissionOverrides, setPermissionOverrides] = useState<Record<string, boolean>>({});
  const [members, setMembers] = useState<Record<string, RoleMember[]>>(initialRoleMembers);
  const [roles, setRoles] = useState([
    { id: "admin", name: "平台管理员", detail: "拥有全部平台权限" },
    { id: "product", name: "产品负责人", detail: "管理 MCP 产品信息和上架" },
    { id: "developer", name: "开发负责人", detail: "维护契约、版本和错误" },
    { id: "ops", name: "运维负责人", detail: "处理错误和维护基础设施" },
    { id: "viewer", name: "只读成员", detail: "仅可查询授权内容" },
  ]);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberEditor, setMemberEditor] = useState<RoleMember | null>(null);
  const [removeMember, setRemoveMember] = useState<RoleMember | null>(null);
  const selectedRole = roles.find((item) => item.id === role);
  const currentMembers = (members[role] ?? []).filter((member) => `${member.name}${member.email}${member.team}`.toLowerCase().includes(memberQuery.toLowerCase()));
  const rows = permissionModules.filter(([name]) => !query || name.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <PageIntro eyebrow="组织与访问控制" title="权限管理" description="按角色与 Workspace 配置模块的查询、编辑和处理权限。"
        actions={<Button icon={<Plus size={16} />} onClick={() => setInviteOpen(true)}>新增角色</Button>} />
      <div className="permission-top">
        <Panel title="角色" description="选择需要配置的角色">
          <div className="role-list">
            {roles.map(({ id, name, detail }) => <button key={id} className={role === id ? "active" : ""} onClick={() => { setRole(id); setMemberQuery(""); }}><span><Users size={18} /></span><div><strong>{name}</strong><small>{detail}</small></div><Badge tone="neutral">{(members[id] ?? []).length} 人</Badge></button>)}
          </div>
        </Panel>
        <Panel title="权限范围" description="权限同时受 Workspace 数据范围约束">
          <WorkspaceSelect value={workspace as WorkspaceId} onChange={(id) => setWorkspace(id)} />
          <div className="scope-card"><LockKeyhole size={20} /><div><strong>最小权限原则</strong><p>未明确授权的模块和操作默认不可用；高风险操作需要二次审批。</p></div></div>
          <dl className="info-list"><div><dt>当前角色</dt><dd>{selectedRole?.name ?? role}</dd></div><div><dt>成员数量</dt><dd>{(members[role] ?? []).length} 人</dd></div><div><dt>数据范围</dt><dd>生产工作区</dd></div><div><dt>最后修改</dt><dd>林晓 · 2 天前</dd></div></dl>
        </Panel>
      </div>
      <Panel
        title="角色成员"
        description={`当前角色共有 ${(members[role] ?? []).length} 人。可新增、编辑或移除人员；成员变更会影响其在当前 Workspace 的权限。`}
        action={<div className="member-toolbar"><SearchField value={memberQuery} onChange={setMemberQuery} placeholder="搜索姓名、邮箱或团队…" /><Button icon={<Plus size={15} />} onClick={() => setMemberEditor({ id: "", name: "", email: "", team: "平台工程", title: role === "ops" ? "运维负责人" : "角色成员" })}>新增人员</Button></div>}
      >
        <div className="member-list">
          {currentMembers.map((member) => (
            <div className="member-row" key={member.id}>
              <span className="member-avatar">{member.name.slice(0, 1)}</span>
              <div><strong>{member.name}</strong><small>{member.email} · {member.team}</small></div>
              <Badge tone="neutral">{member.title}</Badge>
              <div className="member-actions"><Button tone="ghost" size="sm" icon={<Edit3 size={14} />} onClick={() => setMemberEditor(member)}>编辑</Button><Button tone="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setRemoveMember(member)}>移除</Button></div>
            </div>
          ))}
          {!currentMembers.length && <EmptyState title="没有匹配成员" description="换一个姓名、邮箱或团队关键词。" />}
        </div>
      </Panel>
      <Panel title="模块权限矩阵" description="查询：查看数据；编辑：修改配置；处理：执行发布、事故处置等业务动作"
        action={<SearchField value={query} onChange={setQuery} placeholder="搜索模块…" />}>
        <div className="permission-table">
          <div className="permission-head"><span>模块</span><span>查询</span><span>编辑</span><span>处理</span><span>数据范围</span><span>审批要求</span></div>
          {rows.map(([name, detail], index) => {
            const viewer = role === "viewer";
            const product = role === "product";
            const ops = role === "ops";
            const canEdit = !viewer && (!product || ["Service 管理", "MCP 列表", "上架管理", "知识库"].includes(name));
            const canProcess = !viewer && (role === "admin" || (ops && ["错误中心", "服务维护"].includes(name)) || (role === "developer" && ["MCP 列表", "错误中心", "上架管理"].includes(name)));
            const permission = (kind: "read" | "edit" | "process", fallback: boolean) => {
              const key = `${workspace}:${role}:${name}:${kind}`;
              return {
                checked: permissionOverrides[key] ?? fallback,
                onChange: (event: ChangeEvent<HTMLInputElement>) => setPermissionOverrides((current) => ({ ...current, [key]: event.target.checked })),
              };
            };
            return <div key={name}><div><strong>{name}</strong><small>{detail}</small></div><label className="permission-check"><input type="checkbox" {...permission("read", true)} /><i><Check size={13} /></i></label><label className="permission-check"><input type="checkbox" {...permission("edit", canEdit)} disabled={viewer} /><i><Check size={13} /></i></label><label className="permission-check"><input type="checkbox" {...permission("process", canProcess)} disabled={viewer} /><i><Check size={13} /></i></label><span>{index > 5 ? "指定 Workspace" : "当前 Workspace"}</span><Badge tone={name === "服务维护" || name === "上架管理" ? "warning" : "neutral"}>{name === "服务维护" || name === "上架管理" ? "需要审批" : "无需审批"}</Badge></div>;
          })}
        </div>
        <div className="permission-footer"><span>权限变更会记录操作人、时间和变更前后内容。</span><Button tone="secondary" onClick={() => setAuditOpen(true)}>查看审计日志</Button><Button onClick={() => { const changed = Object.keys(permissionOverrides).filter((key) => key.startsWith(`${workspace}:${role}:`)).length; addAudit("更新角色权限", role, `更新 ${workspace} Workspace 的模块权限矩阵，共 ${changed} 项变更`); notify("权限配置已保存", `${changed || "没有"}项变更已校验，将在 30 秒内对该角色生效。`); }}>保存权限配置</Button></div>
      </Panel>
      {inviteOpen && (
        <Modal title="新增自定义角色" subtitle="从现有角色复制权限，再按需要调整" onClose={() => setInviteOpen(false)}
          footer={<><Button tone="secondary" onClick={() => setInviteOpen(false)}>取消</Button><Button onClick={() => { const id = `custom-${Date.now()}`; setRoles((current) => [...current, { id, name: "Service 管理员", detail: "负责指定 Service 的服务器配置、告警和异常处理" }]); setMembers((current) => ({ ...current, [id]: [] })); setRole(id); setInviteOpen(false); addAudit("创建自定义角色", id, "创建 Service 管理员角色，初始成员为 0 人"); notify("自定义角色已创建", "角色已进入列表，请继续添加角色成员和配置权限。"); }}>创建角色</Button></>}>
          <div className="form-grid"><label><span>角色名称</span><input defaultValue="Service 管理员" /></label><label><span>复制权限自</span><select><option>运维负责人</option><option>平台管理员</option></select></label><label className="span-2"><span>角色说明</span><textarea defaultValue="负责指定 Service 的服务器配置、告警和异常处理。" /></label><label className="span-2"><span>初始成员</span><input placeholder="输入姓名或邮箱搜索…" /></label></div>
        </Modal>
      )}
      {auditOpen && (
        <Modal title="平台审计日志" subtitle="记录 MCP、错误、发布与权限的重要变更" onClose={() => setAuditOpen(false)} size="lg"
          footer={<Button tone="secondary" onClick={() => setAuditOpen(false)}>关闭</Button>}>
          <div className="audit-list">
            {audits.length ? audits.map((entry) => (
              <div key={entry.id}><span><ShieldCheck size={17} /></span><div><strong>{entry.action}</strong><p>{entry.detail}</p><small>{entry.actor} · {entry.at} · {entry.target}</small></div></div>
            )) : <EmptyState title="暂无新的审计记录" description="执行配置、发布或事故处理操作后，记录会显示在这里。" />}
          </div>
        </Modal>
      )}
      {memberEditor && (
        <MemberEditorModal
          member={memberEditor}
          role={role}
          onClose={() => setMemberEditor(null)}
          onSave={(draft) => {
            setMembers((current) => {
              const list = current[role] ?? [];
              const exists = list.some((item) => item.id === draft.id);
              return { ...current, [role]: exists ? list.map((item) => item.id === draft.id ? draft : item) : [...list, { ...draft, id: `member-${Date.now()}` }] };
            });
            addAudit(memberEditor.id ? "编辑角色成员" : "新增角色成员", role, `${memberEditor.id ? "编辑" : "新增"}成员 ${draft.name}`);
            setMemberEditor(null);
            notify(memberEditor.id ? "角色成员已更新" : "角色成员已新增", `${draft.name} 当前属于${role === "ops" ? "运维负责人" : "当前角色"}。`);
          }}
        />
      )}
      {removeMember && (
        <Modal title="确认移除角色成员？" subtitle="移除后该成员将立即失去此角色在当前 Workspace 的权限。" onClose={() => setRemoveMember(null)}
          footer={<><Button tone="secondary" onClick={() => setRemoveMember(null)}>取消</Button><Button tone="danger" onClick={() => { setMembers((current) => ({ ...current, [role]: (current[role] ?? []).filter((item) => item.id !== removeMember.id) })); addAudit("移除角色成员", role, `移除成员 ${removeMember.name}`); notify("角色成员已移除", `${removeMember.name} 不再属于当前角色。`); setRemoveMember(null); }}>确认移除</Button></>}>
          <InlineNotice tone="warning" title={removeMember.name} description={`${removeMember.email} · ${removeMember.team}`} />
        </Modal>
      )}
    </>
  );
}

function MemberEditorModal({ member, role, onClose, onSave }: { member: RoleMember; role: string; onClose: () => void; onSave: (member: RoleMember) => void }) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [team, setTeam] = useState(member.team);
  const [title, setTitle] = useState(member.title);
  return (
    <Modal title={member.id ? `编辑角色成员：${member.name}` : "新增角色成员"} subtitle={`当前加入角色：${role === "ops" ? "运维负责人" : role === "admin" ? "平台管理员" : role === "product" ? "产品负责人" : role === "developer" ? "开发负责人" : "只读成员"}`} onClose={onClose}
      footer={<><Button tone="secondary" onClick={onClose}>取消</Button><Button disabled={!name.trim() || !email.trim()} onClick={() => onSave({ ...member, name, email, team, title })}>保存成员</Button></>}>
      <div className="form-grid">
        <label><span>姓名</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="输入成员姓名" /></label>
        <label><span>企业邮箱</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>
        <label><span>所属团队</span><input value={team} onChange={(event) => setTeam(event.target.value)} /></label>
        <label><span>角色内职务</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      </div>
    </Modal>
  );
}
