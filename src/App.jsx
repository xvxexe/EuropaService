
import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbznT45oMXeEA968iARFhdUWIEpit17cd2EF_I2gORicQzNt6DGKm_Wa_kJqFEbWATR1/exec";

const CURRENT_USER_LABEL = "Capo/Admin";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ children, className = "" }) {
  return (
    <div className={cn("rounded-[28px] border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-2 text-xs font-medium whitespace-nowrap transition",
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
      )}
    >
      {children}
    </button>
  );
}

function HeaderBlock({ eyebrow, title, subtitle, action }) {
  return (
    <div className="px-1">
      {eyebrow ? (
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{eyebrow}</div>
      ) : null}
      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-8 font-semibold text-slate-950">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-5 text-slate-600">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, emphasis = false }) {
  const safeValue = value === undefined || value === null || value === "" ? "—" : value;

  if (emphasis) {
    return (
      <div className="rounded-[28px] border border-slate-900 bg-slate-900 p-4 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-300">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-white">{safeValue}</div>
        {hint ? <div className="mt-1 text-xs text-slate-300">{hint}</div> : null}
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{safeValue}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </Card>
  );
}

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={cn("text-sm font-medium text-right", highlight && "text-slate-950")}>{value}</div>
    </div>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl">📂</div>
      <div className="mt-4 text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}


function HorizontalChart({ title, subtitle, data, mode = "single" }) {
  const safe = data?.length ? data : [{ label: "Nessun dato", value: 0 }];
  const maxValue = Math.max(
    ...safe.map((item) =>
      mode === "double" ? Math.max(item.primary || 0, item.secondary || 0) : item.value || 0
    ),
    1
  );

  const totalPrimary = safe.reduce(
    (sum, item) => sum + (mode === "double" ? item.primary || 0 : item.value || 0),
    0
  );

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">
          {safe.length} voci
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
        {safe.map((item, index) => {
          const primary = mode === "double" ? item.primary || 0 : item.value || 0;
          const secondary = mode === "double" ? item.secondary || 0 : 0;
          const pct = maxValue ? (primary / maxValue) * 100 : 0;
          const secondaryPct = maxValue ? (secondary / maxValue) * 100 : 0;
          const share = totalPrimary ? Math.round((primary / totalPrimary) * 100) : 0;

          return (
            <div
              key={item.label}
              className={cn(
                "px-3 py-3",
                index !== safe.length - 1 && "border-b border-slate-100"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">{item.label}</div>

                  {mode === "double" ? (
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                        Spesa {currency(primary)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                        IVA {currency(secondary)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-slate-500">
                      {currency(primary)} • {share}%
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-medium text-slate-400">#{index + 1}</div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="h-2 overflow-hidden rounded-full border border-slate-200 bg-white">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{
                      width:
                        primary > 0 ? `${Math.max(4, Math.min(100, pct))}%` : "0%"
                    }}
                  />
                </div>

                {mode === "double" ? (
                  <div className="h-2 overflow-hidden rounded-full border border-slate-200 bg-white">
                    <div
                      className="h-full rounded-full bg-slate-400"
                      style={{
                        width:
                          secondary > 0
                            ? `${Math.max(4, Math.min(100, secondaryPct))}%`
                            : "0%"
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}


function SummaryBanner({ totalRecords, totalAmount }) {
  const safeTotalAmount = Number.isFinite(totalAmount) ? totalAmount : 0;
  const safeTotalRecords = Number.isFinite(totalRecords) ? totalRecords : 0;

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">
              Area amministrazione
            </div>
            <div className="mt-2 text-xl font-semibold leading-6">
              Controllo spese del cantiere
            </div>
            <div className="mt-2 text-sm text-slate-300">
              Una vista chiara di lavorazioni, documenti e costi del cantiere Barcelò Roma.
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.15em] text-slate-300">Documenti</div>
            <div className="mt-1 text-2xl font-semibold">{safeTotalRecords}</div>
          </div>
        </div>

        <div className="mt-5 rounded-[28px] bg-white/10 px-4 py-4 backdrop-blur">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm text-slate-300">Totale visibile</div>
              <div className="mt-2 text-[40px] font-semibold leading-none tracking-tight">
                {currency(safeTotalAmount)}
              </div>
            </div>
            <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-200">
              Barcelò Roma
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickActionCard({ title, subtitle, icon, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="p-4 active:scale-[0.99] transition">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg">{icon}</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function ExpenseCard({ record, onOpen, onOpenJob, canOpenJob = true, showMeta = false }) {
  return (
    <button onClick={() => onOpen(record)} className="w-full text-left">
      <Card className="p-4 active:scale-[0.99] transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{record.description}</div>
            {canOpenJob ? (
              <button
                type="button"
                className="mt-1 text-xs text-slate-500 underline underline-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenJob(record.jobId);
                }}
              >
                {record.job}
              </button>
            ) : (
              <div className="mt-1 text-xs text-slate-500">{record.job}</div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">
                {dateLabel(record.date)}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">
                {record.paymentMethod}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
              {record.status}
            </div>
            <div className="mt-3 text-lg font-semibold text-slate-950">{currency(record.amount)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-50 p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Imponibile</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{currency(record.imponibile)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">IVA</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{currency(record.vat)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2.5 text-center">
            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Caricata da</div>
            <div className="mt-1 text-xs font-semibold text-slate-900">{record.uploadedBy}</div>
          </div>
        </div>

        {showMeta ? (
          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500 break-words">
            {record.supplier || "Senza fornitore"} • {record.category || "Senza categoria"}
            {record.externalCompany ? ` • Ditta esterna: ${record.externalCompany}` : ""}
          </div>
        ) : null}
      </Card>
    </button>
  );
}

function JobCard({ item, onOpen, advanced = false }) {
  return (
    <button onClick={() => onOpen(item.jobId)} className="w-full text-left">
      <Card className="p-4 active:scale-[0.99] transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">{item.job}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              {item.externalCompanies.length
                ? `Ditta esterna: ${item.externalCompanies.join(", ")}`
                : "Lavorazione interna"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-semibold text-slate-950">{currency(item.total)}</div>
            <div className="text-[11px] text-slate-500">{item.count} documenti</div>
          </div>
        </div>

        <div className={cn("mt-4 grid gap-2", advanced ? "grid-cols-4" : "grid-cols-3")}>
          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Spesa</div>
            <div className="mt-1 text-sm font-semibold">{currency(item.total)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">IVA</div>
            <div className="mt-1 text-sm font-semibold">{currency(item.vat)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Documenti</div>
            <div className="mt-1 text-sm font-semibold">{item.count}</div>
          </div>
          {advanced ? (
            <div className="rounded-2xl bg-slate-50 p-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Imponibile</div>
              <div className="mt-1 text-sm font-semibold">{currency(item.imponibile)}</div>
            </div>
          ) : null}
        </div>
      </Card>
    </button>
  );
}

function DocumentCard({ doc, onOpen }) {
  return (
    <button onClick={() => onOpen(doc)} className="w-full text-left">
      <Card className="p-4 active:scale-[0.99] transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 line-clamp-2">
              {doc.fileName || "Documento"}
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              {(doc.supplier || "-") + " • " + (doc.type || "-") + " • " + (doc.documentNumber || "-")}
            </div>
          </div>
          <div className="text-right">
            <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
              {formatDate(doc.date)}
            </div>
            <div className="mt-3 text-lg font-semibold text-slate-950">{currency(doc.amount)}</div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function LoginScreen({ password, setPassword, onLogin, loading, error }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-6 md:max-w-lg lg:max-w-xl">
        <div className="w-full space-y-4">
          <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
              Accesso amministrazione
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-9">Gestione spese cantieri</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Interfaccia mobile-first connessa al Google Sheets master tramite Apps Script.
            </p>
          </div>

          <Card className="p-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onLogin();
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                style={{ fontSize: "16px", transform: "translateZ(0)" }}
              />
            </div>
            <PrimaryButton onClick={onLogin} disabled={loading} className="w-full">
              {loading ? "Verifica accesso..." : "Entra"}
            </PrimaryButton>
            {error ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [logged, setLogged] = useState(false);
  const [data, setData] = useState(null);

  const [activeSiteId, setActiveSiteId] = useState("");
  const [screen, setScreen] = useState("dashboard");


  const [expenseSearch, setExpenseSearch] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("Tutti");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState("");

  const login = async () => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!json.success) {
        setAuthError(json.message || "Password errata");
        return;
      }

      const payload = json.data || null;
      const firstSiteId = payload?.sites?.[0]?.id || payload?.sites?.[0]?.siteId || "";

      setLogged(true);
      setData(payload);
      setActiveSiteId(firstSiteId);
      setScreen("dashboard");
      setSelectedExpense(null);
      setSelectedDocument(null);
      setSelectedJobId("");
    } catch (error) {
      console.error(error);
      setAuthError("Errore di collegamento con Apps Script");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setLogged(false);
    setPassword("");
    setAuthError("");
    setData(null);
    setActiveSiteId("");
    setScreen("dashboard");
    setSelectedExpense(null);
    setSelectedDocument(null);
    setSelectedJobId("");
    setExpenseSearch("");
    setDocumentSearch("");
    setJobFilter("Tutti");
  };

  const sites = data?.sites || [];
  const jobs = data?.jobs || [];
  const documents = data?.documents || [];
  const expenses = data?.expenses || [];
  const generatedAt = data?.generatedAt || "";

  const activeSite = useMemo(() => {
    if (!sites.length) return null;
    return sites.find((site) => (site.id || site.siteId) === activeSiteId) || sites[0] || null;
  }, [sites, activeSiteId]);

  const currentSiteId = activeSite ? activeSite.id || activeSite.siteId : "";

  useEffect(() => {
    if (!activeSiteId && sites.length) {
      setActiveSiteId(sites[0].id || sites[0].siteId || "");
    }
  }, [activeSiteId, sites]);

  const siteJobs = useMemo(
    () => jobs.filter((job) => job.siteId === currentSiteId),
    [jobs, currentSiteId]
  );
  const siteDocuments = useMemo(
    () => documents.filter((doc) => doc.siteId === currentSiteId),
    [documents, currentSiteId]
  );
  const siteExpenses = useMemo(
    () => expenses.filter((expense) => expense.siteId === currentSiteId),
    [expenses, currentSiteId]
  );

  const jobMap = useMemo(() => {
    const map = new Map();
    siteJobs.forEach((job) => map.set(job.jobId, job));
    return map;
  }, [siteJobs]);

  const documentMap = useMemo(() => {
    const map = new Map();
    siteDocuments.forEach((doc) => map.set(doc.documentId, doc));
    return map;
  }, [siteDocuments]);

  const expenseRecords = useMemo(() => {
    return siteExpenses
      .map((expense) => {
        const relatedJob = jobMap.get(expense.jobId);
        const relatedDocument = documentMap.get(expense.documentId);

        return {
          id: expense.expenseId,
          expenseId: expense.expenseId,
          documentId: expense.documentId || "",
          jobId: expense.jobId || "",
          date: expense.date,
          site: activeSite?.name || activeSite?.siteName || "",
          job: relatedJob?.jobName || expense.category || "Da classificare",
          amount: toNumber(expense.amount),
          imponibile: toNumber(expense.imponibile),
          vat: toNumber(expense.vat),
          status: "Registrata",
          description: expense.description || "Senza descrizione",
          file: relatedDocument?.fileName || expense.documentNumber || "Documento",
          supplier: expense.supplier || relatedDocument?.supplier || "",
          paymentMethod: expense.paymentMethod || "-",
          externalCompany: relatedJob?.externalCompany || "",
          category: expense.category || relatedJob?.type || "Generale",
          uploadedBy: CURRENT_USER_LABEL,
          items: relatedDocument?.items || [],
          rawExpense: expense,
          rawDocument: relatedDocument || null,
          rawJob: relatedJob || null,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [siteExpenses, jobMap, documentMap, activeSite]);

  const apiTotals = useMemo(() => {
    const candidates = [
      data?.masterTotals,
      data?.totals,
      data?.summary,
      data?.siteSummary,
      activeSite?.masterTotals,
      activeSite?.totals,
      activeSite?.summary,
    ].filter(Boolean);

    for (const obj of candidates) {
      const hasUsefulKey =
        Object.prototype.hasOwnProperty.call(obj, "total") ||
        Object.prototype.hasOwnProperty.call(obj, "imponibile") ||
        Object.prototype.hasOwnProperty.call(obj, "iva") ||
        Object.prototype.hasOwnProperty.call(obj, "vat") ||
        Object.prototype.hasOwnProperty.call(obj, "documenti") ||
        Object.prototype.hasOwnProperty.call(obj, "docs");

      if (hasUsefulKey) {
        return {
          total: toNumber(obj.total),
          imponibile: toNumber(obj.imponibile),
          vat: toNumber(obj.iva ?? obj.vat),
          docs: toNumber(obj.documenti ?? obj.docs),
          fromMaster: true,
        };
      }
    }

    return null;
  }, [data, activeSite]);

  const totals = useMemo(() => {
    const total = expenseRecords.reduce((sum, record) => sum + toNumber(record.amount), 0);
    const imponibile = expenseRecords.reduce((sum, record) => sum + toNumber(record.imponibile), 0);
    const vat = expenseRecords.reduce((sum, record) => sum + toNumber(record.vat), 0);

    const computed = {
      total,
      imponibile,
      vat,
      docs: siteDocuments.length,
      average: expenseRecords.length ? total / expenseRecords.length : 0,
      expenseCount: expenseRecords.length,
      jobCount: siteJobs.length,
      fromMaster: false,
    };

    if (!apiTotals) return computed;

    return {
      total: apiTotals.total,
      imponibile: apiTotals.imponibile,
      vat: apiTotals.vat,
      docs: apiTotals.docs || siteDocuments.length,
      average: expenseRecords.length ? apiTotals.total / expenseRecords.length : 0,
      expenseCount: expenseRecords.length,
      jobCount: siteJobs.length,
      fromMaster: true,
    };
  }, [expenseRecords, siteDocuments.length, siteJobs.length, apiTotals]);

  const jobsList = useMemo(() => {
    return ["Tutti", ...siteJobs.map((job) => job.jobName)];
  }, [siteJobs]);

  const filteredRecords = useMemo(() => {
    const term = expenseSearch.trim().toLowerCase();

    return expenseRecords.filter((record) => {
      const matchesSearch =
        !term ||
        [
          record.description,
          record.job,
          record.supplier,
          record.category,
          record.externalCompany,
          record.paymentMethod,
          record.file,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesJob = jobFilter === "Tutti" || record.job === jobFilter;
      return matchesSearch && matchesJob;
    });
  }, [expenseRecords, expenseSearch, jobFilter]);

  const filteredDocuments = useMemo(() => {
    const term = documentSearch.trim().toLowerCase();

    return [...siteDocuments]
      .filter((doc) => {
        if (!term) return true;
        return [
          doc.fileName,
          doc.supplier,
          doc.type,
          doc.documentNumber,
          doc.folder,
          doc.note,
          doc.category,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [siteDocuments, documentSearch]);

  const jobStats = useMemo(() => {
    return siteJobs
      .map((job) => {
        const relatedExpenses = expenseRecords.filter((record) => record.jobId === job.jobId);
        const relatedDocuments = siteDocuments.filter((doc) => doc.jobId === job.jobId);
        const externalCompanies = [
          ...new Set(relatedExpenses.map((record) => record.externalCompany).filter(Boolean)),
        ];

        return {
          jobId: job.jobId,
          job: job.jobName,
          total: relatedExpenses.reduce((sum, record) => sum + toNumber(record.amount), 0),
          imponibile: relatedExpenses.reduce((sum, record) => sum + toNumber(record.imponibile), 0),
          vat: relatedExpenses.reduce((sum, record) => sum + toNumber(record.vat), 0),
          count: relatedDocuments.length,
          externalCompanies,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [siteJobs, expenseRecords, siteDocuments]);

  const monthlySpend = useMemo(() => {
    const map = {};
    expenseRecords.forEach((record) => {
      const key = monthKey(record.date);
      if (!map[key]) map[key] = { label: key, primary: 0, secondary: 0 };
      map[key].primary += toNumber(record.amount);
      map[key].secondary += toNumber(record.vat);
    });
    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
  }, [expenseRecords]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    expenseRecords.forEach((record) => {
      const key = record.category || "Generale";
      map[key] = (map[key] || 0) + toNumber(record.amount);
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenseRecords]);

  const supplierBreakdown = useMemo(() => {
    const map = {};
    expenseRecords.forEach((record) => {
      const key = record.supplier || "Senza fornitore";
      map[key] = (map[key] || 0) + toNumber(record.amount);
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenseRecords]);

  const paymentBreakdown = useMemo(() => {
    const map = {};
    expenseRecords.forEach((record) => {
      const key = record.paymentMethod || "Non specificato";
      map[key] = (map[key] || 0) + toNumber(record.amount);
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenseRecords]);

  const uploaderBreakdown = useMemo(
    () => [{ label: CURRENT_USER_LABEL, value: expenseRecords.length }],
    [expenseRecords.length]
  );

  const topJob = jobStats[0] || null;
  const recentExpenses = expenseRecords.slice(0, 4);

  const selectedDocumentLinkedExpenses = useMemo(() => {
    if (!selectedDocument) return [];
    return expenseRecords.filter((record) => record.documentId === selectedDocument.documentId);
  }, [selectedDocument, expenseRecords]);

  const visibleJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobStats.find((item) => item.jobId === selectedJobId) || null;
  }, [selectedJobId, jobStats]);

  const selectedJobExpenses = useMemo(() => {
    if (!visibleJob) return [];
    return expenseRecords.filter((record) => record.jobId === visibleJob.jobId);
  }, [visibleJob, expenseRecords]);

  const selectedJobDocuments = useMemo(() => {
    if (!visibleJob) return [];
    return siteDocuments
      .filter((doc) => doc.jobId === visibleJob.jobId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [visibleJob, siteDocuments]);

  const activeSiteName = activeSite?.name || activeSite?.siteName || "";
  const activeSiteClient = activeSite?.client || "-";
  const activeSiteLocation = activeSite?.city || activeSite?.location || "-";
  const activeSiteStatus = activeSite?.status || "Attivo";

  const openJob = (jobId) => {
    setSelectedJobId(jobId);
    setScreen("job");
  };

  const navItems = [
    { id: "dashboard", label: "Home", emoji: "🏠" },
    { id: "archive", label: "Spese", emoji: "📄" },
    { id: "documents", label: "Documenti", emoji: "➕" },
    { id: "site", label: "Cantiere", emoji: "🏗️" },
    { id: "users", label: "Altro", emoji: "👥" },
  ];

  if (!logged) {
    return (
      <LoginScreen
        password={password}
        setPassword={setPassword}
        onLogin={login}
        loading={authLoading}
        error={authError}
      />
    );
  }

  if (!data || !activeSite) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 text-sm text-slate-500 md:max-w-2xl">
          Caricamento dati...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-24 md:max-w-3xl lg:max-w-6xl xl:max-w-7xl">
        <div className="px-4 pb-3 pt-4 lg:grid lg:grid-cols-[1.2fr_.8fr] lg:gap-4 lg:items-start">
          <SummaryBanner totalRecords={totals.docs} totalAmount={totals.total} />

          <Card className="mt-4 p-4 lg:mt-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Cantiere attivo</div>
            <div className="mt-3 space-y-3">
              <select
                value={currentSiteId}
                onChange={(e) => {
                  setActiveSiteId(e.target.value);
                  setScreen("dashboard");
                  setSelectedExpense(null);
                  setSelectedDocument(null);
                  setSelectedJobId("");
                  setExpenseSearch("");
                  setDocumentSearch("");
                  setJobFilter("Tutti");
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                {sites.map((site) => {
                  const value = site.id || site.siteId;
                  return (
                    <option key={value} value={value}>
                      {site.name || site.siteName}
                    </option>
                  );
                })}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Cliente</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{activeSiteClient}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Stato</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{activeSiteStatus}</div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                {activeSiteLocation} • Aggiornato {generatedAt ? formatDateTime(generatedAt) : "-"}
              </div>

              <SecondaryButton onClick={logout} className="w-full">
                Esci
              </SecondaryButton>
            </div>
          </Card>
        </div>

        <main className="space-y-4 px-4 pb-4">
          {screen === "dashboard" && (
            <>
              <HeaderBlock
                eyebrow="Panoramica"
                title="Dashboard spese"
                subtitle="Navigazione più chiara e dati principali sempre visibili."
                action={<PrimaryButton onClick={() => setScreen("archive")}>Apri spese</PrimaryButton>}
              />

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Spese totali" value={currency(totals.total)} hint="Totale uscite" emphasis />
                <StatCard label="Documenti" value={String(totals.docs)} hint="Spese registrate" />
                <StatCard label="Imponibile" value={currency(totals.imponibile)} hint="Base imponibile" />
                <StatCard label="IVA totale" value={currency(totals.vat)} hint="IVA complessiva" />
                <StatCard label="Spesa media" value={currency(totals.average)} hint="Media per documento" />
                <StatCard
                  label="Lavorazione principale"
                  value={topJob ? topJob.job : "—"}
                  hint={topJob ? currency(topJob.total) : "Nessun dato"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <QuickActionCard
                  icon="📄"
                  title="Archivio spese"
                  subtitle="Cerca e filtra rapidamente i documenti."
                  onClick={() => setScreen("archive")}
                />
                <QuickActionCard
                  icon="🏗️"
                  title="Lavorazioni"
                  subtitle="Apri il cantiere e consulta i centri di costo."
                  onClick={() => setScreen("site")}
                />
              </div>

              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Cantiere attivo</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Cliente, stato e riepilogo generale del sito.
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700">
                    {activeSiteStatus}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <InfoRow label="Nome cantiere" value={activeSiteName} highlight />
                  <InfoRow label="Cliente" value={activeSiteClient} />
                  <InfoRow label="Luogo" value={activeSiteLocation} />
                  <InfoRow label="Lavorazioni attive" value={String(jobStats.length)} />
                </div>
              </Card>

              <HorizontalChart
                title="Spese per periodo"
                subtitle="Confronto chiaro tra spesa totale e IVA."
                data={monthlySpend}
                mode="double"
              />

              <HorizontalChart
                title="Spese per lavorazione"
                subtitle="Le aree che assorbono più budget nel cantiere."
                data={jobStats.map((item) => ({ label: item.job, value: item.total }))}
              />

              <>
                <HorizontalChart
                  title="Spese per categoria"
                  subtitle="Materiali, vitto, alloggi, noleggi e altre aree di costo."
                  data={categoryBreakdown}
                />
                <HorizontalChart
                  title="Fornitori principali"
                  subtitle="Chi pesa di più sul totale spese."
                  data={supplierBreakdown}
                />
                <HorizontalChart
                  title="Metodi di pagamento"
                  subtitle="Distribuzione tra bonifico, carta, contanti e conto."
                  data={paymentBreakdown}
                />
                <HorizontalChart
                  title="Caricamenti per utente"
                  subtitle="Controllo operativo su chi sta registrando i documenti."
                  data={uploaderBreakdown}
                />
              </>

              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Ultime spese</div>
                    <div className="mt-1 text-xs text-slate-500">
                      Le registrazioni più recenti del sistema.
                    </div>
                  </div>
                  <SecondaryButton onClick={() => setScreen("archive")} className="px-3 py-2 text-xs">
                    Apri archivio
                  </SecondaryButton>
                </div>
                <div className="mt-4 space-y-3">
                  {recentExpenses.length ? (
                    recentExpenses.map((record) => (
                      <ExpenseCard
                        key={record.id}
                        record={record}
                        onOpen={setSelectedExpense}
                        onOpenJob={openJob}
                        canOpenJob
                        showMeta
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="Nessuna spesa"
                      subtitle="Non ci sono ancora movimenti nel cantiere selezionato."
                    />
                  )}
                </div>
              </Card>
            </>
          )}

          {screen === "archive" && (
            <>
              <HeaderBlock
                eyebrow="Archivio"
                title="Archivio spese"
                subtitle="Ricerca, filtri e riepilogo in una sola schermata."
                action={null}
              />

              <Card className="p-4 space-y-3">
                <input
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="Cerca per lavorazione, fornitore, descrizione o categoria"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
                <div>
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    Lavorazioni
                  </div>
                  <div className="-mx-1 overflow-x-auto px-1">
                    <div className="flex gap-2">
                      {jobsList.map((job) => (
                        <Pill key={job} active={jobFilter === job} onClick={() => setJobFilter(job)}>
                          {job === "Tutti" ? "Tutte" : job}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label="Movimenti visibili"
                  value={String(filteredRecords.length)}
                  hint="Dopo i filtri"
                />
                <StatCard
                  label="Totale master"
                  value={currency(totals.total)}
                  hint="Stessa fonte di Home"
                  emphasis
                />
                <StatCard
                  label="IVA master"
                  value={currency(totals.vat)}
                  hint="Riepilogo master"
                />
                <StatCard
                  label="Imponibile master"
                  value={currency(totals.imponibile)}
                  hint="Riepilogo master"
                />
              </div>

              <Card className="p-4">
                <div className="text-xs leading-5 text-slate-500">
                  I box riepilogo di questa schermata usano la stessa fonte della Home e dei Documenti:
                  il riepilogo master/API. I filtri qui sotto agiscono sulla lista dei movimenti, non sui totali master.
                </div>
              </Card>

              <div className="space-y-3">
                {filteredRecords.length ? (
                  filteredRecords.map((record) => (
                    <ExpenseCard
                      key={record.id}
                      record={record}
                      onOpen={setSelectedExpense}
                      onOpenJob={openJob}
                      canOpenJob
                      showMeta
                    />
                  ))
                ) : (
                  <EmptyState
                    title="Nessuna spesa trovata"
                    subtitle="Prova a cambiare ricerca o lavorazione selezionata."
                  />
                )}
              </div>
            </>
          )}

          {screen === "documents" && (
            <>
              <HeaderBlock
                eyebrow="Documenti"
                title="Archivio documenti"
                subtitle="Una schermata pulita per aprire e controllare i documenti collegati alle spese."
              />

              <Card className="p-4 space-y-3">
                <input
                  value={documentSearch}
                  onChange={(e) => setDocumentSearch(e.target.value)}
                  placeholder="Cerca per nome file, fornitore, numero o categoria"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard
                    label="Documenti visibili"
                    value={String(filteredDocuments.length)}
                    hint="Dopo la ricerca"
                  />
                  <StatCard
                    label="Documenti master"
                    value={String(totals.docs)}
                    hint="Stessa fonte di Home"
                  />
                  <StatCard
                    label="Totale master"
                    value={currency(totals.total)}
                    hint="Riepilogo master"
                    emphasis
                  />
                  <StatCard
                    label="Imponibile master"
                    value={currency(totals.imponibile)}
                    hint="Riepilogo master"
                  />
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                  Anche qui i box riepilogo usano il riepilogo master/API per restare coerenti con Home e Spese.
                </div>
              </Card>

              <div className="space-y-3">
                {filteredDocuments.length ? (
                  filteredDocuments.map((doc) => (
                    <DocumentCard key={doc.documentId} doc={doc} onOpen={setSelectedDocument} />
                  ))
                ) : (
                  <EmptyState
                    title="Nessun documento trovato"
                    subtitle="Prova con un’altra ricerca."
                  />
                )}
              </div>
            </>
          )}

          {screen === "site" && (
            <>
              <HeaderBlock
                eyebrow="Cantiere"
                title={activeSiteName}
                subtitle="Una sola schermata per capire il cantiere e navigare le lavorazioni."
                action={null}
              />

              <Card className="p-4 lg:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{activeSiteName}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Cliente: {activeSiteClient} • {activeSiteLocation}
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700">
                    {activeSiteStatus}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      Lavorazioni
                    </div>
                    <div className="mt-1 text-sm font-semibold">{jobStats.length}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      Documenti
                    </div>
                    <div className="mt-1 text-sm font-semibold">{totals.docs}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      Spesa totale
                    </div>
                    <div className="mt-1 text-sm font-semibold">{currency(totals.total)}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      IVA totale
                    </div>
                    <div className="mt-1 text-sm font-semibold">{currency(totals.vat)}</div>
                  </div>
                </div>
              </Card>

              <HorizontalChart
                title="Spese per lavorazione"
                subtitle="Distribuzione del costo tra le varie lavorazioni del cantiere."
                data={jobStats.map((item) => ({ label: item.job, value: item.total }))}
              />

              <div className="space-y-3">
                {jobStats.length ? (
                  jobStats.map((item) => (
                    <JobCard
                      key={item.jobId}
                      item={item}
                      onOpen={openJob}
                      advanced
                    />
                  ))
                ) : (
                  <EmptyState title="Nessuna lavorazione" subtitle="Non ci sono lavorazioni disponibili." />
                )}
              </div>
            </>
          )}

          {screen === "job" && visibleJob && (
            <>
              <HeaderBlock
                eyebrow="Lavorazione"
                title={visibleJob.job}
                subtitle={
                  visibleJob.externalCompanies.length
                    ? `Ditta esterna collegata: ${visibleJob.externalCompanies.join(", ")}`
                    : "Lavorazione / centro di costo interno"
                }
                action={<SecondaryButton onClick={() => setScreen("site")}>Indietro</SecondaryButton>}
              />

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Spesa totale" value={currency(visibleJob.total)} emphasis />
                <StatCard label="Documenti" value={String(visibleJob.count)} />
                <StatCard label="Imponibile" value={currency(visibleJob.imponibile)} />
                <StatCard label="IVA" value={currency(visibleJob.vat)} />
              </div>

              <Card className="p-4 lg:p-5">
                <div className="text-sm font-semibold text-slate-900">Documenti collegati</div>
                <div className="mt-4 space-y-3">
                  {selectedJobDocuments.length ? (
                    selectedJobDocuments.map((doc) => (
                      <DocumentCard key={doc.documentId} doc={doc} onOpen={setSelectedDocument} />
                    ))
                  ) : (
                    <EmptyState
                      title="Nessun documento"
                      subtitle="Questa lavorazione non ha ancora documenti collegati."
                    />
                  )}
                </div>
              </Card>

              <Card className="p-4 lg:p-5">
                <div className="text-sm font-semibold text-slate-900">Spese collegate alla lavorazione</div>
                <div className="mt-4 space-y-3">
                  {selectedJobExpenses.length ? (
                    selectedJobExpenses.map((record) => (
                      <ExpenseCard
                        key={record.id}
                        record={record}
                        onOpen={setSelectedExpense}
                        onOpenJob={openJob}
                        canOpenJob={false}
                        showMeta
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="Nessuna spesa"
                      subtitle="Questa lavorazione non ha ancora movimenti collegati."
                    />
                  )}
                </div>
              </Card>
            </>
          )}

          {screen === "users" && (
            <>
              <HeaderBlock
                eyebrow="Permessi"
                title="Utenti e ruoli"
                subtitle="Una schermata più leggibile per capire chi può fare cosa."
              />

              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">Titolare / Admin</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Accesso completo a dashboard, archivio, cantiere, lavorazioni e dettagli.
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">
                    Capo
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-sm font-semibold text-slate-900">Cantiere selezionato</div>
                <div className="mt-4 space-y-2">
                  <InfoRow label="Nome" value={activeSiteName} />
                  <InfoRow label="Cliente" value={activeSiteClient} />
                  <InfoRow label="Luogo" value={activeSiteLocation} />
                  <InfoRow label="Aggiornato" value={generatedAt ? formatDateTime(generatedAt) : "-"} />
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-sm font-semibold text-slate-900">Riepilogo contenuti</div>
                <div className="mt-4 space-y-2">
                  <InfoRow label="Spese" value={String(totals.expenseCount)} />
                  <InfoRow label="Documenti" value={String(totals.docs)} />
                  <InfoRow label="Lavorazioni" value={String(totals.jobCount)} />
                  <InfoRow label="Importo totale" value={currency(totals.total)} highlight />
                </div>
              </Card>
            </>
          )}
        </main>

        <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md border-t border-slate-200 bg-white/95 backdrop-blur md:max-w-3xl lg:max-w-6xl xl:max-w-7xl">
          <div className="grid grid-cols-5 px-2 py-2">
            {navItems.map((item) => {
              const active = screen === item.id || (item.id === "site" && screen === "job");
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedExpense(null);
                    if (item.id !== "job") setSelectedJobId("");
                    setScreen(item.id);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[11px] transition",
                    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"
                  )}
                >
                  <span className={cn("text-base", active && "scale-110")}>{item.emoji}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {selectedExpense ? (
          <div className="fixed inset-0 z-30 bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
            <div className="mx-auto mt-8 max-w-md lg:max-w-xl">
              <Card className="max-h-[85vh] overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        Dettaglio spesa
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">
                        {selectedExpense.description}
                      </div>
                    </div>
                    <SecondaryButton onClick={() => setSelectedExpense(null)} className="px-3 py-2 text-xs">
                      Chiudi
                    </SecondaryButton>
                  </div>
                </div>

                <div className="max-h-[calc(85vh-92px)] overflow-y-auto px-5 py-4 space-y-3">
                  <InfoRow label="Cantiere" value={selectedExpense.site} />
                  <InfoRow label="Lavorazione" value={selectedExpense.job} />
                  <InfoRow label="Data" value={dateLabel(selectedExpense.date)} />
                  <InfoRow label="Totale" value={currency(selectedExpense.amount)} highlight />
                  <InfoRow label="Imponibile" value={currency(selectedExpense.imponibile)} />
                  <InfoRow label="IVA" value={currency(selectedExpense.vat)} />
                  <InfoRow label="Fornitore" value={selectedExpense.supplier || "—"} />
                  <InfoRow label="Metodo" value={selectedExpense.paymentMethod || "—"} />
                  <InfoRow label="Categoria" value={selectedExpense.category || "—"} />
                  {selectedExpense.externalCompany ? (
                    <InfoRow label="Ditta esterna" value={selectedExpense.externalCompany} />
                  ) : null}
                  <InfoRow label="Caricata da" value={selectedExpense.uploadedBy || "—"} />
                  <InfoRow label="Documento" value={selectedExpense.file || "—"} />

                  {selectedExpense.items?.length ? (
                    <Card className="p-4 bg-slate-50 border-slate-100">
                      <div className="text-sm font-semibold text-slate-900">Dettaglio materiali / voci</div>
                      <div className="mt-3 space-y-2">
                        {selectedExpense.items.slice(0, 10).map((item, index) => (
                          <div
                            key={`${item.itemName || item.name || "item"}-${index}`}
                            className="rounded-2xl bg-white px-3 py-3"
                          >
                            <div className="text-sm font-medium text-slate-900">
                              {item.itemName || item.name || item.description || "Voce"}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {item.category || "Categoria"}
                              {item.quantity ? ` • Q.tà ${item.quantity}` : ""}
                              {item.total ? ` • ${currency(item.total)}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <PrimaryButton
                      onClick={() => {
                        if (selectedExpense.rawDocument?.fileUrl) {
                          window.open(
                            selectedExpense.rawDocument.fileUrl,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }
                      }}
                      disabled={!selectedExpense.rawDocument?.fileUrl}
                    >
                      Apri file
                    </PrimaryButton>
                    <SecondaryButton
                      onClick={() => {
                        if (selectedExpense.jobId) {
                          openJob(selectedExpense.jobId);
                        }
                        setSelectedExpense(null);
                      }}
                    >
                      Vai alla lavorazione
                    </SecondaryButton>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : null}

        {selectedDocument ? (
          <div className="fixed inset-0 z-30 bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
            <div className="mx-auto mt-8 max-w-md lg:max-w-xl">
              <Card className="max-h-[85vh] overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        Dettaglio documento
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900 line-clamp-2">
                        {selectedDocument.fileName || "Documento"}
                      </div>
                    </div>
                    <SecondaryButton onClick={() => setSelectedDocument(null)} className="px-3 py-2 text-xs">
                      Chiudi
                    </SecondaryButton>
                  </div>
                </div>

                <div className="max-h-[calc(85vh-92px)] overflow-y-auto px-5 py-4 space-y-3">
                  <InfoRow label="Data" value={formatDate(selectedDocument.date)} />
                  <InfoRow label="Importo" value={currency(selectedDocument.amount)} highlight />
                  <InfoRow label="Fornitore" value={selectedDocument.supplier || "—"} />
                  <InfoRow label="Tipo" value={selectedDocument.type || "—"} />
                  <InfoRow label="Numero" value={selectedDocument.documentNumber || "—"} />
                  <InfoRow label="Cartella" value={selectedDocument.folder || "—"} />
                  <InfoRow label="Categoria" value={selectedDocument.category || "—"} />
                  <InfoRow label="Nota" value={selectedDocument.note || "—"} />

                  <Card className="p-4 bg-slate-50 border-slate-100">
                    <div className="text-sm font-semibold text-slate-900">Spese collegate</div>
                    <div className="mt-3 space-y-2">
                      {selectedDocumentLinkedExpenses.length ? (
                        selectedDocumentLinkedExpenses.map((record) => (
                          <div key={record.id} className="rounded-2xl bg-white px-3 py-3">
                            <div className="text-sm font-medium text-slate-900">{record.description}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {record.job} • {dateLabel(record.date)} • {currency(record.amount)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl bg-white px-3 py-3 text-sm text-slate-500">
                          Nessuna spesa collegata.
                        </div>
                      )}
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <PrimaryButton
                      onClick={() => {
                        if (selectedDocument.fileUrl) {
                          window.open(selectedDocument.fileUrl, "_blank", "noopener,noreferrer");
                        }
                      }}
                      disabled={!selectedDocument.fileUrl}
                    >
                      Apri file
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setSelectedDocument(null)}>Chiudi</SecondaryButton>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function dateLabel(value) {
  return formatDate(value);
}

function monthKey(value) {
  if (!value) return "0000-00";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
