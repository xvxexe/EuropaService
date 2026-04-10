import { useMemo, useState } from "react";

export default function App() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [data, setData] = useState(null);

  const [activeView, setActiveView] = useState("dashboard");
  const [activeSiteId, setActiveSiteId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const API_URL =
    "https://script.google.com/macros/s/AKfycbznT45oMXeEA968iARFhdUWIEpit17cd2EF_I2gORicQzNt6DGKm_Wa_kJqFEbWATR1/exec";

  const login = async () => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
      console.log("RAW RESPONSE:", text);
      const json = JSON.parse(text);

      if (json.success) {
        setLogged(true);
        setData(json.data);
        if (json.data?.sites?.length) {
          setActiveSiteId(json.data.sites[0].id || json.data.sites[0].siteId || "");
        }
      } else {
        alert(json.message || "Password errata");
      }
    } catch (err) {
      console.error(err);
      alert("Errore di collegamento con Apps Script");
    }
  };

  const logout = () => {
    setLogged(false);
    setData(null);
    setPassword("");
    setActiveView("dashboard");
    setActiveSiteId("");
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
    return sites.find((site) => (site.id || site.siteId) === activeSiteId) || sites[0];
  }, [sites, activeSiteId]);

  const currentSiteId = activeSite ? activeSite.id || activeSite.siteId : "";

  const siteJobs = useMemo(() => jobs.filter((job) => job.siteId === currentSiteId), [jobs, currentSiteId]);
  const siteDocuments = useMemo(() => documents.filter((doc) => doc.siteId === currentSiteId), [documents, currentSiteId]);
  const siteExpenses = useMemo(() => expenses.filter((exp) => exp.siteId === currentSiteId), [expenses, currentSiteId]);

  const totals = useMemo(() => {
    return {
      total: siteExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0),
      imponibile: siteExpenses.reduce((sum, item) => sum + toNumber(item.imponibile), 0),
      iva: siteExpenses.reduce((sum, item) => sum + toNumber(item.vat), 0),
      docs: siteDocuments.length,
      jobs: siteJobs.length,
      avg: siteExpenses.length ? siteExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0) / siteExpenses.length : 0,
    };
  }, [siteExpenses, siteDocuments, siteJobs]);

  const enrichedJobs = useMemo(() => {
    return siteJobs.map((job) => {
      const jobExpenses = siteExpenses.filter((exp) => exp.jobId === job.jobId);
      const jobDocuments = siteDocuments.filter((doc) => doc.jobId === job.jobId);
      return {
        ...job,
        total: jobExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0),
        imponibile: jobExpenses.reduce((sum, item) => sum + toNumber(item.imponibile), 0),
        iva: jobExpenses.reduce((sum, item) => sum + toNumber(item.vat), 0),
        expenseCount: jobExpenses.length,
        documentCount: jobDocuments.length,
      };
    });
  }, [siteJobs, siteExpenses, siteDocuments]);

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return siteExpenses;
    return siteExpenses.filter((item) => [item.description, item.supplier, item.documentType, item.documentNumber, item.paymentMethod, item.note].join(" ").toLowerCase().includes(q));
  }, [siteExpenses, search]);

  const filteredDocuments = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return siteDocuments;
    return siteDocuments.filter((item) => [item.fileName, item.supplier, item.type, item.documentNumber, item.folder, item.note].join(" ").toLowerCase().includes(q));
  }, [siteDocuments, search]);

  const selectedJob = enrichedJobs.find((job) => job.jobId === selectedJobId) || null;
  const selectedDocument = siteDocuments.find((doc) => doc.documentId === selectedDocumentId) || null;

  const documentsForSelectedJob = selectedJob ? siteDocuments.filter((doc) => doc.jobId === selectedJob.jobId) : [];
  const expensesForSelectedJob = selectedJob ? siteExpenses.filter((exp) => exp.jobId === selectedJob.jobId) : [];
  const linkedExpensesForDocument = selectedDocument ? siteExpenses.filter((exp) => exp.documentId === selectedDocument.documentId) : [];

  if (!logged) {
    return (
      <>
        <style>{styles}</style>
        <div className="login-shell">
          <div className="login-card">
            <div className="login-chip">Europa Service · Portale protetto</div>
            <h1 className="login-title">Contabilità cantieri</h1>
            <p className="login-copy">
              Il sito legge i dati dal Google Sheets master e li mostra in modo più chiaro, ordinato e professionale.
            </p>

            <div className="field-wrap">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") login();
                }}
              />
            </div>

            <button className="primary-btn login-btn" onClick={login}>
              Entra
            </button>

            <div className="login-note">
              Il sito non modifica il foglio: aggiorni il master e qui vedi tutto aggiornato.
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!data || !activeSite) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-shell">Caricamento dati...</div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <aside className="sidebar desktop-only">
          <div className="brand-card">
            <div className="brand-overline">Europa Service</div>
            <div className="brand-title">Visualizzazione contabilità</div>
            <div className="brand-copy">Portale protetto collegato al Google Sheets master.</div>
          </div>

          <div className="block">
            <div className="block-label">Cantiere attivo</div>
            <select
              className="select"
              value={currentSiteId}
              onChange={(e) => {
                setActiveSiteId(e.target.value);
                setSelectedJobId("");
                setSelectedDocumentId("");
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

          <nav className="side-nav">
            <button className={navClass(activeView === "dashboard")} onClick={() => resetViewState("dashboard", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Dashboard</button>
            <button className={navClass(activeView === "sites")} onClick={() => resetViewState("sites", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Cantieri</button>
            <button className={navClass(activeView === "jobs")} onClick={() => resetViewState("jobs", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Lavorazioni</button>
            <button className={navClass(activeView === "documents")} onClick={() => resetViewState("documents", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Documenti</button>
            <button className={navClass(activeView === "expenses")} onClick={() => resetViewState("expenses", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Spese</button>
          </nav>

          <button className="logout-btn" onClick={logout}>Esci</button>
        </aside>

        <div className="main-shell">
          <header className="topbar">
            <div>
              <div className="topbar-overline">Portale protetto</div>
              <div className="topbar-title">{activeSite.name || activeSite.siteName}</div>
            </div>

            <div className="topbar-right desktop-only">
              <div className="search-box">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca spese o documenti" />
              </div>
              <div className="updated-pill">Aggiornato: {generatedAt ? formatDateTime(generatedAt) : "-"}</div>
            </div>
          </header>

          <main className="page-wrap">
            {activeView === "dashboard" && (
              <div className="page-stack">
                <section className="hero-card">
                  <div>
                    <div className="hero-overline">Cantiere attivo</div>
                    <h1>{activeSite.name || activeSite.siteName}</h1>
                    <p>Cliente: {activeSite.client || "-"} • {activeSite.city || "-"} • Stato: {activeSite.status || "-"}</p>
                  </div>
                  <div className="hero-pill">{totals.docs} documenti</div>
                </section>

                <section className="stats-grid">
                  <StatCard label="Spese totali" value={formatCurrency(totals.total)} dark />
                  <StatCard label="Imponibile" value={formatCurrency(totals.imponibile)} />
                  <StatCard label="IVA" value={formatCurrency(totals.iva)} />
                  <StatCard label="Lavorazioni" value={String(totals.jobs)} />
                  <StatCard label="Documenti" value={String(totals.docs)} />
                  <StatCard label="Spesa media" value={formatCurrency(totals.avg)} />
                </section>

                <section className="two-col">
                  <Panel title="Lavorazioni del cantiere" subtitle="Totali, documenti e costi per ogni lavorazione.">
                    <div className="simple-list">
                      {enrichedJobs.map((job) => (
                        <button
                          key={job.jobId}
                          className="simple-list-row clickable"
                          onClick={() => {
                            setSelectedJobId(job.jobId);
                            setSelectedDocumentId("");
                            setActiveView("jobs");
                          }}
                        >
                          <div>
                            <div className="row-title">{job.jobName}</div>
                            <div className="row-subtitle">{job.externalCompany || "Lavorazione interna"} • {job.documentCount} documenti</div>
                          </div>
                          <div className="row-amount">{formatCurrency(job.total)}</div>
                        </button>
                      ))}
                    </div>
                  </Panel>

                  <Panel title="Ultimi documenti" subtitle="Documenti recenti letti dal master.">
                    <div className="simple-list">
                      {[...siteDocuments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6).map((doc) => (
                        <button
                          key={doc.documentId}
                          className="simple-list-row clickable"
                          onClick={() => {
                            setSelectedDocumentId(doc.documentId);
                            setSelectedJobId("");
                            setActiveView("documents");
                          }}
                        >
                          <div>
                            <div className="row-title">{doc.fileName}</div>
                            <div className="row-subtitle">{doc.supplier || "-"} • {formatDate(doc.date)}</div>
                          </div>
                          <div className="row-amount">{formatCurrency(doc.amount)}</div>
                        </button>
                      ))}
                    </div>
                  </Panel>
                </section>
              </div>
            )}

            {activeView === "sites" && (
              <div className="page-stack">
                <section className="page-header">
                  <h1>Cantieri</h1>
                  <p>Tutti i cantieri letti dal Google Sheets master.</p>
                </section>

                <section className="card-grid">
                  {sites.map((site) => {
                    const siteId = site.id || site.siteId;
                    const siteExpenseRows = expenses.filter((item) => item.siteId === siteId);
                    const siteDocumentRows = documents.filter((item) => item.siteId === siteId);
                    const total = siteExpenseRows.reduce((sum, item) => sum + toNumber(item.amount), 0);

                    return (
                      <div key={siteId} className="site-card">
                        <div className="site-card-head">
                          <div>
                            <div className="site-card-title">{site.name || site.siteName}</div>
                            <div className="site-card-subtitle">{site.client || "-"} • {site.city || "-"}</div>
                          </div>
                          <div className="status-pill">{site.status || "-"}</div>
                        </div>

                        <div className="site-stats">
                          <div><div className="mini-label">Spese</div><div className="mini-value">{siteExpenseRows.length}</div></div>
                          <div><div className="mini-label">Documenti</div><div className="mini-value">{siteDocumentRows.length}</div></div>
                          <div><div className="mini-label">Totale</div><div className="mini-value">{formatCurrency(total)}</div></div>
                        </div>

                        <button
                          className="secondary-btn"
                          onClick={() => {
                            setActiveSiteId(siteId);
                            setSelectedJobId("");
                            setSelectedDocumentId("");
                            setActiveView("dashboard");
                          }}
                        >
                          Apri cantiere
                        </button>
                      </div>
                    );
                  })}
                </section>
              </div>
            )}

            {activeView === "jobs" && (
              <div className="page-stack">
                {!selectedJob ? (
                  <>
                    <section className="page-header">
                      <h1>Lavorazioni</h1>
                      <p>Vista completa delle lavorazioni del cantiere attivo.</p>
                    </section>

                    <section className="card-grid">
                      {enrichedJobs.map((job) => (
                        <button key={job.jobId} className="job-card" onClick={() => setSelectedJobId(job.jobId)}>
                          <div className="job-card-title">{job.jobName}</div>
                          <div className="job-card-subtitle">{job.externalCompany || "Lavorazione interna"}</div>
                          <div className="job-metrics">
                            <div><span>Totale</span><strong>{formatCurrency(job.total)}</strong></div>
                            <div><span>Spese</span><strong>{job.expenseCount}</strong></div>
                            <div><span>Documenti</span><strong>{job.documentCount}</strong></div>
                          </div>
                        </button>
                      ))}
                    </section>
                  </>
                ) : (
                  <>
                    <button className="secondary-btn back-btn" onClick={() => setSelectedJobId("")}>Indietro</button>

                    <section className="page-header">
                      <h1>{selectedJob.jobName}</h1>
                      <p>{selectedJob.externalCompany || "Lavorazione interna"} • {selectedJob.documentCount} documenti collegati</p>
                    </section>

                    <section className="stats-grid">
                      <StatCard label="Spesa totale" value={formatCurrency(selectedJob.total)} dark />
                      <StatCard label="Imponibile" value={formatCurrency(selectedJob.imponibile)} />
                      <StatCard label="IVA" value={formatCurrency(selectedJob.iva)} />
                      <StatCard label="Documenti" value={String(selectedJob.documentCount)} />
                    </section>

                    <section className="two-col">
                      <Panel title="Documenti collegati" subtitle="Archivio digitale della lavorazione.">
                        <div className="simple-list">
                          {documentsForSelectedJob.map((doc) => (
                            <button
                              key={doc.documentId}
                              className="simple-list-row clickable"
                              onClick={() => {
                                setSelectedDocumentId(doc.documentId);
                                setActiveView("documents");
                              }}
                            >
                              <div>
                                <div className="row-title">{doc.fileName}</div>
                                <div className="row-subtitle">{doc.type || "-"} • {doc.supplier || "-"}</div>
                              </div>
                              <div className="row-amount">{formatCurrency(doc.amount)}</div>
                            </button>
                          ))}
                        </div>
                      </Panel>

                      <Panel title="Spese collegate" subtitle="Movimenti associati alla lavorazione.">
                        <div className="simple-list">
                          {expensesForSelectedJob.map((exp) => (
                            <div key={exp.expenseId} className="simple-list-row">
                              <div>
                                <div className="row-title">{exp.description}</div>
                                <div className="row-subtitle">{exp.supplier || "-"} • {formatDate(exp.date)}</div>
                              </div>
                              <div className="row-amount">{formatCurrency(exp.amount)}</div>
                            </div>
                          ))}
                        </div>
                      </Panel>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeView === "documents" && (
              <div className="page-stack">
                {!selectedDocument ? (
                  <>
                    <section className="page-header">
                      <h1>Documenti</h1>
                      <p>Archivio digitale dei documenti del cantiere attivo.</p>
                    </section>

                    <section className="card-grid">
                      {filteredDocuments.map((doc) => (
                        <button key={doc.documentId} className="document-card" onClick={() => setSelectedDocumentId(doc.documentId)}>
                          <div className="document-card-title">{doc.fileName}</div>
                          <div className="document-card-subtitle">{doc.supplier || "-"} • {doc.type || "-"} • {doc.documentNumber || "-"}</div>
                          <div className="document-card-meta">
                            <span>{formatDate(doc.date)}</span>
                            <strong>{formatCurrency(doc.amount)}</strong>
                          </div>
                        </button>
                      ))}
                    </section>
                  </>
                ) : (
                  <>
                    <button className="secondary-btn back-btn" onClick={() => setSelectedDocumentId("")}>Indietro</button>

                    <section className="two-col">
                      <Panel title={selectedDocument.fileName} subtitle="Archivio digitale del documento selezionato.">
                        <div className="document-preview">
                          <div className="document-preview-icon">📄</div>
                          <div className="document-preview-title">Anteprima documento</div>
                          <div className="document-preview-copy">
                            Se nel foglio Google aggiungi un vero fileUrl, qui potrai aprire il documento reale direttamente dal sito.
                          </div>

                          {selectedDocument.fileUrl ? (
                            <a href={selectedDocument.fileUrl} target="_blank" rel="noreferrer" className="primary-btn">
                              Apri documento
                            </a>
                          ) : (
                            <div className="preview-placeholder">{selectedDocument.fileName}</div>
                          )}
                        </div>
                      </Panel>

                      <div className="page-stack">
                        <Panel title="Dettagli documento" subtitle="Dati principali letti dal master.">
                          <div className="details-list">
                            {[
                              ["Tipo", selectedDocument.type],
                              ["Fornitore", selectedDocument.supplier],
                              ["Numero", selectedDocument.documentNumber],
                              ["Data", formatDate(selectedDocument.date)],
                              ["Importo", formatCurrency(selectedDocument.amount)],
                              ["Cartella", selectedDocument.folder],
                            ].map(([label, value]) => (
                              <div key={label} className="detail-row">
                                <span>{label}</span>
                                <strong>{value || "-"}</strong>
                              </div>
                            ))}
                          </div>
                        </Panel>

                        <Panel title="Spese collegate" subtitle="Movimenti associati al documento.">
                          <div className="simple-list">
                            {linkedExpensesForDocument.map((exp) => (
                              <div key={exp.expenseId} className="simple-list-row">
                                <div>
                                  <div className="row-title">{exp.description}</div>
                                  <div className="row-subtitle">{exp.supplier || "-"} • {formatDate(exp.date)}</div>
                                </div>
                                <div className="row-amount">{formatCurrency(exp.amount)}</div>
                              </div>
                            ))}
                          </div>
                        </Panel>
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeView === "expenses" && (
              <div className="page-stack">
                <section className="page-header">
                  <h1>Spese</h1>
                  <p>Registro spese del cantiere attivo con ricerca rapida.</p>
                </section>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Lavorazione</th>
                        <th>Descrizione</th>
                        <th>Fornitore</th>
                        <th>Tipo</th>
                        <th>Pagamento</th>
                        <th>Imponibile</th>
                        <th>IVA</th>
                        <th>Totale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((item) => (
                        <tr key={item.expenseId}>
                          <td>{formatDate(item.date)}</td>
                          <td>{siteJobs.find((job) => job.jobId === item.jobId)?.jobName || "-"}</td>
                          <td>{item.description || "-"}</td>
                          <td>{item.supplier || "-"}</td>
                          <td>{item.documentType || "-"}</td>
                          <td>{item.paymentMethod || "-"}</td>
                          <td>{formatCurrency(item.imponibile)}</td>
                          <td>{formatCurrency(item.vat)}</td>
                          <td>{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>

          <nav className="mobile-nav mobile-only">
            <button className={navClass(activeView === "dashboard", true)} onClick={() => resetViewState("dashboard", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Home</button>
            <button className={navClass(activeView === "jobs", true)} onClick={() => resetViewState("jobs", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Lavori</button>
            <button className={navClass(activeView === "documents", true)} onClick={() => resetViewState("documents", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Documenti</button>
            <button className={navClass(activeView === "expenses", true)} onClick={() => resetViewState("expenses", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Spese</button>
          </nav>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, dark = false }) {
  return (
    <div className={`stat-card ${dark ? "stat-card-dark" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-title">{title}</div>
      <div className="panel-subtitle">{subtitle}</div>
      {children}
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

function navClass(active, mobile = false) {
  return [mobile ? "mobile-nav-btn" : "nav-btn", active ? (mobile ? "mobile-nav-btn-active" : "nav-btn-active") : ""].join(" ");
}

function resetViewState(view, setActiveView, setSelectedJobId, setSelectedDocumentId) {
  setSelectedJobId("");
  setSelectedDocumentId("");
  setActiveView(view);
}

const styles = `
* { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100%; font-family: Inter, Arial, sans-serif; background: #f1f5f9; color: #0f172a; }
button, input, select, a { font: inherit; }
button { cursor: pointer; }
.login-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%); }
.login-card { width: min(100%, 460px); background: white; border: 1px solid #e2e8f0; border-radius: 28px; padding: 28px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08); }
.login-chip { display: inline-block; background: #eef2ff; color: #1e293b; border-radius: 999px; padding: 8px 12px; font-size: 13px; font-weight: 700; }
.login-title { margin: 18px 0 8px; font-size: 36px; line-height: 1.05; }
.login-copy { margin: 0 0 18px; color: #475569; line-height: 1.6; }
.field-wrap { display: grid; gap: 8px; }
.field-wrap label { font-size: 14px; font-weight: 700; }
.field-wrap input { width: 100%; border: 1px solid #cbd5e1; outline: none; background: #f8fafc; border-radius: 16px; padding: 14px 16px; }
.login-btn { margin-top: 14px; width: 100%; }
.login-note { margin-top: 14px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; border-radius: 16px; font-size: 14px; color: #475569; }
.loading-shell { min-height: 100vh; display: grid; place-items: center; font-size: 18px; }
.app-shell { min-height: 100vh; display: flex; }
.sidebar { width: 290px; padding: 18px; background: white; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 18px; }
.brand-card { background: linear-gradient(135deg, #0f172a 0%, #172554 100%); color: white; border-radius: 28px; padding: 22px; }
.brand-overline { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #94a3b8; }
.brand-title { font-size: 28px; line-height: 1.05; font-weight: 800; margin-top: 10px; }
.brand-copy { margin-top: 10px; color: #cbd5e1; line-height: 1.5; font-size: 14px; }
.block { display: grid; gap: 8px; }
.block-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; font-weight: 700; }
.select, .search-box input { width: 100%; border: 1px solid #cbd5e1; background: #f8fafc; outline: none; padding: 14px 16px; border-radius: 16px; }
.side-nav { display: grid; gap: 6px; }
.nav-btn, .logout-btn { border: 0; background: transparent; border-radius: 16px; padding: 14px 16px; text-align: left; font-weight: 700; color: #475569; }
.nav-btn-active { background: #0f172a; color: white; }
.logout-btn { margin-top: auto; background: #f8fafc; border: 1px solid #e2e8f0; }
.main-shell { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 24px; }
.topbar-overline { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #64748b; font-weight: 700; }
.topbar-title { margin-top: 4px; font-size: 24px; font-weight: 800; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.search-box { min-width: 320px; }
.updated-pill { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 999px; padding: 10px 14px; font-size: 13px; color: #475569; font-weight: 700; }
.page-wrap { padding: 24px; }
.page-stack { display: grid; gap: 24px; }
.hero-card, .panel, .site-card, .job-card, .document-card { background: white; border: 1px solid #e2e8f0; border-radius: 28px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04); }
.hero-card { padding: 26px; display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; background: linear-gradient(135deg, #0f172a 0%, #172554 100%); color: white; }
.hero-overline { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #cbd5e1; }
.hero-card h1 { margin: 10px 0 6px; font-size: clamp(28px, 4vw, 44px); line-height: 1.02; }
.hero-card p { margin: 0; color: #dbeafe; }
.hero-pill { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.12); padding: 10px 14px; border-radius: 999px; font-weight: 700; white-space: nowrap; }
.stats-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; }
.stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 18px; }
.stat-card-dark { background: #0f172a; color: white; border-color: #0f172a; }
.stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-weight: 700; }
.stat-card-dark .stat-label { color: #94a3b8; }
.stat-value { margin-top: 10px; font-size: 28px; font-weight: 800; line-height: 1; }
.two-col { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; }
.panel { padding: 22px; }
.panel-title { font-size: 22px; font-weight: 800; }
.panel-subtitle { margin-top: 6px; color: #64748b; }
.simple-list { display: grid; gap: 12px; margin-top: 18px; }
.simple-list-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; background: #f8fafc; border-radius: 18px; padding: 14px 16px; border: 0; width: 100%; }
.simple-list-row.clickable:hover { background: #eef2ff; }
.row-title { font-weight: 700; text-align: left; }
.row-subtitle { margin-top: 4px; color: #64748b; font-size: 14px; text-align: left; }
.row-amount { white-space: nowrap; font-weight: 700; }
.page-header h1 { margin: 0; font-size: 36px; line-height: 1.05; }
.page-header p { margin: 8px 0 0; color: #64748b; }
.card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.site-card, .job-card, .document-card { padding: 20px; text-align: left; border: 1px solid #e2e8f0; }
.site-card-head, .document-card-meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.site-card-title, .job-card-title, .document-card-title { font-size: 22px; font-weight: 800; }
.site-card-subtitle, .job-card-subtitle, .document-card-subtitle { margin-top: 6px; color: #64748b; }
.status-pill { background: #dcfce7; color: #166534; border-radius: 999px; padding: 8px 12px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.site-stats, .job-metrics { margin-top: 18px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.site-stats > div, .job-metrics > div { background: #f8fafc; border-radius: 18px; padding: 12px; }
.mini-label, .job-metrics span { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.12em; display: block; }
.mini-value, .job-metrics strong { margin-top: 6px; font-weight: 800; font-size: 16px; }
.document-card-meta { margin-top: 16px; }
.secondary-btn, .primary-btn, .back-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 16px; padding: 12px 14px; font-weight: 700; cursor: pointer; text-decoration: none; }
.secondary-btn { background: white; border: 1px solid #cbd5e1; color: #0f172a; }
.primary-btn { background: #0f172a; color: white; border: 0; }
.back-btn { width: fit-content; }
.table-wrap { overflow: auto; background: white; border: 1px solid #e2e8f0; border-radius: 28px; box-shadow: 0 8px 24px rgba(15,23,42,0.04); }
.data-table { width: 100%; border-collapse: collapse; min-width: 980px; }
.data-table thead { background: #f8fafc; }
.data-table th, .data-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; }
.details-list { display: grid; gap: 10px; margin-top: 16px; }
.detail-row { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; background: #f8fafc; border-radius: 18px; padding: 14px 16px; }
.detail-row span { color: #64748b; }
.detail-row strong { text-align: right; word-break: break-word; }
.document-preview { margin-top: 18px; border: 1px dashed #cbd5e1; background: #f8fafc; border-radius: 24px; padding: 36px 20px; text-align: center; }
.document-preview-icon { font-size: 42px; }
.document-preview-title { margin-top: 12px; font-size: 22px; font-weight: 800; }
.document-preview-copy { margin: 8px auto 0; max-width: 440px; color: #64748b; line-height: 1.6; }
.preview-placeholder { margin-top: 16px; display: inline-flex; padding: 12px 16px; background: white; border-radius: 16px; border: 1px solid #e2e8f0; font-weight: 700; word-break: break-word; }
.mobile-nav { position: sticky; bottom: 0; z-index: 30; background: rgba(255,255,255,0.96); backdrop-filter: blur(8px); border-top: 1px solid #e2e8f0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding: 10px 12px env(safe-area-inset-bottom, 10px); }
.mobile-nav-btn { border: 0; background: transparent; border-radius: 18px; padding: 10px 8px; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; }
.mobile-nav-btn-active { background: #0f172a; color: white; }
.desktop-only { display: block; }
.mobile-only { display: none; }
@media (max-width: 1280px) { .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 1100px) { .two-col { grid-template-columns: 1fr; } .card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) { .desktop-only { display: none; } .mobile-only { display: grid; } .topbar { padding: 16px; } .topbar-title { font-size: 20px; } .page-wrap { padding: 16px 16px 88px; } .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .card-grid { grid-template-columns: 1fr; } .hero-card { flex-direction: column; } }
@media (max-width: 560px) { .stats-grid { grid-template-columns: 1fr; } .page-header h1 { font-size: 30px; } .login-card { padding: 22px; } .hero-card h1 { font-size: 34px; } }
`;
