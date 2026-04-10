import { useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbznT45oMXeEA968iARFhdUWIEpit17cd2EF_I2gORicQzNt6DGKm_Wa_kJqFEbWATR1/exec";

const CURRENT_USER_LABEL = "Capo/Admin";

export default function App() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [data, setData] = useState(null);

  const [activeSiteId, setActiveSiteId] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [displayMode, setDisplayMode] = useState("full");
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const login = async () => {
    try {
      setAuthLoading(true);

      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
      const json = JSON.parse(text);

      if (!json.success) {
        alert(json.message || "Password errata");
        return;
      }

      setLogged(true);
      setData(json.data || null);

      const firstSiteId =
        json.data?.sites?.[0]?.id || json.data?.sites?.[0]?.siteId || "";
      setActiveSiteId(firstSiteId);
    } catch (err) {
      console.error(err);
      alert("Errore di collegamento con Apps Script");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setLogged(false);
    setPassword("");
    setData(null);
    setActiveSiteId("");
    setActiveTab("home");
    setDisplayMode("full");
    setSearch("");
    setSelectedJobId("");
    setSelectedDocumentId("");
  };

  const sites = data?.sites || [];
  const jobs = data?.jobs || [];
  const documents = data?.documents || [];
  const expenses = data?.expenses || [];
  const generatedAt = data?.generatedAt || "";

  const activeSite = useMemo(() => {
    if (!sites.length) return null;
    return sites.find((s) => (s.id || s.siteId) === activeSiteId) || sites[0];
  }, [sites, activeSiteId]);

  const currentSiteId = activeSite ? activeSite.id || activeSite.siteId : "";

  const siteJobs = useMemo(
    () => jobs.filter((j) => j.siteId === currentSiteId),
    [jobs, currentSiteId]
  );

  const siteDocuments = useMemo(
    () => documents.filter((d) => d.siteId === currentSiteId),
    [documents, currentSiteId]
  );

  const siteExpenses = useMemo(
    () => expenses.filter((e) => e.siteId === currentSiteId),
    [expenses, currentSiteId]
  );

  const query = search.trim().toLowerCase();

  const filteredJobs = useMemo(() => {
    if (!query) return siteJobs;
    return siteJobs.filter((job) =>
      [
        job.jobName,
        job.type,
        job.externalCompany,
        job.note,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [siteJobs, query]);

  const filteredDocuments = useMemo(() => {
    if (!query) return siteDocuments;
    return siteDocuments.filter((doc) =>
      [
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
        .includes(query)
    );
  }, [siteDocuments, query]);

  const filteredExpenses = useMemo(() => {
    if (!query) return siteExpenses;
    return siteExpenses.filter((exp) =>
      [
        exp.description,
        exp.supplier,
        exp.documentType,
        exp.documentNumber,
        exp.paymentMethod,
        exp.note,
        exp.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [siteExpenses, query]);

  const jobMap = useMemo(() => {
    const map = new Map();
    siteJobs.forEach((job) => map.set(job.jobId, job));
    return map;
  }, [siteJobs]);

  const totals = useMemo(() => {
    const total = siteExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const imponibile = siteExpenses.reduce(
      (sum, item) => sum + toNumber(item.imponibile),
      0
    );
    const iva = siteExpenses.reduce((sum, item) => sum + toNumber(item.vat), 0);

    return {
      total,
      imponibile,
      iva,
      docs: siteDocuments.length,
      jobs: siteJobs.length,
      avg: siteExpenses.length ? total / siteExpenses.length : 0,
    };
  }, [siteExpenses, siteDocuments.length, siteJobs.length]);

  const enrichedJobs = useMemo(() => {
    return filteredJobs.map((job) => {
      const jobExpenses = siteExpenses.filter((exp) => exp.jobId === job.jobId);
      const jobDocuments = siteDocuments.filter((doc) => doc.jobId === job.jobId);

      return {
        ...job,
        total: jobExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0),
        imponibile: jobExpenses.reduce(
          (sum, item) => sum + toNumber(item.imponibile),
          0
        ),
        iva: jobExpenses.reduce((sum, item) => sum + toNumber(item.vat), 0),
        expenseCount: jobExpenses.length,
        documentCount: jobDocuments.length,
      };
    });
  }, [filteredJobs, siteExpenses, siteDocuments]);

  const selectedJob =
    siteJobs.find((job) => job.jobId === selectedJobId) || null;

  const selectedDocument =
    siteDocuments.find((doc) => doc.documentId === selectedDocumentId) || null;

  const documentsForSelectedJob = selectedJob
    ? siteDocuments.filter((doc) => doc.jobId === selectedJob.jobId)
    : [];

  const expensesForSelectedJob = selectedJob
    ? siteExpenses.filter((exp) => exp.jobId === selectedJob.jobId)
    : [];

  const linkedExpensesForDocument = selectedDocument
    ? siteExpenses.filter((exp) => exp.documentId === selectedDocument.documentId)
    : [];

  const quickJobs = enrichedJobs.slice(0, 4);
  const recentDocuments = [...filteredDocuments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const changeTab = (tab) => {
    setSelectedJobId("");
    setSelectedDocumentId("");
    setActiveTab(tab);
  };

  if (!logged) {
    return (
      <>
        <style>{styles}</style>
        <div className="login-wrap">
          <div className="login-card">
            <div className="login-badge">Europa Service</div>
            <h1 className="login-title">Accesso contabilità</h1>
            <p className="login-copy">
              Versione progettata per cellulare. Il sito legge i dati dal Google Sheets
              master.
            </p>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                placeholder="Inserisci password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") login();
                }}
              />
            </div>

            <button className="primary-btn full" onClick={login} disabled={authLoading}>
              {authLoading ? "Verifica accesso..." : "Entra"}
            </button>

            {authLoading ? (
              <div className="loading-card">
                <div className="spinner" />
                <div>
                  <div className="loading-title">Caricamento in corso</div>
                  <div className="loading-copy">Sto leggendo i dati dal master.</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }

  if (!data || !activeSite) {
    return (
      <>
        <style>{styles}</style>
        <div className="center">Caricamento dati...</div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="app-shell">
        <header className="top-header">
          <div className="eyebrow">Area amministrazione</div>

          <div className="header-row">
            <div className="header-copy">
              <div className="header-title">{activeSite.name || activeSite.siteName}</div>
              <div className="header-subtitle">
                {activeSite.client || "-"} • {activeSite.city || "-"} •{" "}
                {activeSite.status || "-"}
              </div>
            </div>

            <button className="ghost-btn" onClick={logout}>
              Esci
            </button>
          </div>

          <div className="site-switch">
            <select
              className="site-select"
              value={currentSiteId}
              onChange={(e) => {
                setActiveSiteId(e.target.value);
                setSelectedJobId("");
                setSelectedDocumentId("");
                setActiveTab("home");
              }}
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
          </div>

          <div className="updated-at">
            Aggiornato: {generatedAt ? formatDateTime(generatedAt) : "-"}
          </div>
        </header>

        <section className="hero-card">
          <div className="hero-pill">
            <div className="hero-pill-label">Documenti</div>
            <div className="hero-pill-value">{totals.docs}</div>
          </div>

          <div className="hero-overline">Controllo spese del cantiere</div>
          <h1 className="hero-title">
            Una vista chiara di lavorazioni, documenti e costi del cantiere{" "}
            {activeSite.name || activeSite.siteName}.
          </h1>

          <div className="hero-total-card">
            <div>
              <div className="hero-total-label">Totale visibile</div>
              <div className="hero-total-value">{formatCurrency(totals.total)}</div>
            </div>
            <div className="hero-site-badge">{activeSite.name || activeSite.siteName}</div>
          </div>
        </section>

        <div className="mode-toggle">
          <button
            className={displayMode === "simple" ? "mode-btn active-light" : "mode-btn"}
            onClick={() => setDisplayMode("simple")}
          >
            Vista semplice
          </button>
          <button
            className={displayMode === "full" ? "mode-btn active-dark" : "mode-btn"}
            onClick={() => setDisplayMode("full")}
          >
            Vista completa
          </button>
        </div>

        <div className="search-box">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca spese, documenti, fornitori, lavorazioni..."
          />
        </div>

        <main className="page-content">
          {activeTab === "home" && (
            <div className="stack">
              <SectionHead
                eyebrow="Panoramica"
                title="Dashboard spese"
                subtitle="Navigazione più chiara e dati principali sempre visibili."
                action={
                  <button className="action-btn" onClick={() => changeTab("expenses")}>
                    Apri spese
                  </button>
                }
              />

              <div className="stats-grid">
                <StatCard label="Spese totali" value={formatCurrency(totals.total)} dark />
                <StatCard label="Documenti" value={String(totals.docs)} />
                <StatCard label="Imponibile" value={formatCurrency(totals.imponibile)} />
                <StatCard label="IVA totale" value={formatCurrency(totals.iva)} />
              </div>

              <section className="panel">
                <div className="panel-title">Lavorazioni</div>
                <div className="panel-subtitle">
                  {query ? "Risultati filtrati dalla ricerca." : "Panoramica rapida delle lavorazioni."}
                </div>

                <div className="rows">
                  {quickJobs.length ? (
                    quickJobs.map((job) => (
                      <button
                        key={job.jobId}
                        className="row-card clickable"
                        onClick={() => {
                          setSelectedJobId(job.jobId);
                          setActiveTab("site");
                        }}
                      >
                        <div className="row-main">
                          <div className="row-title">{job.jobName}</div>
                          <div className="row-subtitle">
                            {job.externalCompany || "Lavorazione interna"} •{" "}
                            {job.documentCount} documenti
                          </div>
                        </div>
                        <div className="row-amount">{formatCurrency(job.total)}</div>
                      </button>
                    ))
                  ) : (
                    <Empty text="Nessun risultato." />
                  )}
                </div>
              </section>

              <section className="panel">
                <div className="panel-title">Ultimi documenti</div>
                <div className="panel-subtitle">
                  {query ? "Risultati filtrati dalla ricerca." : "Documenti più recenti del cantiere."}
                </div>

                <div className="rows">
                  {recentDocuments.length ? (
                    recentDocuments.map((doc) => (
                      <button
                        key={doc.documentId}
                        className="row-card clickable"
                        onClick={() => {
                          setSelectedDocumentId(doc.documentId);
                          setActiveTab("documents");
                        }}
                      >
                        <div className="row-main">
                          <div className="row-title clamp-2">{doc.fileName}</div>
                          <div className="row-subtitle">
                            {doc.supplier || "-"} • {formatDate(doc.date)}
                          </div>
                        </div>
                        <div className="row-amount">{formatCurrency(doc.amount)}</div>
                      </button>
                    ))
                  ) : (
                    <Empty text="Nessun risultato." />
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="stack">
              <SectionHead
                eyebrow="Movimenti"
                title="Spese"
                subtitle={
                  query
                    ? "Risultati filtrati dalla ricerca."
                    : "Registro spese del cantiere in formato card."
                }
              />

              {filteredExpenses.length ? (
                filteredExpenses.map((item) => {
                  const relatedJob = jobMap.get(item.jobId);
                  return (
                    <ExpenseCard
                      key={item.expenseId}
                      item={item}
                      relatedJob={relatedJob}
                      displayMode={displayMode}
                    />
                  );
                })
              ) : (
                <EmptyCard text="Nessun risultato." />
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div className="stack">
              {!selectedDocument ? (
                <>
                  <SectionHead
                    eyebrow="Archivio"
                    title="Documenti"
                    subtitle={
                      query
                        ? "Risultati filtrati dalla ricerca."
                        : "Archivio digitale del cantiere."
                    }
                  />

                  {filteredDocuments.length ? (
                    filteredDocuments.map((doc) => (
                      <button
                        key={doc.documentId}
                        className="list-block clickable"
                        onClick={() => setSelectedDocumentId(doc.documentId)}
                      >
                        <div className="list-block-title clamp-2">{doc.fileName}</div>
                        <div className="list-block-subtitle">
                          {doc.supplier || "-"} • {doc.type || "-"} •{" "}
                          {doc.documentNumber || "-"}
                        </div>

                        <div className="list-block-foot">
                          <span>{formatDate(doc.date)}</span>
                          <strong>{formatCurrency(doc.amount)}</strong>
                        </div>
                      </button>
                    ))
                  ) : (
                    <EmptyCard text="Nessun risultato." />
                  )}
                </>
              ) : (
                <>
                  <button className="secondary-btn back" onClick={() => setSelectedDocumentId("")}>
                    Indietro
                  </button>

                  <section className="panel">
                    <div className="panel-title clamp-2">{selectedDocument.fileName}</div>
                    <div className="panel-subtitle">
                      Archivio digitale del documento selezionato.
                    </div>

                    <div className="preview-box">
                      <div className="preview-icon">📄</div>
                      <div className="preview-title">Anteprima documento</div>
                      <div className="preview-copy">
                        Se nel foglio Google aggiungi un fileUrl reale, qui potrai aprirlo direttamente.
                      </div>

                      {selectedDocument.fileUrl ? (
                        <a
                          href={selectedDocument.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="primary-btn"
                        >
                          Apri documento
                        </a>
                      ) : (
                        <div className="preview-placeholder">{selectedDocument.fileName}</div>
                      )}
                    </div>
                  </section>

                  <section className="panel">
                    <div className="panel-title">Spese collegate</div>

                    <div className="rows">
                      {linkedExpensesForDocument.length ? (
                        linkedExpensesForDocument.map((exp) => (
                          <div key={exp.expenseId} className="row-card">
                            <div className="row-main">
                              <div className="row-title">{exp.description}</div>
                              <div className="row-subtitle">
                                {exp.supplier || "-"} • {formatDate(exp.date)}
                              </div>
                            </div>
                            <div className="row-amount">{formatCurrency(exp.amount)}</div>
                          </div>
                        ))
                      ) : (
                        <Empty text="Nessuna spesa collegata." />
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "site" && (
            <div className="stack">
              {!selectedJob ? (
                <>
                  <SectionHead
                    eyebrow="Cantiere"
                    title={activeSite.name || activeSite.siteName}
                    subtitle="Una sola schermata per capire il cantiere e navigare le lavorazioni."
                  />

                  <section className="site-card">
                    <div className="site-card-head">
                      <div>
                        <div className="site-card-title">
                          {activeSite.name || activeSite.siteName}
                        </div>
                        <div className="site-card-subtitle">
                          Cliente: {activeSite.client || "-"} • {activeSite.city || "-"}
                        </div>
                      </div>
                      <div className="site-status">{activeSite.status || "Attivo"}</div>
                    </div>
                  </section>

                  <div className="list-grid">
                    {enrichedJobs.length ? (
                      enrichedJobs.map((job) => (
                        <button
                          key={job.jobId}
                          className="list-block clickable"
                          onClick={() => setSelectedJobId(job.jobId)}
                        >
                          <div className="list-block-title">{job.jobName}</div>
                          <div className="list-block-subtitle">
                            {job.externalCompany || "Lavorazione interna"}
                          </div>

                          <div className="metric-grid">
                            <MetricBox label="Totale" value={formatCurrency(job.total)} />
                            <MetricBox label="Spese" value={String(job.expenseCount)} />
                            <MetricBox label="Documenti" value={String(job.documentCount)} />
                          </div>
                        </button>
                      ))
                    ) : (
                      <EmptyCard text="Nessun risultato." />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button className="secondary-btn back" onClick={() => setSelectedJobId("")}>
                    Indietro
                  </button>

                  <SectionHead
                    eyebrow="Lavorazione"
                    title={selectedJob.jobName}
                    subtitle={selectedJob.externalCompany || "Lavorazione interna"}
                  />

                  <section className="panel">
                    <div className="panel-title">Documenti collegati</div>

                    <div className="rows">
                      {documentsForSelectedJob.length ? (
                        documentsForSelectedJob.map((doc) => (
                          <button
                            key={doc.documentId}
                            className="row-card clickable"
                            onClick={() => {
                              setSelectedDocumentId(doc.documentId);
                              setActiveTab("documents");
                            }}
                          >
                            <div className="row-main">
                              <div className="row-title clamp-2">{doc.fileName}</div>
                              <div className="row-subtitle">
                                {doc.type || "-"} • {doc.supplier || "-"}
                              </div>
                            </div>
                            <div className="row-amount">{formatCurrency(doc.amount)}</div>
                          </button>
                        ))
                      ) : (
                        <Empty text="Nessun documento collegato." />
                      )}
                    </div>
                  </section>

                  <section className="panel">
                    <div className="panel-title">Spese collegate</div>

                    <div className="rows">
                      {expensesForSelectedJob.length ? (
                        expensesForSelectedJob.map((exp) => (
                          <div key={exp.expenseId} className="row-card">
                            <div className="row-main">
                              <div className="row-title">{exp.description}</div>
                              <div className="row-subtitle">
                                {exp.supplier || "-"} • {formatDate(exp.date)}
                              </div>
                            </div>
                            <div className="row-amount">{formatCurrency(exp.amount)}</div>
                          </div>
                        ))
                      ) : (
                        <Empty text="Nessuna spesa collegata." />
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "menu" && (
            <div className="stack">
              <SectionHead
                eyebrow="Altro"
                title="Menu rapido"
                subtitle="Informazioni utili e azioni del portale."
              />

              <section className="list-block">
                <div className="list-block-title">Cantiere attivo</div>
                <div className="list-block-subtitle">
                  {activeSite.name || activeSite.siteName}
                </div>

                <div className="metric-grid">
                  <MetricBox label="Spese" value={String(siteExpenses.length)} />
                  <MetricBox label="Documenti" value={String(siteDocuments.length)} />
                  <MetricBox label="Lavori" value={String(siteJobs.length)} />
                </div>
              </section>

              <button className="secondary-btn" onClick={logout}>
                Esci dal portale
              </button>
            </div>
          )}
        </main>

        <nav className="bottom-nav">
          <button
            className={navClass(activeTab === "home")}
            onClick={() => changeTab("home")}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </button>

          <button
            className={navClass(activeTab === "expenses")}
            onClick={() => changeTab("expenses")}
          >
            <span className="nav-icon">📄</span>
            <span>Spese</span>
          </button>

          <button
            className={navClass(activeTab === "documents")}
            onClick={() => changeTab("documents")}
          >
            <span className="nav-icon plus">＋</span>
            <span>Documenti</span>
          </button>

          <button
            className={navClass(activeTab === "site")}
            onClick={() => changeTab("site")}
          >
            <span className="nav-icon">🏗️</span>
            <span>Cantiere</span>
          </button>

          <button
            className={navClass(activeTab === "menu")}
            onClick={() => changeTab("menu")}
          >
            <span className="nav-icon">👥</span>
            <span>Altro</span>
          </button>
        </nav>
      </div>
    </>
  );
}

function SectionHead({ eyebrow, title, subtitle, action = null }) {
  return (
    <div className="section-head">
      <div>
        <div className="section-eyebrow">{eyebrow}</div>
        <div className="section-main-title">{title}</div>
        <div className="section-main-subtitle">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, dark = false }) {
  return (
    <div className={`stat-card ${dark ? "dark" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="metric-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FieldPair({ label, value }) {
  return (
    <div className="field-pair">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty-box">{text}</div>;
}

function EmptyCard({ text }) {
  return <div className="empty-card">{text}</div>;
}

function ExpenseCard({ item, relatedJob, displayMode }) {
  const compact = displayMode === "simple";

  return (
    <section className="expense-card">
      <div className="expense-header">
        <div className="expense-header-main">
          <div className="expense-title clamp-2">{item.description || "-"}</div>
          <button className="expense-category-link" type="button">
            {relatedJob?.jobName || item.category || "Da classificare"}
          </button>
        </div>

        <div className="expense-status">Pagato</div>
      </div>

      <div className="expense-amount">{formatCurrency(item.amount)}</div>

      <div className="expense-chip-row">
        <div className="chip-soft">{formatDate(item.date)}</div>
        <div className="chip-soft">{item.paymentMethod || "-"}</div>
      </div>

      {!compact ? (
        <div className="expense-metrics">
          <FieldPair label="Imponibile" value={formatCurrency(item.imponibile)} />
          <FieldPair label="IVA" value={formatCurrency(item.vat)} />
          <FieldPair label="Caricata da" value={CURRENT_USER_LABEL} />
        </div>
      ) : null}
    </section>
  );
}

function navClass(active) {
  return active ? "nav-btn active" : "nav-btn";
}

function formatCurrency(value) {
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

function toNumber(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

const styles = `
*{box-sizing:border-box}
html,body,#root{
  margin:0;
  min-height:100%;
  font-family:Inter,Arial,sans-serif;
  background:#f3f5f9;
  color:#0f172a;
}
button,input,select,a{font:inherit}
button{cursor:pointer}

/* login */
.loginWrap{
  min-height:100vh;
  display:grid;
  place-items:center;
  padding:20px;
  background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%);
}
.loginCard{
  width:min(100%,420px);
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:24px;
  padding:22px;
  box-shadow:0 18px 40px rgba(15,23,42,.08);
}
.badge{
  display:inline-block;
  background:#eef2ff;
  color:#1e293b;
  border-radius:999px;
  padding:10px 14px;
  font-size:13px;
  font-weight:700;
}
.loginTitle{
  margin:16px 0 8px;
  font-size:32px;
  line-height:1.06;
  letter-spacing:-.03em;
  font-weight:700;
}
.loginText{
  margin:0 0 18px;
  color:#475569;
  line-height:1.6;
  font-size:17px;
}
.field{display:grid;gap:8px}
.field label{
  font-size:15px;
  font-weight:700;
  color:#334155;
}
.field input{
  width:100%;
  border:1px solid #cbd5e1;
  background:#f8fafc;
  border-radius:14px;
  padding:16px 18px;
  outline:none;
  font-size:17px;
}
.primaryBtn,.secondaryBtn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  border-radius:16px;
  padding:14px 16px;
  font-weight:700;
  font-size:16px;
  text-decoration:none;
}
.primaryBtn{
  background:#0f172a;
  color:#fff;
  border:0;
}
.secondaryBtn{
  background:#fff;
  color:#0f172a;
  border:1px solid #cbd5e1;
}
.full{width:100%}
.loadingCard{
  margin-top:14px;
  display:flex;
  align-items:center;
  gap:12px;
  background:#f8fafc;
  border:1px solid #e2e8f0;
  padding:14px 16px;
  border-radius:16px;
}
.spinner{
  width:24px;
  height:24px;
  border:3px solid #cbd5e1;
  border-top-color:#0f172a;
  border-radius:999px;
  animation:spin .8s linear infinite;
}
.loadingTitle{
  font-size:16px;
  font-weight:700;
  color:#0f172a;
}
.loadingText{
  font-size:14px;
  color:#64748b;
  line-height:1.45;
  margin-top:2px;
}
@keyframes spin{to{transform:rotate(360deg)}}
.center{
  min-height:100vh;
  display:grid;
  place-items:center;
  font-size:18px;
}

/* app */
.app{
  min-height:100vh;
  display:flex;
  flex-direction:column;
}
.header{
  position:sticky;
  top:0;
  z-index:20;
  background:rgba(255,255,255,.96);
  backdrop-filter:blur(10px);
  border-bottom:1px solid #e2e8f0;
  padding:14px;
}
.headerTop{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
}
.eyebrow{
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.18em;
  color:#64748b;
  font-weight:700;
}
.siteTitle{
  margin-top:5px;
  font-size:24px;
  font-weight:700;
  letter-spacing:-.03em;
  line-height:1.04;
}
.siteMeta{
  margin-top:6px;
  font-size:15px;
  color:#475569;
  line-height:1.45;
}
.headerBottom{
  margin-top:12px;
  display:grid;
  gap:8px;
}
.siteSelect{
  width:100%;
  border:1px solid #cbd5e1;
  background:#fff;
  border-radius:16px;
  padding:14px 15px;
  outline:none;
  font-size:16px;
}
.updatedAt{
  font-size:13px;
  color:#64748b;
  line-height:1.4;
}
.ghostBtn{
  border:1px solid #cbd5e1;
  background:#fff;
  border-radius:14px;
  padding:12px 14px;
  color:#0f172a;
  font-weight:700;
  font-size:15px;
}

.searchWrap{
  padding:10px 12px 0;
}
.searchWrap input{
  width:100%;
  border:1px solid #cbd5e1;
  background:#fff;
  border-radius:16px;
  padding:15px 16px;
  outline:none;
  box-shadow:0 2px 8px rgba(15,23,42,.03);
  font-size:16px;
}

.page{
  padding:12px 12px 92px;
}
.stack{
  display:grid;
  gap:16px;
}

/* hero */
.heroCard{
  background:linear-gradient(135deg,#0f172a 0%,#172554 100%);
  color:#fff;
  border-radius:22px;
  padding:20px;
  box-shadow:0 8px 24px rgba(15,23,42,.08);
}
.heroLabel{
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.18em;
  color:#cbd5e1;
  font-weight:700;
}
.heroName{
  margin-top:10px;
  font-size:30px;
  line-height:1.04;
  font-weight:700;
  letter-spacing:-.04em;
}
.heroSub{
  margin-top:10px;
  color:#dbeafe;
  font-size:16px;
  line-height:1.5;
}

/* stats */
.stats{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
}
.infoCard{
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:18px;
  padding:16px;
}
.infoCardDark{
  background:#0f172a;
  border-color:#0f172a;
  color:#fff;
}
.infoLabel{
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.14em;
  color:#64748b;
  font-weight:700;
}
.infoCardDark .infoLabel{
  color:#94a3b8;
}
.infoValue{
  margin-top:10px;
  font-size:24px;
  font-weight:700;
  line-height:1.05;
  letter-spacing:-.02em;
}

/* sections */
.sectionCard,.listCard,.expenseCard{
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:20px;
  padding:16px;
  box-shadow:0 6px 18px rgba(15,23,42,.04);
}
.sectionHead{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
}
.sectionTitle,.infoBlockTitle{
  font-size:22px;
  font-weight:700;
  line-height:1.12;
  letter-spacing:-.02em;
}
.sectionSub,.infoBlockSub{
  margin-top:6px;
  font-size:15px;
  color:#64748b;
  line-height:1.5;
}
.linkBtn{
  border:0;
  background:transparent;
  color:#2563eb;
  font-weight:700;
  padding:0;
  font-size:15px;
}

.list{
  display:grid;
  gap:12px;
  margin-top:16px;
}
.rowButton,.rowStatic{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
  background:#f8fafc;
  border-radius:18px;
  padding:14px 15px;
}
.rowButton{
  border:0;
  width:100%;
  text-align:left;
}
.rowMain{
  min-width:0;
  flex:1;
}
.rowTitle{
  font-size:17px;
  font-weight:700;
  line-height:1.32;
}
.rowSub{
  margin-top:5px;
  font-size:15px;
  color:#64748b;
  line-height:1.4;
}
.rowValue{
  white-space:nowrap;
  font-size:16px;
  font-weight:700;
  color:#2563eb;
}
.clamp2{
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.pageHead h2{
  margin:0;
  font-size:28px;
  line-height:1.06;
  letter-spacing:-.03em;
}
.pageHead p{
  margin:8px 0 0;
  font-size:16px;
  color:#64748b;
  line-height:1.5;
}

.cardList{
  display:grid;
  gap:14px;
}
.infoBlockButton{
  border:0;
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:20px;
  padding:16px;
  text-align:left;
  box-shadow:0 6px 18px rgba(15,23,42,.04);
}
.chipGrid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
  margin-top:14px;
}
.miniStat{
  background:#f8fafc;
  border-radius:16px;
  padding:12px;
}
.miniStat span{
  display:block;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.12em;
  color:#64748b;
  font-weight:700;
}
.miniStat strong{
  display:block;
  margin-top:8px;
  font-size:16px;
  font-weight:700;
}
.docFoot{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  margin-top:14px;
  font-size:14px;
  color:#64748b;
}
.docFoot strong{
  color:#0f172a;
  font-size:16px;
}

.previewBox{
  margin-top:14px;
  border:1px dashed #cbd5e1;
  background:#f8fafc;
  border-radius:20px;
  padding:24px 16px;
  text-align:center;
}
.previewIcon{font-size:44px}
.previewTitle{
  margin-top:12px;
  font-size:20px;
  font-weight:700;
}
.previewText{
  margin:8px auto 0;
  max-width:420px;
  font-size:15px;
  line-height:1.55;
  color:#64748b;
}
.previewPlaceholder{
  margin-top:16px;
  display:inline-flex;
  padding:12px 16px;
  background:#fff;
  border-radius:16px;
  border:1px solid #e2e8f0;
  font-size:15px;
  font-weight:700;
  word-break:break-word;
}

/* expenses */
.expenseList{
  display:grid;
  gap:14px;
}
.expenseTop{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
}
.expenseTotal{
  white-space:nowrap;
  font-size:18px;
  font-weight:700;
  color:#0f172a;
}
.expenseGrid{
  margin-top:14px;
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
}
.fieldPair{
  background:#f8fafc;
  border-radius:16px;
  padding:12px;
}
.fieldPair span{
  display:block;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:.08em;
  color:#64748b;
  font-weight:700;
}
.fieldPair strong{
  display:block;
  margin-top:6px;
  font-size:15px;
  line-height:1.4;
  font-weight:700;
  color:#0f172a;
}

.emptyBox,.emptyCard{
  border:1px dashed #cbd5e1;
  border-radius:18px;
  padding:16px;
  background:#fff;
  color:#64748b;
  font-size:15px;
}
.backBtn{
  width:fit-content;
}

/* mobile nav */
.mobileNav{
  position:sticky;
  bottom:0;
  z-index:30;
  background:rgba(255,255,255,.98);
  backdrop-filter:blur(8px);
  border-top:1px solid #e2e8f0;
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:8px;
  padding:10px 10px env(safe-area-inset-bottom,10px);
}
.mobileNavBtn{
  border:0;
  background:transparent;
  border-radius:16px;
  padding:10px 8px;
  color:#64748b;
  font-size:12px;
  font-weight:700;
}
.mobileNavBtnActive{
  background:#0f172a;
  color:#fff;
}

@media (max-width:420px){
  .stats{grid-template-columns:1fr}
  .chipGrid{grid-template-columns:1fr}
  .expenseGrid{grid-template-columns:1fr}
  .siteTitle{font-size:21px}
  .heroName{font-size:28px}
  .infoValue{font-size:22px}
  .sectionTitle,.infoBlockTitle{font-size:20px}
  .rowTitle{font-size:16px}
  .rowSub{font-size:14px}
}
`;
