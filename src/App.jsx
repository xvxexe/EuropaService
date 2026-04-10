import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbznT45oMXeEA968iARFhdUWIEpit17cd2EF_I2gORicQzNt6DGKm_Wa_kJqFEbWATR1/exec";

const CURRENT_USER_LABEL = "Capo/Admin";

function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Card({ children, className = "" }) {
  return <div className={cn("card", className)}>{children}</div>;
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button {...props} className={cn("btn btn-primary", className)}>
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button {...props} className={cn("btn btn-secondary", className)}>
      {children}
    </button>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={cn("pill", active && "pill-active")}>
      {children}
    </button>
  );
}

function SectionToggle({
  value,
  onChange,
  leftLabel = "Vista semplice",
  rightLabel = "Vista completa",
}) {
  return (
    <div className="toggle-wrap">
      <div className="toggle-grid">
        <button
          type="button"
          onClick={() => onChange("simple")}
          className={cn("toggle-btn", value === "simple" && "toggle-btn-active")}
        >
          {leftLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange("advanced")}
          className={cn("toggle-btn", value === "advanced" && "toggle-btn-active")}
        >
          {rightLabel}
        </button>
      </div>
    </div>
  );
}

function HeaderBlock({ eyebrow, title, subtitle, action }) {
  return (
    <div className="header-block">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <div className="header-block-row">
        <div className="header-block-copy">
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {action ? <div className="header-block-action">{action}</div> : null}
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, emphasis = false }) {
  const safeValue = value === undefined || value === null || value === "" ? "—" : value;
  return (
    <div className={cn("stat-card", emphasis && "stat-card-dark")}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{safeValue}</div>
      {hint ? <div className="stat-hint">{hint}</div> : null}
    </div>
  );
}

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="info-row">
      <div className="info-row-label">{label}</div>
      <div className={cn("info-row-value", highlight && "info-row-value-strong")}>{value}</div>
    </div>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <Card className="empty-state">
      <div className="empty-state-icon">📂</div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-subtitle">{subtitle}</div>
      {action ? <div className="empty-state-action">{action}</div> : null}
    </Card>
  );
}

