import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appPath = new URL("../app/control-center/app.tsx", import.meta.url);
const corePath = new URL("../app/control-center/modules-core.tsx", import.meta.url);
const opsPath = new URL("../app/control-center/modules-ops.tsx", import.meta.url);
const resourcesPath = new URL("../app/control-center/modules-resources.tsx", import.meta.url);
const chartsPath = new URL("../app/control-center/charts.tsx", import.meta.url);
const dataPath = new URL("../app/control-center/data.ts", import.meta.url);
const cssPath = new URL("../app/globals.css", import.meta.url);

test("MCP Control Center contains the required Chinese navigation modules", async () => {
  const page = await readFile(appPath, "utf8");
  for (const label of ["总览", "Service 管理", "MCP 列表", "调用分析", "错误中心", "上架管理", "服务维护", "MCP 市场", "知识库", "权限管理"]) {
    assert.match(page, new RegExp(label));
  }
});

test("MCP Control Center exposes complete domain pages and demo data", async () => {
  const [core, ops, resources, data] = await Promise.all([
    readFile(corePath, "utf8"),
    readFile(opsPath, "utf8"),
    readFile(resourcesPath, "utf8"),
    readFile(dataPath, "utf8"),
  ]);
  for (const token of ["ServiceDrawer", "ServiceDetailPage", "McpManualTest", "ErrorContextModal", "EditMcpModal"]) {
    assert.match(core, new RegExp(`function ${token}`));
  }
  for (const token of ["PublishPage", "MaintenancePage", "AnalyticsPage", "ErrorsPage"]) assert.match(ops, new RegExp(`function ${token}`));
  for (const token of ["MarketPage", "KnowledgePage", "PermissionsPage"]) assert.match(resources, new RegExp(`function ${token}`));
  for (const token of ["mcps", "services", "errorRecords", "marketItems", "knowledgeDocs"]) assert.match(data, new RegExp(`export const ${token}`));
});

test("MCP Control Center source contains the documented interaction paths", async () => {
  const [page, core, ops, resources, charts] = await Promise.all([
    readFile(appPath, "utf8"),
    readFile(corePath, "utf8"),
    readFile(opsPath, "utf8"),
    readFile(resourcesPath, "utf8"),
    readFile(chartsPath, "utf8"),
  ]);
  const css = await readFile(cssPath, "utf8");
  for (const token of ["role-inline-select", "workspace-menu", "CommandPalette", "HelpPanel", "quick-create"]) {
    assert.match(page, new RegExp(token));
  }
  for (const token of ["\"7\"", "\"15\"", "\"180\"", "手动 Ping", "本地 MCP 配置", "错误码定位", "错误码自查", "角色成员", "新增人员", "开始日期", "结束日期", "强鉴权", "仅本轮调用", "OAuth 2.0", "上传文档", "报错分析", "沙盒验证", "提交审核"]) {
    assert.match(`${core}${ops}${resources}`, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(`${page}${core}${ops}${resources}${charts}`, /onMouseEnter/);
  assert.match(`${page}${core}${ops}${resources}${charts}`, /onClick/);
  assert.match(`${page}${core}${ops}${resources}${charts}`, /navigate\(/);
  assert.match(css, /chart-point/);
  assert.match(css, /drawer/);
  assert.match(css, /modal/);
  assert.match(css, /@media/);
});
