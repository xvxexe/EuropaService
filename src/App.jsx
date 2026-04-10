
import { useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbznT45oMXeEA968iARFhdUWIEpit17cd2EF_I2gORicQzNt6DGKm_Wa_kJqFEbWATR1/exec";

const CURRENT_USER_LABEL = "Capo/Admin";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "expenses", label: "Spese", icon: "€" },
  { id: "documents", label: "Documenti", icon: "□" },
  { id: "site", label: "Cantiere", icon: "▦" },
  { id: "menu", label: "Altro", icon: "≡" },
];

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

  const changeTab = (tab) => {
    setSelectedJobId("");
    setSelectedDocumentId("");
    setActiveTab(tab);
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
      [job.jobName, job.type, job.externalCompany, job.note]
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
      expenses: siteExpenses.length,
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

  const selectedJob = siteJobs.find((job) => job.jobId === selectedJobId) || null;
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
    .slice(0, 4);

  if (!logged) {
    return (
      <>
        <style>{styles}</style>

        <div className="login-screen">
          <div className="bg-orb orb-one" />
          <div className="bg-orb orb-two" />

          <div className="login-card">
            <div className="brand-pill">Europa Service</div>
            <h1 className="login-title">Portale contabilità</h1>
            <p className="login-copy">
              Interfaccia ripensata per mobile, con lettura dati diretta dal Google
              Sheets master e un layout pulito anche su desktop.
            </p>

            <div className="field-block">
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

            <button className="primary-button full-width" onClick={login} disabled={authLoading}>
              {authLoading ? "Verifica accesso..." : "Entra nel portale"}
            </button>

            {authLoading ? (
              <div className="loading-panel">
                <div className="loader" />
                <div>
                  <div className="loading-title">Caricamento in corso</div>
                  <div className="loading-copy">Sto recuperando i dati dal master.</div>
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
        <div className="state-screen">Caricamento dati...</div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="app-shell">
        <div className="bg-orb orb-one" />
        <div className="bg-orb orb-two" />

        <div className="app-frame">
          <aside className="sidebar-card">
            <div className="sidebar-top">
              <div className="brand-pill subtle">Europa Service</div>
              <div className="sidebar-title">Area amministrazione</div>
              <div className="sidebar-copy">
                Backend invariato, interfaccia ottimizzata per telefono e gradevole
                anche da desktop.
              </div>
            </div>

            <div className="sidebar-select-wrap">
              <label className="input-label">Cantiere</label>
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

            <div className="sidebar-nav">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={item.id === activeTab ? "sidebar-nav-item active" : "sidebar-nav-item"}
                  onClick={() => changeTab(item.id)}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="sidebar-stats">
              <MiniMetric label="Spese" value={String(totals.expenses)} />
              <MiniMetric label="Documenti" value={String(totals.docs)} />
              <MiniMetric label="Lavori" value={String(totals.jobs)} />
            </div>

            <div className="sidebar-footer">
              <div className="sidebar-updated">
                Aggiornato: {generatedAt ? formatDateTime(generatedAt) : "-"}
              </div>

              <button className="secondary-button full-width" onClick={logout}>
                Esci dal portale
              </button>
            </div>
          </aside>

          <div className="content-shell">
            <header className="topbar-card">
              <div className="topbar-main">
                <div>
                  <div className="eyebrow">Cantiere attivo</div>
                  <div className="topbar-title">{activeSite.name || activeSite.siteName}</div>
                  <div className="topbar-meta">
                    {activeSite.client || "-"} • {activeSite.city || "-"} •{" "}
                    {activeSite.status || "-"}
                  </div>
                </div>

                <button className="ghost-button desktop-hide" onClick={logout}>
                  Esci
                </button>
              </div>

              <div className="controls-grid">
                <div className="control-block desktop-hidden-select">
                  <label className="input-label">Cantiere</label>
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

                <div className="control-block control-search">
                  <label className="input-label">Ricerca</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca spese, fornitori, documenti..."
                  />
                </div>

                <div className="control-block">
                  <label className="input-label">Vista</label>
                  <div className="segmented-control">
                    <button
                      className={displayMode === "simple" ? "segment active" : "segment"}
                      onClick={() => setDisplayMode("simple")}
                    >
                      Semplice
                    </button>
                    <button
                      className={displayMode === "full" ? "segment active" : "segment"}
                      onClick={() => setDisplayMode("full")}
                    >
                      Completa
                    </button>
                  </div>
                </div>
              </div>
            </header>

            <section className="hero-card">
              <div className="hero-text">
                <div className="hero-overline">Controllo economico del cantiere</div>
                <h1 className="hero-title">
                  Vista chiara di costi, documenti e lavorazioni di{" "}
                  {activeSite.name || activeSite.siteName}
                </h1>
                <p className="hero-copy">
                  Navigazione semplice da cellulare, card leggibili, ricerca veloce e
                  metriche principali sempre in primo piano.
                </p>
              </div>

              <div className="hero-total-panel">
                <div className="hero-total-label">Totale visibile</div>
                <div className="hero-total-value">{formatCurrency(totals.total)}</div>
                <div className="hero-total-subtitle">
                  Media spesa: {formatCurrency(totals.avg)}
                </div>
              </div>
            </section>

            <main className="main-content">
              {activeTab === "home" && (
                <div className="view-stack">
                  <SectionHead
                    eyebrow="Panoramica"
                    title="Dashboard"
                    subtitle="I numeri più importanti del cantiere attivo, con accesso rapido a spese e documenti."
                    action={
                      <button className="chip-button" onClick={() => changeTab("expenses")}>
                        Apri spese
                      </button>
                    }
                  />

                  <div className="stats-grid">
                    <StatCard label="Spese totali" value={formatCurrency(totals.total)} accent />
                    <StatCard label="Documenti" value={String(totals.docs)} />
                    <StatCard label="Imponibile" value={formatCurrency(totals.imponibile)} />
                    <StatCard label="IVA totale" value={formatCurrency(totals.iva)} />
                  </div>

                  <section className="panel-card">
                    <div className="panel-head">
                      <div>
                        <div className="panel-title">Lavorazioni</div>
                        <div className="panel-subtitle">
                          {query
                            ? "Risultati filtrati in base alla ricerca."
                            : "Accesso rapido alle principali lavorazioni del cantiere."}
                        </div>
                      </div>

                      <button className="panel-link" onClick={() => changeTab("site")}>
                        Vedi tutto
                      </button>
                    </div>

                    <div className="stack-list">
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

                            <div className="row-side">
                              <div className="row-amount">{formatCurrency(job.total)}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <EmptyCard text="Nessuna lavorazione trovata." />
                      )}
                    </div>
                  </section>

                  <section className="panel-card">
                    <div className="panel-head">
                      <div>
                        <div className="panel-title">Ultimi documenti</div>
                        <div className="panel-subtitle">
                          {query
                            ? "Documenti filtrati in base alla ricerca."
                            : "I file più recenti del cantiere attivo."}
                        </div>
                      </div>

                      <button className="panel-link" onClick={() => changeTab("documents")}>
                        Archivio
                      </button>
                    </div>

                    <div className="stack-list">
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

                            <div className="row-side">
                              <div className="row-amount">{formatCurrency(doc.amount)}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <EmptyCard text="Nessun documento trovato." />
                      )}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "expenses" && (
                <div className="view-stack">
                  <SectionHead
                    eyebrow="Movimenti"
                    title="Spese"
                    subtitle={
                      query
                        ? "Risultati filtrati in base alla ricerca."
                        : "Registro spese in formato card, ottimizzato per la lettura su smartphone."
                    }
                  />

                  {filteredExpenses.length ? (
                    <div className="expense-grid">
                      {filteredExpenses.map((item) => {
                        const relatedJob = jobMap.get(item.jobId);
                        return (
                          <ExpenseCard
                            key={item.expenseId}
                            item={item}
                            relatedJob={relatedJob}
                            displayMode={displayMode}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyCard text="Nessuna spesa trovata." />
                  )}
                </div>
              )}

              {activeTab === "documents" && (
                <div className="view-stack">
                  {!selectedDocument ? (
                    <>
                      <SectionHead
                        eyebrow="Archivio"
                        title="Documenti"
                        subtitle={
                          query
                            ? "Risultati filtrati in base alla ricerca."
                            : "Archivio digitale del cantiere, comodo da sfogliare anche da telefono."
                        }
                      />

                      <div className="document-grid">
                        {filteredDocuments.length ? (
                          filteredDocuments.map((doc) => (
                            <button
                              key={doc.documentId}
                              className="list-card clickable"
                              onClick={() => setSelectedDocumentId(doc.documentId)}
                            >
                              <div className="list-title clamp-2">{doc.fileName}</div>
                              <div className="list-subtitle">
                                {doc.supplier || "-"} • {doc.type || "-"} •{" "}
                                {doc.documentNumber || "-"}
                              </div>

                              <div className="list-footer">
                                <span>{formatDate(doc.date)}</span>
                                <strong>{formatCurrency(doc.amount)}</strong>
                              </div>
                            </button>
                          ))
                        ) : (
                          <EmptyCard text="Nessun documento trovato." />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="secondary-button inline-button" onClick={() => setSelectedDocumentId("")}>
                        Indietro
                      </button>

                      <section className="panel-card">
                        <div className="panel-title clamp-2">{selectedDocument.fileName}</div>
                        <div className="panel-subtitle">
                          Archivio digitale del documento selezionato.
                        </div>

                        <div className="preview-box">
                          <div className="preview-badge">Documento</div>
                          <div className="preview-title">Anteprima file</div>
                          <div className="preview-copy">
                            Se nel foglio Google inserisci un fileUrl reale, qui potrai
                            aprirlo direttamente.
                          </div>

                          {selectedDocument.fileUrl ? (
                            <a
                              href={selectedDocument.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="primary-button"
                            >
                              Apri documento
                            </a>
                          ) : (
                            <div className="preview-placeholder">{selectedDocument.fileName}</div>
                          )}
                        </div>
                      </section>

                      <section className="panel-card">
                        <div className="panel-title">Spese collegate</div>

                        <div className="stack-list spaced-top">
                          {linkedExpensesForDocument.length ? (
                            linkedExpensesForDocument.map((exp) => (
                              <div key={exp.expenseId} className="row-card">
                                <div className="row-main">
                                  <div className="row-title">{exp.description}</div>
                                  <div className="row-subtitle">
                                    {exp.supplier || "-"} • {formatDate(exp.date)}
                                  </div>
                                </div>

                                <div className="row-side">
                                  <div className="row-amount">{formatCurrency(exp.amount)}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyCard text="Nessuna spesa collegata." />
                          )}
                        </div>
                      </section>
                    </>
                  )}
                </div>
              )}

              {activeTab === "site" && (
                <div className="view-stack">
                  {!selectedJob ? (
                    <>
                      <SectionHead
                        eyebrow="Cantiere"
                        title={activeSite.name || activeSite.siteName}
                        subtitle="Una schermata unica per capire il cantiere e aprire le lavorazioni."
                      />

                      <section className="site-banner">
                        <div>
                          <div className="site-banner-title">
                            {activeSite.name || activeSite.siteName}
                          </div>
                          <div className="site-banner-subtitle">
                            Cliente: {activeSite.client || "-"} • {activeSite.city || "-"}
                          </div>
                        </div>

                        <div className="status-pill">{activeSite.status || "Attivo"}</div>
                      </section>

                      <div className="job-grid">
                        {enrichedJobs.length ? (
                          enrichedJobs.map((job) => (
                            <button
                              key={job.jobId}
                              className="list-card clickable"
                              onClick={() => setSelectedJobId(job.jobId)}
                            >
                              <div className="list-title">{job.jobName}</div>
                              <div className="list-subtitle">
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
                          <EmptyCard text="Nessuna lavorazione trovata." />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="secondary-button inline-button" onClick={() => setSelectedJobId("")}>
                        Indietro
                      </button>

                      <SectionHead
                        eyebrow="Lavorazione"
                        title={selectedJob.jobName}
                        subtitle={selectedJob.externalCompany || "Lavorazione interna"}
                      />

                      <section className="panel-card">
                        <div className="panel-title">Documenti collegati</div>

                        <div className="stack-list spaced-top">
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

                                <div className="row-side">
                                  <div className="row-amount">{formatCurrency(doc.amount)}</div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <EmptyCard text="Nessun documento collegato." />
                          )}
                        </div>
                      </section>

                      <section className="panel-card">
                        <div className="panel-title">Spese collegate</div>

                        <div className="stack-list spaced-top">
                          {expensesForSelectedJob.length ? (
                            expensesForSelectedJob.map((exp) => (
                              <div key={exp.expenseId} className="row-card">
                                <div className="row-main">
                                  <div className="row-title">{exp.description}</div>
                                  <div className="row-subtitle">
                                    {exp.supplier || "-"} • {formatDate(exp.date)}
                                  </div>
                                </div>

                                <div className="row-side">
                                  <div className="row-amount">{formatCurrency(exp.amount)}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <EmptyCard text="Nessuna spesa collegata." />
                          )}
                        </div>
                      </section>
                    </>
                  )}
                </div>
              )}

              {activeTab === "menu" && (
                <div className="view-stack">
                  <SectionHead
                    eyebrow="Altro"
                    title="Menu rapido"
                    subtitle="Informazioni utili, riepilogo del portale e azioni veloci."
                  />

                  <div className="menu-grid">
                    <section className="panel-card">
                      <div className="panel-title">Cantiere attivo</div>
                      <div className="panel-subtitle">{activeSite.name || activeSite.siteName}</div>

                      <div className="metric-grid spaced-top">
                        <MetricBox label="Spese" value={String(siteExpenses.length)} />
                        <MetricBox label="Documenti" value={String(siteDocuments.length)} />
                        <MetricBox label="Lavori" value={String(siteJobs.length)} />
                      </div>
                    </section>

                    <section className="panel-card">
                      <div className="panel-title">Aggiornamento</div>
                      <div className="panel-subtitle">
                        Ultima sincronizzazione dati dal master.
                      </div>
                      <div className="info-value spaced-top">
                        {generatedAt ? formatDateTime(generatedAt) : "-"}
                      </div>
                    </section>

                    <section className="panel-card">
                      <div className="panel-title">Vista attiva</div>
                      <div className="panel-subtitle">
                        Modalità attuale del registro spese.
                      </div>
                      <div className="info-value spaced-top">
                        {displayMode === "full" ? "Completa" : "Semplice"}
                      </div>
                    </section>

                    <section className="panel-card">
                      <div className="panel-title">Utente</div>
                      <div className="panel-subtitle">
                        Profilo visualizzato nell'interfaccia.
                      </div>
                      <div className="info-value spaced-top">{CURRENT_USER_LABEL}</div>
                    </section>
                  </div>

                  <button className="secondary-button" onClick={logout}>
                    Esci dal portale
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>

        <nav className="mobile-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={item.id === activeTab ? "mobile-nav-item active" : "mobile-nav-item"}
              onClick={() => changeTab(item.id)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

function SectionHead({ eyebrow, title, subtitle, action = null }) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <div className="section-title">{title}</div>
        <div className="section-subtitle">{subtitle}</div>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, accent = false }) {
  return (
    <div className={accent ? "stat-card accent" : "stat-card"}>
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

function MiniMetric({ label, value }) {
  return (
    <div className="mini-metric">
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
          <div className="expense-category">
            {relatedJob?.jobName || item.category || "Da classificare"}
          </div>
        </div>

        <div className="status-pill soft">Pagato</div>
      </div>

      <div className="expense-total">{formatCurrency(item.amount)}</div>

      <div className="expense-chip-row">
        <div className="soft-chip">{formatDate(item.date)}</div>
        <div className="soft-chip">{item.paymentMethod || "-"}</div>
      </div>

      {!compact ? (
        <div className="expense-meta-grid">
          <FieldPair label="Imponibile" value={formatCurrency(item.imponibile)} />
          <FieldPair label="IVA" value={formatCurrency(item.vat)} />
          <FieldPair label="Caricata da" value={CURRENT_USER_LABEL} />
          <FieldPair
            label="Documento"
            value={item.documentNumber || item.documentType || "-"}
          />
        </div>
      ) : null}
    </section>
  );
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
* {
  box-sizing: border-box;
}

:root {
  color-scheme: light;
  --bg: #eef2ff;
  --panel: rgba(255, 255, 255, 0.82);
  --panel-strong: rgba(255, 255, 255, 0.94);
  --line: rgba(148, 163, 184, 0.26);
  --line-strong: rgba(148, 163, 184, 0.4);
  --text: #0f172a;
  --muted: #64748b;
  --muted-strong: #475569;
  --brand: #1d4ed8;
  --brand-dark: #0f172a;
  --hero-start: #0f172a;
  --hero-end: #1e3a8a;
  --shadow: 0 18px 44px rgba(15, 23, 42, 0.12);
  --shadow-soft: 0 10px 24px rgba(15, 23, 42, 0.08);
  --radius-xl: 30px;
  --radius-lg: 24px;
  --radius-md: 18px;
  --radius-sm: 14px;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 34%),
    radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.14), transparent 28%),
    linear-gradient(180deg, #f8fbff 0%, #eef3f9 100%);
  color: var(--text);
}

body {
  min-height: 100vh;
}

button,
input,
select,
a {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

input,
select {
  width: 100%;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.9);
  color: var(--text);
  border-radius: 16px;
  outline: none;
  padding: 14px 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

input:focus,
select:focus {
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.app-shell,
.login-screen {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.bg-orb {
  position: fixed;
  border-radius: 999px;
  filter: blur(12px);
  opacity: 0.6;
  pointer-events: none;
  z-index: 0;
}

.orb-one {
  width: 280px;
  height: 280px;
  top: -70px;
  left: -100px;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.35), transparent 70%);
}

.orb-two {
  width: 320px;
  height: 320px;
  right: -120px;
  bottom: 60px;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.28), transparent 70%);
}

.login-screen {
  display: grid;
  place-items: center;
  padding: 24px 16px;
}

.login-card,
.sidebar-card,
.topbar-card,
.hero-card,
.panel-card,
.list-card,
.expense-card,
.site-banner,
.row-card,
.stat-card,
.empty-card {
  position: relative;
  z-index: 1;
}

.login-card {
  width: min(100%, 440px);
  background: var(--panel-strong);
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow: var(--shadow);
  border-radius: 30px;
  padding: 24px;
  backdrop-filter: blur(18px);
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(15, 23, 42, 0.08);
  color: var(--brand-dark);
}

.brand-pill.subtle {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.login-title {
  margin: 18px 0 10px;
  font-size: clamp(32px, 8vw, 44px);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.login-copy {
  margin: 0 0 20px;
  color: var(--muted-strong);
  line-height: 1.58;
  font-size: 15px;
}

.field-block {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.field-block label,
.input-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.primary-button,
.secondary-button,
.ghost-button,
.chip-button,
.panel-link,
.segment,
.sidebar-nav-item,
.mobile-nav-item {
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.primary-button:hover,
.secondary-button:hover,
.ghost-button:hover,
.chip-button:hover,
.panel-link:hover,
.sidebar-nav-item:hover,
.mobile-nav-item:hover {
  transform: translateY(-1px);
}

.primary-button,
.secondary-button,
.ghost-button,
.chip-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  border-radius: 16px;
  padding: 0 16px;
  border: 0;
  font-weight: 700;
}

.primary-button {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text);
  border: 1px solid var(--line);
}

.ghost-button {
  background: rgba(255, 255, 255, 0.7);
  color: var(--text);
  border: 1px solid var(--line);
  min-width: 74px;
}

.chip-button {
  min-height: 40px;
  padding: 0 14px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--text);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.panel-link {
  border: 0;
  background: transparent;
  color: var(--brand);
  font-weight: 700;
  padding: 0;
}

.full-width {
  width: 100%;
}

.inline-button {
  width: fit-content;
}

.loading-panel {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.88);
  border: 1px solid var(--line);
}

.loader {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 3px solid rgba(148, 163, 184, 0.4);
  border-top-color: var(--brand-dark);
  animation: spin 0.8s linear infinite;
}

.loading-title {
  font-weight: 700;
}

.loading-copy {
  margin-top: 2px;
  font-size: 14px;
  color: var(--muted);
}

.state-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-size: 18px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.app-frame {
  position: relative;
  z-index: 1;
  display: block;
  padding: 14px 14px 90px;
}

.sidebar-card {
  display: none;
}

.content-shell {
  display: grid;
  gap: 14px;
}

.topbar-card,
.hero-card,
.panel-card,
.list-card,
.expense-card,
.site-banner,
.row-card,
.stat-card,
.empty-card {
  background: var(--panel);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(14px);
}

.topbar-card,
.hero-card,
.panel-card,
.list-card,
.expense-card,
.site-banner,
.stat-card,
.empty-card {
  border-radius: 24px;
}

.row-card {
  border-radius: 20px;
}

.topbar-card {
  padding: 18px;
  position: sticky;
  top: 10px;
  z-index: 10;
}

.topbar-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--muted);
}

.topbar-title,
.section-title,
.sidebar-title,
.panel-title,
.list-title,
.site-banner-title {
  font-weight: 800;
  letter-spacing: -0.03em;
}

.topbar-title {
  margin-top: 6px;
  font-size: clamp(26px, 6vw, 36px);
  line-height: 0.98;
}

.topbar-meta,
.section-subtitle,
.panel-subtitle,
.list-subtitle,
.site-banner-subtitle,
.sidebar-copy {
  color: var(--muted);
  line-height: 1.55;
}

.topbar-meta {
  margin-top: 8px;
  font-size: 14px;
}

.controls-grid {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.control-block {
  display: grid;
  gap: 8px;
}

.segmented-control {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 6px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.segment {
  min-height: 42px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
}

.segment.active {
  background: white;
  color: var(--text);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.desktop-hide {
  display: inline-flex;
}

.hero-card {
  display: grid;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, var(--hero-start) 0%, var(--hero-end) 100%);
  color: white;
  overflow: hidden;
}

.hero-overline {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.9);
}

.hero-title {
  margin: 10px 0 0;
  font-size: clamp(30px, 8vw, 48px);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.hero-copy {
  margin: 10px 0 0;
  color: rgba(226, 232, 240, 0.92);
  line-height: 1.58;
  font-size: 15px;
  max-width: 62ch;
}

.hero-total-panel {
  border-radius: 22px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
}

.hero-total-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 800;
  color: rgba(226, 232, 240, 0.86);
}

.hero-total-value {
  margin-top: 8px;
  font-size: clamp(28px, 7vw, 42px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-total-subtitle {
  margin-top: 8px;
  color: rgba(226, 232, 240, 0.86);
  font-size: 14px;
}

.main-content,
.view-stack {
  display: grid;
  gap: 14px;
}

.section-head,
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  margin-top: 4px;
  font-size: clamp(24px, 5vw, 34px);
  line-height: 1.04;
}

.section-subtitle {
  margin-top: 8px;
  font-size: 15px;
  max-width: 60ch;
}

.stats-grid,
.menu-grid,
.job-grid,
.document-grid,
.expense-grid {
  display: grid;
  gap: 12px;
}

.stat-card {
  padding: 16px;
}

.stat-card.accent {
  background: linear-gradient(145deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
}

.stat-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.stat-card.accent .stat-label {
  color: rgba(226, 232, 240, 0.85);
}

.stat-value,
.info-value {
  margin-top: 10px;
  font-size: clamp(24px, 6vw, 34px);
  line-height: 1.02;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.panel-card,
.list-card,
.expense-card,
.site-banner {
  padding: 18px;
}

.panel-title,
.list-title,
.site-banner-title {
  font-size: 20px;
  line-height: 1.08;
}

.panel-subtitle,
.list-subtitle,
.site-banner-subtitle {
  margin-top: 7px;
  font-size: 14px;
}

.stack-list {
  display: grid;
  gap: 10px;
}

.spaced-top {
  margin-top: 14px;
}

.row-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.row-card.clickable,
.list-card.clickable {
  cursor: pointer;
}

.row-main {
  min-width: 0;
  flex: 1;
}

.row-side {
  display: grid;
  justify-items: end;
  gap: 6px;
}

.row-title {
  font-size: 16px;
  line-height: 1.32;
  font-weight: 700;
}

.row-subtitle {
  margin-top: 6px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.42;
}

.row-amount {
  white-space: nowrap;
  font-weight: 800;
  color: var(--brand);
  font-size: 15px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.metric-box,
.mini-metric,
.field-pair {
  border-radius: 18px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.metric-box span,
.mini-metric span,
.field-pair span {
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.metric-box strong,
.mini-metric strong,
.field-pair strong {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 800;
}

.list-footer {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  color: var(--muted);
  font-size: 14px;
}

.list-footer strong {
  color: var(--text);
  font-size: 15px;
}

.preview-box {
  margin-top: 16px;
  border-radius: 24px;
  padding: 22px;
  border: 1px dashed rgba(148, 163, 184, 0.38);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.94) 0%, rgba(255, 255, 255, 0.8) 100%);
  text-align: center;
}

.preview-badge {
  display: inline-flex;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.08);
  color: var(--brand-dark);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.preview-title {
  margin-top: 14px;
  font-size: 24px;
  line-height: 1.06;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.preview-copy {
  margin: 10px auto 0;
  max-width: 44ch;
  color: var(--muted);
  line-height: 1.58;
  font-size: 15px;
}

.preview-placeholder {
  margin-top: 16px;
  display: inline-flex;
  max-width: 100%;
  padding: 12px 14px;
  border-radius: 16px;
  background: white;
  border: 1px solid var(--line);
  word-break: break-word;
  font-weight: 700;
}

.site-banner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.status-pill,
.soft-chip,
.expense-category {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}

.status-pill {
  min-height: 34px;
  padding: 0 12px;
  background: rgba(15, 23, 42, 0.08);
  color: var(--text);
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.status-pill.soft {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}

.expense-card {
  display: grid;
  gap: 14px;
}

.expense-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.expense-header-main {
  min-width: 0;
  flex: 1;
}

.expense-title {
  font-size: 18px;
  line-height: 1.28;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.expense-category {
  margin-top: 10px;
  width: fit-content;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
}

.expense-total {
  font-size: clamp(28px, 7vw, 36px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.expense-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.soft-chip {
  min-height: 34px;
  padding: 0 12px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: var(--muted-strong);
  font-size: 13px;
  font-weight: 700;
}

.expense-meta-grid {
  display: grid;
  gap: 10px;
}

.empty-card {
  padding: 18px;
  color: var(--muted);
  border-style: dashed;
}

.sidebar-stats {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.sidebar-updated {
  color: rgba(226, 232, 240, 0.78);
  line-height: 1.5;
  font-size: 13px;
}

.sidebar-footer {
  margin-top: auto;
  display: grid;
  gap: 12px;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mobile-nav {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(10px + env(safe-area-inset-bottom, 0px));
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding: 8px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.76);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
}

.mobile-nav-item {
  min-height: 58px;
  border-radius: 18px;
  border: 0;
  background: transparent;
  color: var(--muted);
  display: grid;
  place-items: center;
  gap: 4px;
  padding: 8px 4px;
  font-size: 11px;
  font-weight: 800;
}

.mobile-nav-item.active {
  background: linear-gradient(145deg, #0f172a 0%, #1e3a8a 100%);
  color: white;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
}

.mobile-nav-icon,
.sidebar-nav-icon {
  font-size: 16px;
  line-height: 1;
}

.desktop-hidden-select {
  display: grid;
}

@media (min-width: 700px) {
  .controls-grid {
    grid-template-columns: 1.2fr 1fr;
  }

  .stats-grid,
  .menu-grid,
  .document-grid,
  .job-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .expense-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-card {
    grid-template-columns: 1.5fr 0.9fr;
    align-items: end;
  }

  .expense-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 980px) {
  .app-frame {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 18px;
    padding: 18px 18px 24px;
    max-width: 1500px;
    margin: 0 auto;
  }

  .sidebar-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    position: sticky;
    top: 18px;
    height: calc(100vh - 36px);
    padding: 22px;
    border-radius: 30px;
    background: linear-gradient(180deg, #0f172a 0%, #172554 100%);
    color: white;
    box-shadow: 0 20px 48px rgba(15, 23, 42, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px);
  }

  .sidebar-title {
    margin-top: 12px;
    font-size: 30px;
    line-height: 0.98;
  }

  .sidebar-copy {
    margin-top: 10px;
    font-size: 14px;
    color: rgba(226, 232, 240, 0.8);
  }

  .sidebar-select-wrap {
    display: grid;
    gap: 8px;
  }

  .sidebar-select-wrap .site-select {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.14);
  }

  .sidebar-select-wrap .site-select option {
    color: #0f172a;
  }

  .sidebar-nav {
    display: grid;
    gap: 8px;
  }

  .sidebar-nav-item {
    justify-content: flex-start;
    min-height: 50px;
    padding: 0 14px;
    border-radius: 16px;
    border: 1px solid transparent;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(226, 232, 240, 0.85);
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
  }

  .sidebar-nav-item.active {
    background: rgba(255, 255, 255, 0.14);
    color: white;
    border-color: rgba(255, 255, 255, 0.12);
  }

  .mini-metric {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.08);
  }

  .mini-metric span {
    color: rgba(226, 232, 240, 0.72);
  }

  .mini-metric strong {
    color: white;
  }

  .desktop-hidden-select {
    display: none;
  }

  .desktop-hide {
    display: none;
  }

  .mobile-nav {
    display: none;
  }

  .content-shell {
    gap: 18px;
  }

  .topbar-card {
    top: 18px;
    padding: 20px;
  }

  .controls-grid {
    grid-template-columns: minmax(300px, 1fr) minmax(320px, 1.2fr) 260px;
    align-items: end;
  }

  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .menu-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .document-grid,
  .job-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .expense-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .expense-meta-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .expense-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 430px) {
  .app-frame {
    padding-left: 12px;
    padding-right: 12px;
  }

  .topbar-card,
  .hero-card,
  .panel-card,
  .list-card,
  .expense-card,
  .site-banner,
  .stat-card,
  .empty-card {
    border-radius: 22px;
  }

  .login-card {
    padding: 22px 18px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .mobile-nav {
    left: 8px;
    right: 8px;
    gap: 6px;
    padding: 7px;
  }

  .mobile-nav-item {
    min-height: 54px;
    font-size: 10px;
  }
}
`;