function HorizontalChart({ title, subtitle, data, mode = "single" }) {
  const safe = data?.length ? data : [{ label: "Nessun dato", value: 0 }];
  const maxValue = Math.max(
    ...safe.map((item) =>
      mode === "double"
        ? Math.max(item.primary || 0, item.secondary || 0)
        : item.value || 0
    ),
    1
  );

  return (
    <Card className="chart-card">
      <div className="chart-title">{title}</div>
      {subtitle ? <div className="chart-subtitle">{subtitle}</div> : null}

      <div className="chart-list">
        {safe.map((item) => (
          <div key={item.label} className="chart-item">
            <div className="chart-head">
              <span className="chart-item-label">{item.label}</span>
              <span className="chart-item-value">
                {mode === "double"
                  ? `${currency(item.primary || 0)} • IVA ${currency(item.secondary || 0)}`
                  : currency(item.value || 0)}
              </span>
            </div>

            {mode === "double" ? (
              <div className="chart-double">
                <div>
                  <div className="chart-bar-label">Spesa</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max(4, (((item.primary || 0) / maxValue) * 100))}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="chart-bar-label">IVA</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill bar-fill-light"
                      style={{ width: `${Math.max(4, (((item.secondary || 0) / maxValue) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bar-track chart-single-bar">
                <div
                  className="bar-fill"
                  style={{ width: `${Math.max(4, (((item.value || 0) / maxValue) * 100))}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function SummaryBanner({ siteName, totalRecords, totalAmount }) {
  return (
    <Card className="summary-banner">
      <div className="summary-top">
        <div className="summary-copy">
          <div className="summary-kicker">Area amministrazione</div>
          <div className="summary-title">Controllo spese del cantiere</div>
          <div className="summary-text">
            Una vista chiara di lavorazioni, documenti e costi del cantiere selezionato.
          </div>
        </div>
        <div className="summary-mini">
          <div className="summary-mini-label">Documenti</div>
          <div className="summary-mini-value">{totalRecords}</div>
        </div>
      </div>

      <div className="summary-bottom">
        <div>
          <div className="summary-bottom-label">Totale visibile</div>
          <div className="summary-bottom-value">{currency(totalAmount)}</div>
        </div>
        <div className="summary-site-badge">{siteName || "Cantiere"}</div>
      </div>
    </Card>
  );
}

function QuickActionCard({ title, subtitle, icon, onClick }) {
  return (
    <button onClick={onClick} className="quick-action-btn">
      <Card className="quick-action-card">
        <div className="quick-action-icon">{icon}</div>
        <div className="quick-action-copy">
          <div className="quick-action-title">{title}</div>
          <div className="quick-action-subtitle">{subtitle}</div>
        </div>
      </Card>
    </button>
  );
}

function ExpenseCard({ record, onOpen, onOpenJob, showMeta = false }) {
  return (
    <button onClick={() => onOpen(record)} className="record-btn">
      <Card className="expense-card">
        <div className="expense-top">
          <div className="expense-main">
            <div className="expense-title">{record.description || "—"}</div>
            <button
              type="button"
              className="text-link"
              onClick={(e) => {
                e.stopPropagation();
                onOpenJob(record.jobId);
              }}
            >
              {record.job}
            </button>

            <div className="chip-row">
              <span className="chip-soft">{dateLabel(record.date)}</span>
              <span className="chip-soft">{record.paymentMethod || "-"}</span>
            </div>
          </div>

          <div className="expense-side">
            <div className="status-chip">{record.status}</div>
            <div className="expense-value">{currency(record.amount)}</div>
          </div>
        </div>

        <div className="mini-grid mini-grid-3">
          <div className="mini-stat">
            <div className="mini-stat-label">Imponibile</div>
            <div className="mini-stat-value">{currency(record.imponibile)}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">IVA</div>
            <div className="mini-stat-value">{currency(record.vat)}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">Caricata da</div>
            <div className="mini-stat-value mini-stat-value-small">{record.uploadedBy}</div>
          </div>
        </div>

        {showMeta ? (
          <div className="meta-strip">
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
    <button onClick={() => onOpen(item.jobId)} className="record-btn">
      <Card className="job-card">
        <div className="job-top">
          <div className="job-main">
            <div className="job-title">{item.job}</div>
            <div className="job-subtitle">
              {item.externalCompanies.length
                ? `Ditta esterna: ${item.externalCompanies.join(", ")}`
                : "Lavorazione interna"}
            </div>
          </div>
          <div className="job-side">
            <div className="job-total">{currency(item.total)}</div>
            <div className="job-count">{item.count} documenti</div>
          </div>
        </div>

        <div className={cn("mini-grid", advanced ? "mini-grid-4" : "mini-grid-3")}>
          <div className="mini-stat">
            <div className="mini-stat-label">Spesa</div>
            <div className="mini-stat-value">{currency(item.total)}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">IVA</div>
            <div className="mini-stat-value">{currency(item.vat)}</div>
          </div>
          <div className="mini-stat">
            <div className="mini-stat-label">Documenti</div>
            <div className="mini-stat-value">{item.count}</div>
          </div>
          {advanced ? (
            <div className="mini-stat">
              <div className="mini-stat-label">Imponibile</div>
              <div className="mini-stat-value">{currency(item.imponibile)}</div>
            </div>
          ) : null}
        </div>
      </Card>
    </button>
  );
}

function DocumentCard({ doc, onOpen }) {
  return (
    <button onClick={() => onOpen(doc)} className="record-btn">
      <Card className="document-card">
        <div className="document-top">
          <div className="document-main">
            <div className="document-title">{doc.fileName || "Documento"}</div>
            <div className="document-subtitle">
              {(doc.supplier || "-") + " • " + (doc.type || "-") + " • " + (doc.documentNumber || "-")}
            </div>
          </div>
          <div className="document-side">
            <div className="chip-soft">{formatDate(doc.date)}</div>
            <div className="document-value">{currency(doc.amount)}</div>
          </div>
        </div>
      </Card>
    </button>
  );
}

function LoginScreen({ password, setPassword, onLogin, loading, error }) {
  return (
    <div className="login-shell">
      <style>{styles}</style>
      <div className="login-wrap">
        <div className="login-stack">
          <div className="login-hero">
            <div className="summary-kicker">Accesso amministrazione</div>
            <h1 className="login-title">Gestione spese cantieri</h1>
            <p className="login-copy">
              Interfaccia mobile-first connessa al Google Sheets master tramite Apps Script.
            </p>
          </div>

          <Card className="login-card">
            <div className="field-block">
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onLogin();
                }}
                className="input"
              />
            </div>

            <PrimaryButton onClick={onLogin} disabled={loading} className="btn-block">
              {loading ? "Verifica accesso..." : "Entra"}
            </PrimaryButton>

            {error ? <div className="alert-error">{error}</div> : null}
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
  const [dashboardViewMode, setDashboardViewMode] = useState("simple");
  const [archiveViewMode, setArchiveViewMode] = useState("simple");
  const [siteViewMode, setSiteViewMode] = useState("simple");

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

  const siteJobs = useMemo(() => jobs.filter((job) => job.siteId === currentSiteId), [jobs, currentSiteId]);
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
          items: [],
          rawExpense: expense,
          rawDocument: relatedDocument || null,
          rawJob: relatedJob || null,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [siteExpenses, jobMap, documentMap, activeSite]);

  const totals = useMemo(() => {
    const total = expenseRecords.reduce((sum, record) => sum + toNumber(record.amount), 0);
    const imponibile = expenseRecords.reduce((sum, record) => sum + toNumber(record.imponibile), 0);
    const vat = expenseRecords.reduce((sum, record) => sum + toNumber(record.vat), 0);

    return {
      total,
      imponibile,
      vat,
      docs: siteDocuments.length,
      average: expenseRecords.length ? total / expenseRecords.length : 0,
      expenseCount: expenseRecords.length,
      jobCount: siteJobs.length,
    };
  }, [expenseRecords, siteDocuments.length, siteJobs.length]);

  const jobsList = useMemo(() => ["Tutti", ...siteJobs.map((job) => job.jobName)], [siteJobs]);

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
          imponibile: relatedExpenses.reduce(
            (sum, record) => sum + toNumber(record.imponibile),
            0
          ),
          vat: relatedExpenses.reduce((sum, record) => sum + toNumber(record.vat), 0),
          count: relatedDocuments.length,
          expenseCount: relatedExpenses.length,
          externalCompanies,
          note: job.note || "",
          type: job.type || "",
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [siteJobs, expenseRecords, siteDocuments]);

  const visibleJob = useMemo(
    () => jobStats.find((item) => item.jobId === selectedJobId) || null,
    [jobStats, selectedJobId]
  );

  const monthlySpend = useMemo(() => {
    const map = new Map();
    expenseRecords.forEach((record) => {
      const key = monthKey(record.date);
      const existing = map.get(key) || {
        label: monthLabel(key),
        primary: 0,
        secondary: 0,
        sortKey: key,
      };
      existing.primary += toNumber(record.amount);
      existing.secondary += toNumber(record.vat);
      map.set(key, existing);
    });
    return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [expenseRecords]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map();
    expenseRecords.forEach((record) => {
      const label = record.category || "Generale";
      map.set(label, (map.get(label) || 0) + toNumber(record.amount));
    });
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenseRecords]);

  const supplierBreakdown = useMemo(() => {
    const map = new Map();
    expenseRecords.forEach((record) => {
      const label = record.supplier || "Senza fornitore";
      map.set(label, (map.get(label) || 0) + toNumber(record.amount));
    });
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [expenseRecords]);

  const paymentBreakdown = useMemo(() => {
    const map = new Map();
    expenseRecords.forEach((record) => {
      const label = record.paymentMethod || "-";
      map.set(label, (map.get(label) || 0) + toNumber(record.amount));
    });
    return [...map.entries()]
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
    { id: "documents", label: "Documenti", emoji: "🗂️" },
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
      <>
        <style>{styles}</style>
        <div className="app-shell">
          <div className="loading-state">Caricamento dati...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="app-shell">
        <div className="app-wrap">
          <div className="hero-grid">
            <SummaryBanner
              siteName={activeSiteName}
              totalRecords={totals.docs}
              totalAmount={totals.total}
            />

            <Card className="site-card-box">
              <div className="summary-kicker dark-kicker">Cantiere attivo</div>
              <div className="site-card-stack">
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
                  className="input"
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

                <div className="mini-grid mini-grid-2">
                  <div className="mini-stat align-left">
                    <div className="mini-stat-label">Cliente</div>
                    <div className="mini-stat-value">{activeSiteClient}</div>
                  </div>
                  <div className="mini-stat align-left">
                    <div className="mini-stat-label">Stato</div>
                    <div className="mini-stat-value">{activeSiteStatus}</div>
                  </div>
                </div>

                <div className="meta-strip">
                  {activeSiteLocation} • Aggiornato {generatedAt ? formatDateTime(generatedAt) : "-"}
                </div>

                <SecondaryButton onClick={logout} className="btn-block">
                  Esci
                </SecondaryButton>
              </div>
            </Card>
          </div>

          {screen === "dashboard" ? (
            <div className="sticky-toggle">
              <SectionToggle
                value={dashboardViewMode}
                onChange={setDashboardViewMode}
                leftLabel="Vista semplice"
                rightLabel="Vista completa"
              />
            </div>
          ) : null}

          <main className="main-stack">
            {screen === "dashboard" && (
              <>
                <HeaderBlock
                  eyebrow="Panoramica"
                  title="Dashboard spese"
                  subtitle="Navigazione più chiara e dati principali sempre visibili."
                  action={<PrimaryButton onClick={() => setScreen("archive")}>Apri spese</PrimaryButton>}
                />

                <div className="grid-cards stats-grid">
                  <StatCard label="Spese totali" value={currency(totals.total)} hint="Totale uscite" emphasis />
                  <StatCard label="Documenti" value={String(totals.docs)} hint="Documenti collegati" />
                  <StatCard label="Imponibile" value={currency(totals.imponibile)} hint="Base imponibile" />
                  <StatCard label="IVA totale" value={currency(totals.vat)} hint="IVA complessiva" />
                  {dashboardViewMode === "advanced" ? (
                    <StatCard label="Spesa media" value={currency(totals.average)} hint="Media per movimento" />
                  ) : null}
                  {dashboardViewMode === "advanced" ? (
                    <StatCard
                      label="Lavorazione principale"
                      value={topJob ? topJob.job : "—"}
                      hint={topJob ? currency(topJob.total) : "Nessun dato"}
                    />
                  ) : null}
                </div>

                <div className="grid-cards quick-grid">
                  <QuickActionCard
                    icon="📄"
                    title="Archivio spese"
                    subtitle="Cerca e filtra rapidamente i movimenti."
                    onClick={() => setScreen("archive")}
                  />
                  <QuickActionCard
                    icon="🗂️"
                    title="Documenti"
                    subtitle="Apri l’archivio digitale del cantiere."
                    onClick={() => setScreen("documents")}
                  />
                  <QuickActionCard
                    icon="🏗️"
                    title="Lavorazioni"
                    subtitle="Consulta costi e documenti per lavorazione."
                    onClick={() => setScreen("site")}
                  />
                  <QuickActionCard
                    icon="ℹ️"
                    title="Info portale"
                    subtitle="Vedi stato cantiere e impostazioni rapide."
                    onClick={() => setScreen("users")}
                  />
                </div>

                <Card className="section-card">
                  <div className="row-head-between">
                    <div>
                      <div className="section-title-small">Cantiere attivo</div>
                      <div className="section-note">Cliente, stato e riepilogo generale del sito.</div>
                    </div>
                    <div className="status-chip status-chip-green">{activeSiteStatus}</div>
                  </div>
                  <div className="info-stack">
                    <InfoRow label="Nome cantiere" value={activeSiteName} highlight />
                    <InfoRow label="Cliente" value={activeSiteClient} />
                    <InfoRow label="Luogo" value={activeSiteLocation} />
                    <InfoRow label="Lavorazioni attive" value={String(jobStats.length)} />
                  </div>
                </Card>

                <div className="grid-cards chart-grid">
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
                </div>

                {dashboardViewMode === "advanced" ? (
                  <div className="grid-cards chart-grid">
                    <HorizontalChart
                      title="Spese per categoria"
                      subtitle="Materiali, vitto, alloggi e altre aree di costo."
                      data={categoryBreakdown}
                    />
                    <HorizontalChart
                      title="Fornitori principali"
                      subtitle="Chi pesa di più sul totale spese."
                      data={supplierBreakdown}
                    />
                    <HorizontalChart
                      title="Metodi di pagamento"
                      subtitle="Distribuzione dei metodi di pagamento."
                      data={paymentBreakdown}
                    />
                    <HorizontalChart
                      title="Caricamenti per utente"
                      subtitle="Controllo operativo del caricamento."
                      data={uploaderBreakdown}
                    />
                  </div>
                ) : null}

                <Card className="section-card">
                  <div className="row-head-between">
                    <div>
                      <div className="section-title-small">Ultime spese</div>
                      <div className="section-note">Le registrazioni più recenti del sistema.</div>
                    </div>
                    <SecondaryButton onClick={() => setScreen("archive")}>Apri archivio</SecondaryButton>
                  </div>
                  <div className="stack-list">
                    {recentExpenses.length ? (
                      recentExpenses.map((record) => (
                        <ExpenseCard
                          key={record.id}
                          record={record}
                          onOpen={setSelectedExpense}
                          onOpenJob={openJob}
                          showMeta={dashboardViewMode === "advanced"}
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
                  action={<SectionToggle value={archiveViewMode} onChange={setArchiveViewMode} />}
                />

                <Card className="section-card section-card-tight">
                  <input
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    placeholder="Cerca per lavorazione, fornitore, descrizione o categoria"
                    className="input"
                  />
                  <div>
                    <div className="filter-label">Lavorazioni</div>
                    <div className="pill-scroll">
                      <div className="pill-row">
                        {jobsList.map((job) => (
                          <Pill key={job} active={jobFilter === job} onClick={() => setJobFilter(job)}>
                            {job === "Tutti" ? "Tutte" : job}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid-cards stats-grid">
                  <StatCard label="Movimenti visibili" value={String(filteredRecords.length)} hint="Dopo i filtri" />
                  <StatCard
                    label="Totale visibile"
                    value={currency(filteredRecords.reduce((sum, record) => sum + toNumber(record.amount), 0))}
                    hint="Somma selezionata"
                    emphasis
                  />
                  {archiveViewMode === "advanced" ? (
                    <StatCard
                      label="IVA visibile"
                      value={currency(filteredRecords.reduce((sum, record) => sum + toNumber(record.vat), 0))}
                    />
                  ) : null}
                  {archiveViewMode === "advanced" ? (
                    <StatCard
                      label="Imponibile visibile"
                      value={currency(filteredRecords.reduce((sum, record) => sum + toNumber(record.imponibile), 0))}
                    />
                  ) : null}
                </div>

                <div className="stack-list">
                  {filteredRecords.length ? (
                    filteredRecords.map((record) => (
                      <ExpenseCard
                        key={record.id}
                        record={record}
                        onOpen={setSelectedExpense}
                        onOpenJob={openJob}
                        showMeta={archiveViewMode === "advanced"}
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

                <Card className="section-card section-card-tight">
                  <input
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    placeholder="Cerca per nome file, fornitore, numero o categoria"
                    className="input"
                  />
                  <div className="grid-cards stats-grid">
                    <StatCard label="Documenti visibili" value={String(filteredDocuments.length)} hint="Dopo la ricerca" />
                    <StatCard
                      label="Totale documenti"
                      value={currency(filteredDocuments.reduce((sum, doc) => sum + toNumber(doc.amount), 0))}
                      hint="Importi collegati"
                      emphasis
                    />
                  </div>
                </Card>

                <div className="stack-list">
                  {filteredDocuments.length ? (
                    filteredDocuments.map((doc) => (
                      <DocumentCard key={doc.documentId} doc={doc} onOpen={setSelectedDocument} />
                    ))
                  ) : (
                    <EmptyState title="Nessun documento trovato" subtitle="Prova con un’altra ricerca." />
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
                  action={<SectionToggle value={siteViewMode} onChange={setSiteViewMode} />}
                />

                <Card className="section-card">
                  <div className="row-head-between">
                    <div>
                      <div className="section-title-large">{activeSiteName}</div>
                      <div className="section-note">
                        Cliente: {activeSiteClient} • {activeSiteLocation}
                      </div>
                    </div>
                    <div className="status-chip status-chip-green">{activeSiteStatus}</div>
                  </div>

                  <div className={cn("mini-grid", siteViewMode === "advanced" ? "mini-grid-4" : "mini-grid-3")}>
                    <div className="mini-stat">
                      <div className="mini-stat-label">Lavorazioni</div>
                      <div className="mini-stat-value">{jobStats.length}</div>
                    </div>
                    <div className="mini-stat">
                      <div className="mini-stat-label">Documenti</div>
                      <div className="mini-stat-value">{totals.docs}</div>
                    </div>
                    <div className="mini-stat">
                      <div className="mini-stat-label">Spesa totale</div>
                      <div className="mini-stat-value">{currency(totals.total)}</div>
                    </div>
                    {siteViewMode === "advanced" ? (
                      <div className="mini-stat">
                        <div className="mini-stat-label">IVA totale</div>
                        <div className="mini-stat-value">{currency(totals.vat)}</div>
                      </div>
                    ) : null}
                  </div>
                </Card>

                {siteViewMode === "advanced" ? (
                  <HorizontalChart
                    title="Spese per lavorazione"
                    subtitle="Distribuzione del costo tra le varie lavorazioni del cantiere."
                    data={jobStats.map((item) => ({ label: item.job, value: item.total }))}
                  />
                ) : null}

                <div className="stack-list">
                  {jobStats.length ? (
                    jobStats.map((item) => (
                      <JobCard
                        key={item.jobId}
                        item={item}
                        onOpen={openJob}
                        advanced={siteViewMode === "advanced"}
                      />
                    ))
                  ) : (
                    <EmptyState
                      title="Nessuna lavorazione"
                      subtitle="Non risultano lavorazioni per il cantiere selezionato."
                    />
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

                <div className="grid-cards stats-grid">
                  <StatCard label="Spesa totale" value={currency(visibleJob.total)} emphasis />
                  <StatCard label="Documenti" value={String(visibleJob.count)} />
                  <StatCard label="Imponibile" value={currency(visibleJob.imponibile)} />
                  <StatCard label="IVA" value={currency(visibleJob.vat)} />
                </div>

                <Card className="section-card">
                  <div className="section-title-small">Documenti collegati</div>
                  <div className="stack-list">
                    {selectedJobDocuments.length ? (
                      selectedJobDocuments.map((doc) => (
                        <DocumentCard key={doc.documentId} doc={doc} onOpen={setSelectedDocument} />
                      ))
                    ) : (
                      <EmptyState
                        title="Nessun documento collegato"
                        subtitle="Questa lavorazione non ha documenti collegati."
                      />
                    )}
                  </div>
                </Card>

                <Card className="section-card">
                  <div className="section-title-small">Spese collegate alla lavorazione</div>
                  <div className="stack-list">
                    {selectedJobExpenses.length ? (
                      selectedJobExpenses.map((record) => (
                        <ExpenseCard
                          key={record.id}
                          record={record}
                          onOpen={setSelectedExpense}
                          onOpenJob={openJob}
                          showMeta
                        />
                      ))
                    ) : (
                      <EmptyState
                        title="Nessuna spesa collegata"
                        subtitle="Questa lavorazione non ha movimenti collegati."
                      />
                    )}
                  </div>
                </Card>
              </>
            )}

            {screen === "users" && (
              <>
                <HeaderBlock
                  eyebrow="Portale"
                  title="Info e azioni rapide"
                  subtitle="Una schermata più leggibile per capire stato e struttura del portale."
                />

                <Card className="section-card">
                  <div className="row-head-between">
                    <div>
                      <div className="section-title-large">Titolare / Admin</div>
                      <div className="section-note">
                        Accesso completo a dashboard, archivio spese, documenti, cantiere e dettagli.
                      </div>
                    </div>
                    <div className="status-chip">Capo</div>
                  </div>
                </Card>

                <Card className="section-card">
                  <div className="section-title-small">Cantiere selezionato</div>
                  <div className="info-stack">
                    <InfoRow label="Nome" value={activeSiteName} />
                    <InfoRow label="Cliente" value={activeSiteClient} />
                    <InfoRow label="Luogo" value={activeSiteLocation} />
                    <InfoRow label="Aggiornato" value={generatedAt ? formatDateTime(generatedAt) : "-"} />
                  </div>
                </Card>

                <Card className="section-card">
                  <div className="section-title-small">Riepilogo contenuti</div>
                  <div className="info-stack">
                    <InfoRow label="Spese" value={String(totals.expenseCount)} />
                    <InfoRow label="Documenti" value={String(totals.docs)} />
                    <InfoRow label="Lavorazioni" value={String(totals.jobCount)} />
                    <InfoRow label="Importo totale" value={currency(totals.total)} highlight />
                  </div>
                </Card>
              </>
            )}
          </main>
        </div>

        <nav className="bottom-nav">
          <div className="bottom-nav-grid">
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
                  className={cn("nav-btn", active && "nav-btn-active")}
                >
                  <span className="nav-emoji">{item.emoji}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {selectedExpense ? (
          <div className="modal-backdrop">
            <div className="modal-window">
              <Card className="modal-card">
                <div className="modal-head">
                  <div className="modal-copy">
                    <div className="eyebrow">Dettaglio spesa</div>
                    <div className="modal-title">{selectedExpense.description}</div>
                  </div>
                  <SecondaryButton onClick={() => setSelectedExpense(null)}>Chiudi</SecondaryButton>
                </div>

                <div className="modal-body">
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

                  <div className="modal-actions">
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
                        openJob(selectedExpense.jobId);
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
          <div className="modal-backdrop">
            <div className="modal-window">
              <Card className="modal-card">
                <div className="modal-head">
                  <div className="modal-copy">
                    <div className="eyebrow">Dettaglio documento</div>
                    <div className="modal-title">{selectedDocument.fileName || "Documento"}</div>
                  </div>
                  <SecondaryButton onClick={() => setSelectedDocument(null)}>Chiudi</SecondaryButton>
                </div>

                <div className="modal-body">
                  <InfoRow label="Data" value={formatDate(selectedDocument.date)} />
                  <InfoRow label="Importo" value={currency(selectedDocument.amount)} highlight />
                  <InfoRow label="Fornitore" value={selectedDocument.supplier || "—"} />
                  <InfoRow label="Tipo" value={selectedDocument.type || "—"} />
                  <InfoRow label="Numero" value={selectedDocument.documentNumber || "—"} />
                  <InfoRow label="Cartella" value={selectedDocument.folder || "—"} />
                  <InfoRow label="Categoria" value={selectedDocument.category || "—"} />
                  <InfoRow label="Nota" value={selectedDocument.note || "—"} />

                  <Card className="linked-card">
                    <div className="section-title-small">Spese collegate</div>
                    <div className="linked-list">
                      {selectedDocumentLinkedExpenses.length ? (
                        selectedDocumentLinkedExpenses.map((record) => (
                          <div key={record.id} className="linked-item">
                            <div className="linked-item-title">{record.description}</div>
                            <div className="linked-item-subtitle">
                              {record.job} • {dateLabel(record.date)} • {currency(record.amount)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="linked-item linked-item-empty">Nessuna spesa collegata.</div>
                      )}
                    </div>
                  </Card>

                  <div className="modal-actions">
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
    </>
  );
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
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function dateLabel(value) {
  return formatDate(value);
}

function monthKey(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 7) || "-";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabel(key) {
  if (!key || typeof key !== "string" || !key.includes("-")) return String(key || "-");
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(d.getTime())) return key;
  return new Intl.DateTimeFormat("it-IT", { month: "short", year: "numeric" }).format(d);
}

function toNumber(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

const styles = `
* { box-sizing: border-box; }
html, body, #root { min-height: 100%; }
body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
}
button, input, select { font: inherit; }
button { cursor: pointer; }
a { color: inherit; }

.app-shell,
.login-shell {
  min-height: 100vh;
  background: #f1f5f9;
  color: #0f172a;
}

.app-wrap,
.login-wrap {
  width: min(100%, 720px);
  margin: 0 auto;
  padding: 16px 16px 96px;
}

.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.login-stack,
.main-stack,
.stack-list,
.info-stack,
.site-card-stack,
.chart-list,
.linked-list {
  display: grid;
  gap: 16px;
}

.hero-grid {
  display: grid;
  gap: 16px;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
}

.summary-banner {
  overflow: hidden;
  border: none;
  background: linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%);
  color: #ffffff;
  padding: 20px;
}

.summary-top,
.summary-bottom,
.row-head-between,
.document-top,
.job-top,
.expense-top,
.info-row,
.header-block-row,
.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.summary-copy,
.header-block-copy,
.expense-main,
.job-main,
.document-main,
.modal-copy { min-width: 0; flex: 1; }
.summary-kicker,
.eyebrow,
.stat-label,
.mini-stat-label,
.filter-label,
.chart-bar-label,
.summary-mini-label,
.summary-bottom-label,
.dark-kicker {
  font-size: 11px;
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
.summary-kicker,
.summary-mini-label,
.summary-bottom-label { color: #cbd5e1; }
.dark-kicker,
.eyebrow,
.stat-label,
.mini-stat-label,
.filter-label,
.chart-bar-label { color: #64748b; }

.summary-title,
.login-title {
  margin-top: 10px;
  font-size: 30px;
  line-height: 1.05;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.summary-text,
.login-copy,
.page-subtitle,
.section-note,
.job-subtitle,
.document-subtitle,
.chart-subtitle,
.quick-action-subtitle,
.empty-state-subtitle {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #64748b;
}
.summary-text,
.login-copy { color: #cbd5e1; }

.summary-mini {
  min-width: 96px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  padding: 10px 12px;
  text-align: right;
  backdrop-filter: blur(8px);
}
.summary-mini-value {
  margin-top: 4px;
  font-size: 20px;
  font-weight: 700;
}
.summary-bottom {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  align-items: center;
}
.summary-bottom-value {
  margin-top: 4px;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 700;
}
.summary-site-badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(74, 222, 128, 0.14);
  color: #bbf7d0;
  font-size: 11px;
  font-weight: 700;
}

.site-card-box,
.section-card,
.section-card-tight,
.login-card,
.chart-card,
.linked-card {
  padding: 16px;
}
.section-card-tight { display: grid; gap: 14px; }
.linked-card {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.input {
  width: 100%;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 18px;
  padding: 15px 16px;
  outline: none;
  font-size: 15px;
}
.input:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
}
.field-block { display: grid; gap: 8px; }
.field-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 18px;
  padding: 13px 16px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.15s ease, opacity 0.15s ease, background 0.15s ease;
}
.btn:active { transform: scale(0.99); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}
.btn-secondary {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #334155;
}
.btn-block { width: 100%; }

.toggle-wrap {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 4px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}
.toggle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
.toggle-btn {
  border: 0;
  border-radius: 16px;
  padding: 12px 10px;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.toggle-btn-active {
  background: #0f172a;
  color: #ffffff;
}
.sticky-toggle {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-bottom: 14px;
  background: rgba(241,245,249,0.92);
  backdrop-filter: blur(10px);
}

.page-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.08;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.header-block-action { flex-shrink: 0; }
.section-title-small {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.section-title-large {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.grid-cards { display: grid; gap: 12px; }
.stats-grid,
.quick-grid,
.chart-grid { grid-template-columns: 1fr 1fr; }

.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}
.stat-card-dark {
  background: #0f172a;
  border-color: #0f172a;
}
.stat-card-dark .stat-label,
.stat-card-dark .stat-hint { color: #94a3b8; }
.stat-card-dark .stat-value { color: #ffffff; }
.stat-value {
  margin-top: 10px;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 700;
}
.stat-hint {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.quick-action-btn,
.record-btn {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}
.quick-action-card,
.expense-card,
.job-card,
.document-card {
  padding: 16px;
}
.quick-action-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.quick-action-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #f1f5f9;
  font-size: 20px;
  flex-shrink: 0;
}
.quick-action-title,
.expense-title,
.job-title,
.document-title,
.modal-title,
.linked-item-title,
.chart-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
}
.quick-action-subtitle,
.job-subtitle,
.document-subtitle,
.linked-item-subtitle { margin-top: 4px; }

.text-link {
  margin-top: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #64748b;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 12px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.chip-soft,
.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 700;
}
.chip-soft {
  background: #f1f5f9;
  color: #475569;
}
.status-chip {
  background: #0f172a;
  color: #ffffff;
}
.status-chip-green {
  background: #dcfce7;
  color: #15803d;
}

.expense-side,
.job-side,
.document-side {
  flex-shrink: 0;
  text-align: right;
}
.expense-value,
.document-value,
.job-total {
  margin-top: 10px;
  font-size: 20px;
  line-height: 1.15;
  font-weight: 700;
  color: #0f172a;
}
.job-count {
  margin-top: 4px;
  font-size: 11px;
  color: #64748b;
}

.mini-grid {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}
.mini-grid-2 { grid-template-columns: 1fr 1fr; }
.mini-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.mini-grid-4 { grid-template-columns: 1fr 1fr; }
.mini-stat {
  background: #f8fafc;
  border-radius: 18px;
  padding: 12px;
  text-align: center;
}
.mini-stat.align-left { text-align: left; }
.mini-stat-value {
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}
.mini-stat-value-small { font-size: 12px; }
.meta-strip {
  margin-top: 12px;
  border-radius: 18px;
  padding: 12px 14px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
  word-break: break-word;
}

.info-row {
  background: #f8fafc;
  border-radius: 18px;
  padding: 14px 16px;
}
.info-row-label {
  font-size: 14px;
  color: #64748b;
}
.info-row-value {
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  max-width: 58%;
  word-break: break-word;
}
.info-row-value-strong { color: #0f172a; }

.chart-card { padding: 16px; }
.chart-list { margin-top: 14px; }
.chart-item {
  background: #f8fafc;
  border-radius: 18px;
  padding: 12px;
}
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: #64748b;
}
.chart-item-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chart-double { display: grid; gap: 10px; margin-top: 10px; }
.chart-single-bar { margin-top: 10px; }
.bar-track {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2e8f0;
}
.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #0f172a;
}
.bar-fill-light { background: #94a3b8; }

.empty-state {
  padding: 24px 18px;
  text-align: center;
}
.empty-state-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: #f1f5f9;
  font-size: 22px;
}
.empty-state-title {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 700;
}
.empty-state-action { margin-top: 16px; }
.alert-error {
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 18px;
  padding: 12px 14px;
  font-size: 14px;
}
.loading-state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-size: 15px;
  color: #64748b;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  padding: 0 10px calc(env(safe-area-inset-bottom, 0px) + 10px);
  background: linear-gradient(to top, rgba(241,245,249,0.96), rgba(241,245,249,0));
}
.bottom-nav-grid {
  width: min(100%, 720px);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}
.nav-btn {
  border: 0;
  background: transparent;
  border-radius: 18px;
  padding: 10px 6px;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.nav-btn-active {
  background: #0f172a;
  color: #ffffff;
}
.nav-emoji { font-size: 18px; }
.nav-label { font-size: 11px; font-weight: 700; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(2, 6, 23, 0.45);
  backdrop-filter: blur(6px);
  padding: 16px;
  overflow-y: auto;
}
.modal-window {
  width: min(100%, 760px);
  margin: 32px auto;
}
.modal-card {
  overflow: hidden;
}
.modal-head {
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.modal-body {
  padding: 18px 20px 20px;
  display: grid;
  gap: 12px;
}
.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 6px;
}
.linked-item {
  border-radius: 16px;
  background: #ffffff;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
}
.linked-item-empty { color: #64748b; font-size: 14px; }

.pill-scroll {
  margin: 0 -4px;
  overflow-x: auto;
  padding: 0 4px;
}
.pill-row {
  display: flex;
  gap: 8px;
  width: max-content;
}
.pill {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #e2e8f0;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.pill-active {
  background: #0f172a;
  color: #ffffff;
}

@media (max-width: 640px) {
  .stats-grid,
  .quick-grid,
  .chart-grid { grid-template-columns: 1fr 1fr; }
  .mini-grid-3 { grid-template-columns: 1fr; }
  .info-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .info-row-value {
    max-width: 100%;
    text-align: left;
  }
  .summary-title,
  .login-title { font-size: 28px; }
  .page-title { font-size: 26px; }
}

@media (min-width: 768px) {
  .app-wrap,
  .login-wrap { width: min(100%, 1100px); }
  .hero-grid {
    grid-template-columns: 1.3fr 0.9fr;
    align-items: start;
  }
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
  .quick-grid { grid-template-columns: repeat(4, 1fr); }
  .chart-grid { grid-template-columns: 1fr 1fr; }
  .mini-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .mini-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .main-stack { gap: 18px; }
  .modal-window { margin: 48px auto; }
}

@media (min-width: 1200px) {
  .app-wrap { width: min(100%, 1280px); }
  .summary-title,
  .login-title { font-size: 34px; }
  .page-title { font-size: 32px; }
}
`;
