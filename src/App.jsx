import { useMemo, useState } from "react";

export default function App() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [data, setData] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeView, setActiveView] = useState("dashboard");
  const [activeSiteId, setActiveSiteId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  const API_URL =
    "https://script.google.com/macros/s/AKfycbznT45oMXeEA968iARFhdUWIEpit17cd2EF_I2gORicQzNt6DGKm_Wa_kJqFEbWATR1/exec";

  const login = async () => {
    try {
      setAuthLoading(true);

      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      const text = await res.text();
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
    } finally {
      setAuthLoading(false);
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

  const siteJobs = useMemo(
    () => jobs.filter((job) => job.siteId === currentSiteId),
    [jobs, currentSiteId]
  );

  const siteDocuments = useMemo(
    () => documents.filter((doc) => doc.siteId === currentSiteId),
    [documents, currentSiteId]
  );

  const siteExpenses = useMemo(
    () => expenses.filter((exp) => exp.siteId === currentSiteId),
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
    return siteDocuments.filter((item) =>
      [
        item.fileName,
        item.supplier,
        item.type,
        item.documentNumber,
        item.folder,
        item.note,
        item.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [siteDocuments, query]);

  const filteredExpenses = useMemo(() => {
    if (!query) return siteExpenses;
    return siteExpenses.filter((item) =>
      [
        item.description,
        item.supplier,
        item.documentType,
        item.documentNumber,
        item.paymentMethod,
        item.note,
        item.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [siteExpenses, query]);

  const totals = useMemo(() => {
    return {
      total: siteExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0),
      imponibile: siteExpenses.reduce((sum, item) => sum + toNumber(item.imponibile), 0),
      iva: siteExpenses.reduce((sum, item) => sum + toNumber(item.vat), 0),
      docs: siteDocuments.length,
      jobs: siteJobs.length,
      avg: siteExpenses.length
        ? siteExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0) /
          siteExpenses.length
        : 0,
    };
  }, [siteExpenses, siteDocuments, siteJobs]);

  const enrichedJobs = useMemo(() => {
    return filteredJobs.map((job) => {
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
  }, [filteredJobs, siteExpenses, siteDocuments]);

  const selectedJob =
    enrichedJobs.find((job) => job.jobId === selectedJobId) ||
    siteJobs.find((job) => job.jobId === selectedJobId) ||
    null;

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

  const dashboardJobs = enrichedJobs.slice(0, 6);
  const dashboardDocs = [...filteredDocuments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const renderSearchBar = () => (
    <div className="searchBar">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cerca spese, documenti, fornitori, lavorazioni..."
      />
    </div>
  );

  if (!logged) {
    return (
      <>
        <style>{styles}</style>
        <div className="loginShell">
          <div className="loginCard">
            <div className="chip">Europa Service · Portale protetto</div>
            <h1 className="loginTitle">Contabilità cantieri</h1>
            <p className="loginText">
              Accesso rapido ai dati del cantiere, leggibili da cellulare e aggiornati dal
              Google Sheets master.
            </p>

            <div className="field">
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

            <button className="primaryButton fullWidth" onClick={login} disabled={authLoading}>
              {authLoading ? "Verifica accesso..." : "Entra"}
            </button>

            {authLoading ? (
              <div className="loadingBox">
                <div className="loader" />
                <div>
                  <div className="loadingTitle">Caricamento in corso</div>
                  <div className="loadingText">
                    Sto verificando la password e leggendo i dati dal master.
                  </div>
                </div>
              </div>
            ) : null}

            <div className="noteBox">
              Il sito è solo di visualizzazione: aggiorni il foglio master e qui vedi tutto.
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
        <div className="centerScreen">Caricamento dati...</div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="app">
        <aside className="sidebar desktopOnly">
          <div className="brandCard">
            <div className="overline overlineLight">Europa Service</div>
            <div className="brandTitle">Visualizzazione contabilità</div>
            <div className="brandText">Portale protetto collegato al Google Sheets master.</div>
          </div>

          <div className="section">
            <div className="sectionLabel">Cantiere attivo</div>
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

          <nav className="nav">
            <button className={navClass(activeView === "dashboard")} onClick={() => resetView("dashboard", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Dashboard</button>
            <button className={navClass(activeView === "sites")} onClick={() => resetView("sites", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Cantieri</button>
            <button className={navClass(activeView === "jobs")} onClick={() => resetView("jobs", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Lavorazioni</button>
            <button className={navClass(activeView === "documents")} onClick={() => resetView("documents", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Documenti</button>
            <button className={navClass(activeView === "expenses")} onClick={() => resetView("expenses", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Spese</button>
          </nav>

          <button className="secondaryButton" onClick={logout}>
            Esci
          </button>
        </aside>

        <div className="main">
          <header className="topbar">
            <div className="topbarLeft">
              <div className="overline">Portale protetto</div>
              <div className="topTitle">{activeSite.name || activeSite.siteName}</div>
              <div className="topMeta mobileOnly">
                Aggiornato: {generatedAt ? formatDateTime(generatedAt) : "-"}
              </div>
            </div>

            <div className="topbarRight desktopOnly">
              {renderSearchBar()}
              <div className="pill">Aggiornato: {generatedAt ? formatDateTime(generatedAt) : "-"}</div>
            </div>
          </header>

          <div className="mobileSearch mobileOnly">{renderSearchBar()}</div>

          <main className="content">
            {activeView === "dashboard" && (
              <div className="stack">
                <section className="hero">
                  <div>
                    <div className="overline overlineLight">Cantiere attivo</div>
                    <h1>{activeSite.name || activeSite.siteName}</h1>
                    <p>
                      Cliente: {activeSite.client || "-"} • {activeSite.city || "-"} • Stato:{" "}
                      {activeSite.status || "-"}
                    </p>
                  </div>
                  <div className="heroPill">{totals.docs} documenti</div>
                </section>

                <section className="statsGrid">
                  <StatCard label="Spese totali" value={formatCurrency(totals.total)} dark />
                  <StatCard label="Imponibile" value={formatCurrency(totals.imponibile)} />
                  <StatCard label="IVA" value={formatCurrency(totals.iva)} />
                  <StatCard label="Lavorazioni" value={String(totals.jobs)} />
                  <StatCard label="Documenti" value={String(totals.docs)} />
                  <StatCard label="Spesa media" value={formatCurrency(totals.avg)} />
                </section>

                <section className="grid2">
                  <Panel title="Lavorazioni del cantiere" subtitle={query ? "Risultati filtrati dalla ricerca." : "Totali, documenti e costi per ogni lavorazione."}>
                    <div className="list">
                      {dashboardJobs.length ? (
                        dashboardJobs.map((job) => (
                          <button
                            key={job.jobId}
                            className="listRow clickable"
                            onClick={() => {
                              setSelectedJobId(job.jobId);
                              setSelectedDocumentId("");
                              setActiveView("jobs");
                            }}
                          >
                            <div>
                              <div className="rowTitle">{job.jobName}</div>
                              <div className="rowSub">
                                {job.externalCompany || "Lavorazione interna"} • {job.documentCount} documenti
                              </div>
                            </div>
                            <div className="rowAmount">{formatCurrency(job.total)}</div>
                          </button>
                        ))
                      ) : (
                        <div className="emptyState">Nessun risultato.</div>
                      )}
                    </div>
                  </Panel>

                  <Panel title="Ultimi documenti" subtitle={query ? "Documenti filtrati dalla ricerca." : "Documenti recenti letti dal master."}>
                    <div className="list">
                      {dashboardDocs.length ? (
                        dashboardDocs.map((doc) => (
                          <button
                            key={doc.documentId}
                            className="listRow clickable"
                            onClick={() => {
                              setSelectedDocumentId(doc.documentId);
                              setSelectedJobId("");
                              setActiveView("documents");
                            }}
                          >
                            <div>
                              <div className="rowTitle">{doc.fileName}</div>
                              <div className="rowSub">
                                {doc.supplier || "-"} • {formatDate(doc.date)}
                              </div>
                            </div>
                            <div className="rowAmount">{formatCurrency(doc.amount)}</div>
                          </button>
                        ))
                      ) : (
                        <div className="emptyState">Nessun risultato.</div>
                      )}
                    </div>
                  </Panel>
                </section>
              </div>
            )}

            {activeView === "sites" && (
              <div className="stack">
                <section className="pageHeader">
                  <h1>Cantieri</h1>
                  <p>Tutti i cantieri letti dal Google Sheets master.</p>
                </section>

                <section className="cards">
                  {sites.map((site) => {
                    const siteId = site.id || site.siteId;
                    const siteExpenseRows = expenses.filter((item) => item.siteId === siteId);
                    const siteDocumentRows = documents.filter((item) => item.siteId === siteId);
                    const total = siteExpenseRows.reduce((sum, item) => sum + toNumber(item.amount), 0);

                    return (
                      <div key={siteId} className="card">
                        <div className="cardHead">
                          <div>
                            <div className="cardTitle">{site.name || site.siteName}</div>
                            <div className="cardSub">
                              {site.client || "-"} • {site.city || "-"}
                            </div>
                          </div>
                          <div className="status">{site.status || "-"}</div>
                        </div>

                        <div className="miniGrid">
                          <div>
                            <div className="miniLabel">Spese</div>
                            <div className="miniValue">{siteExpenseRows.length}</div>
                          </div>
                          <div>
                            <div className="miniLabel">Documenti</div>
                            <div className="miniValue">{siteDocumentRows.length}</div>
                          </div>
                          <div>
                            <div className="miniLabel">Totale</div>
                            <div className="miniValue">{formatCurrency(total)}</div>
                          </div>
                        </div>

                        <button
                          className="secondaryButton"
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
              <div className="stack">
                {!selectedJob ? (
                  <>
                    <section className="pageHeader">
                      <h1>Lavorazioni</h1>
                      <p>{query ? "Risultati filtrati dalla ricerca." : "Vista completa delle lavorazioni del cantiere attivo."}</p>
                    </section>

                    <section className="cards">
                      {enrichedJobs.length ? (
                        enrichedJobs.map((job) => (
                          <button key={job.jobId} className="card" onClick={() => setSelectedJobId(job.jobId)}>
                            <div className="cardTitle">{job.jobName}</div>
                            <div className="cardSub">{job.externalCompany || "Lavorazione interna"}</div>
                            <div className="miniGrid">
                              <div>
                                <div className="miniLabel">Totale</div>
                                <div className="miniValue">{formatCurrency(job.total)}</div>
                              </div>
                              <div>
                                <div className="miniLabel">Spese</div>
                                <div className="miniValue">{job.expenseCount}</div>
                              </div>
                              <div>
                                <div className="miniLabel">Documenti</div>
                                <div className="miniValue">{job.documentCount}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="emptyStateCard">Nessun risultato.</div>
                      )}
                    </section>
                  </>
                ) : (
                  <>
                    <button className="secondaryButton backButton" onClick={() => setSelectedJobId("")}>
                      Indietro
                    </button>

                    <section className="pageHeader">
                      <h1>{selectedJob.jobName}</h1>
                      <p>{selectedJob.externalCompany || "Lavorazione interna"}</p>
                    </section>

                    <section className="grid2">
                      <Panel title="Documenti collegati" subtitle="Archivio digitale della lavorazione.">
                        <div className="list">
                          {documentsForSelectedJob.length ? (
                            documentsForSelectedJob.map((doc) => (
                              <button
                                key={doc.documentId}
                                className="listRow clickable"
                                onClick={() => {
                                  setSelectedDocumentId(doc.documentId);
                                  setActiveView("documents");
                                }}
                              >
                                <div>
                                  <div className="rowTitle">{doc.fileName}</div>
                                  <div className="rowSub">{doc.type || "-"} • {doc.supplier || "-"}</div>
                                </div>
                                <div className="rowAmount">{formatCurrency(doc.amount)}</div>
                              </button>
                            ))
                          ) : (
                            <div className="emptyState">Nessun documento collegato.</div>
                          )}
                        </div>
                      </Panel>

                      <Panel title="Spese collegate" subtitle="Movimenti associati alla lavorazione.">
                        <div className="list">
                          {expensesForSelectedJob.length ? (
                            expensesForSelectedJob.map((exp) => (
                              <div key={exp.expenseId} className="listRow">
                                <div>
                                  <div className="rowTitle">{exp.description}</div>
                                  <div className="rowSub">{exp.supplier || "-"} • {formatDate(exp.date)}</div>
                                </div>
                                <div className="rowAmount">{formatCurrency(exp.amount)}</div>
                              </div>
                            ))
                          ) : (
                            <div className="emptyState">Nessuna spesa collegata.</div>
                          )}
                        </div>
                      </Panel>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeView === "documents" && (
              <div className="stack">
                {!selectedDocument ? (
                  <>
                    <section className="pageHeader">
                      <h1>Documenti</h1>
                      <p>{query ? "Risultati filtrati dalla ricerca." : "Archivio digitale dei documenti del cantiere attivo."}</p>
                    </section>

                    <section className="cards">
                      {filteredDocuments.length ? (
                        filteredDocuments.map((doc) => (
                          <button key={doc.documentId} className="card" onClick={() => setSelectedDocumentId(doc.documentId)}>
                            <div className="cardTitle">{doc.fileName}</div>
                            <div className="cardSub">
                              {doc.supplier || "-"} • {doc.type || "-"} • {doc.documentNumber || "-"}
                            </div>
                            <div className="cardMeta">
                              <span>{formatDate(doc.date)}</span>
                              <strong>{formatCurrency(doc.amount)}</strong>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="emptyStateCard">Nessun risultato.</div>
                      )}
                    </section>
                  </>
                ) : (
                  <>
                    <button className="secondaryButton backButton" onClick={() => setSelectedDocumentId("")}>
                      Indietro
                    </button>

                    <section className="grid2">
                      <Panel title={selectedDocument.fileName} subtitle="Archivio digitale del documento selezionato.">
                        <div className="preview">
                          <div className="previewIcon">📄</div>
                          <div className="previewTitle">Anteprima documento</div>
                          <div className="previewText">
                            Se nel foglio Google aggiungi un vero fileUrl, qui potrai aprire il
                            documento reale direttamente dal sito.
                          </div>

                          {selectedDocument.fileUrl ? (
                            <a
                              href={selectedDocument.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="primaryButton"
                            >
                              Apri documento
                            </a>
                          ) : (
                            <div className="previewPlaceholder">{selectedDocument.fileName}</div>
                          )}
                        </div>
                      </Panel>

                      <Panel title="Spese collegate" subtitle="Movimenti associati al documento.">
                        <div className="list">
                          {linkedExpensesForDocument.length ? (
                            linkedExpensesForDocument.map((exp) => (
                              <div key={exp.expenseId} className="listRow">
                                <div>
                                  <div className="rowTitle">{exp.description}</div>
                                  <div className="rowSub">{exp.supplier || "-"} • {formatDate(exp.date)}</div>
                                </div>
                                <div className="rowAmount">{formatCurrency(exp.amount)}</div>
                              </div>
                            ))
                          ) : (
                            <div className="emptyState">Nessuna spesa collegata.</div>
                          )}
                        </div>
                      </Panel>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeView === "expenses" && (
              <div className="stack">
                <section className="pageHeader">
                  <h1>Spese</h1>
                  <p>{query ? "Risultati filtrati dalla ricerca." : "Registro spese del cantiere attivo."}</p>
                </section>

                <div className="expenseCards mobileOnly">
                  {filteredExpenses.length ? (
                    filteredExpenses.map((item) => (
                      <div key={item.expenseId} className="expenseCard">
                        <div className="expenseCardTop">
                          <div>
                            <div className="rowTitle">{item.description || "-"}</div>
                            <div className="rowSub">
                              {siteJobs.find((job) => job.jobId === item.jobId)?.jobName || "-"} •{" "}
                              {formatDate(item.date)}
                            </div>
                          </div>
                          <div className="expenseAmount">{formatCurrency(item.amount)}</div>
                        </div>

                        <div className="expenseMetaGrid">
                          <div>
                            <span>Fornitore</span>
                            <strong>{item.supplier || "-"}</strong>
                          </div>
                          <div>
                            <span>Tipo</span>
                            <strong>{item.documentType || "-"}</strong>
                          </div>
                          <div>
                            <span>Pagamento</span>
                            <strong>{item.paymentMethod || "-"}</strong>
                          </div>
                          <div>
                            <span>Imponibile</span>
                            <strong>{formatCurrency(item.imponibile)}</strong>
                          </div>
                          <div>
                            <span>IVA</span>
                            <strong>{formatCurrency(item.vat)}</strong>
                          </div>
                          <div>
                            <span>Numero doc</span>
                            <strong>{item.documentNumber || "-"}</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="emptyStateCard">Nessun risultato.</div>
                  )}
                </div>

                <div className="tableWrap desktopOnly">
                  <table className="table">
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

          <nav className="mobileNav mobileOnly">
            <button className={navClass(activeView === "dashboard", true)} onClick={() => resetView("dashboard", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Home</button>
            <button className={navClass(activeView === "jobs", true)} onClick={() => resetView("jobs", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Lavori</button>
            <button className={navClass(activeView === "documents", true)} onClick={() => resetView("documents", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Documenti</button>
            <button className={navClass(activeView === "expenses", true)} onClick={() => resetView("expenses", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Spese</button>
          </nav>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, dark = false }) {
  return (
    <div className={`statCard ${dark ? "statCardDark" : ""}`}>
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panelTitle">{title}</div>
      <div className="panelSub">{subtitle}</div>
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
  return [
    mobile ? "mobileNavBtn" : "navBtn",
    active ? (mobile ? "mobileNavBtnActive" : "navBtnActive") : "",
  ].join(" ");
}

function resetView(view, setActiveView, setSelectedJobId, setSelectedDocumentId) {
  setSelectedJobId("");
  setSelectedDocumentId("");
  setActiveView(view);
}

const styles = `
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:#f3f6fb;color:#0f172a}
button,input,select,a{font:inherit}
button{cursor:pointer}

/* login */
.loginShell{min-height:100vh;display:grid;place-items:center;padding:20px;background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%)}
.loginCard{width:min(100%,420px);background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:22px;box-shadow:0 18px 40px rgba(15,23,42,.08)}
.chip{display:inline-block;background:#eef2ff;color:#1e293b;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:600}
.loginTitle{margin:16px 0 8px;font-size:28px;line-height:1.08;letter-spacing:-.03em;font-weight:700}
.loginText{margin:0 0 18px;color:#475569;line-height:1.55;font-size:15px;max-width:34ch}
.field{display:grid;gap:8px}
.field label{font-size:13px;font-weight:600;letter-spacing:.02em;color:#334155}
.field input{width:100%;border:1px solid #cbd5e1;outline:none;background:#f8fafc;border-radius:14px;padding:14px 16px;font-size:15px;color:#0f172a}
.fullWidth{width:100%}
.primaryButton,.secondaryButton{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;padding:11px 13px;font-weight:600;text-decoration:none}
.primaryButton{background:#0f172a;color:#fff;border:0}
.secondaryButton{background:#fff;border:1px solid #cbd5e1;color:#0f172a}
.noteBox{margin-top:14px;background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:14px;font-size:13px;color:#475569;line-height:1.45}
.centerScreen{min-height:100vh;display:grid;place-items:center;font-size:18px}
.loadingBox{margin-top:14px;display:flex;align-items:center;gap:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:16px}
.loader{width:22px;height:22px;border:3px solid #cbd5e1;border-top-color:#0f172a;border-radius:999px;animation:spin .8s linear infinite;flex:0 0 auto}
.loadingTitle{font-size:14px;font-weight:700;color:#0f172a}
.loadingText{margin-top:2px;font-size:13px;line-height:1.35;color:#64748b}
@keyframes spin{to{transform:rotate(360deg)}}

/* layout */
.app{min-height:100vh;display:flex;flex-direction:column}
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.content{padding:12px 12px 92px}
.stack{display:grid;gap:14px}
.mobileOnly{display:grid}
.desktopOnly{display:none}

/* sidebar desktop */
.sidebar{width:290px;padding:18px;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;gap:18px}
.brandCard{background:linear-gradient(135deg,#0f172a 0%,#172554 100%);color:#fff;border-radius:22px;padding:18px}
.brandTitle{font-size:20px;line-height:1.1;font-weight:700;margin-top:10px;letter-spacing:-.02em}
.brandText{margin-top:10px;color:#cbd5e1;line-height:1.5;font-size:13px;max-width:20ch}
.section{display:grid;gap:8px}
.sectionLabel{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#64748b;font-weight:600}
.select{width:100%;border:1px solid #cbd5e1;background:#f8fafc;outline:none;padding:13px 14px;border-radius:14px}
.nav{display:grid;gap:6px}
.navBtn{border:0;background:transparent;border-radius:14px;padding:13px 14px;text-align:left;font-weight:600;color:#475569}
.navBtnActive{background:#0f172a;color:#fff}

/* topbar */
.topbar{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:14px 16px}
.topbarLeft{min-width:0}
.topTitle{margin-top:4px;font-size:17px;font-weight:700;letter-spacing:-.02em}
.topMeta{margin-top:4px;font-size:12px;color:#64748b}
.topbarRight{display:flex;align-items:center;gap:10px}
.pill{background:#f8fafc;border:1px solid #e2e8f0;border-radius:999px;padding:10px 14px;font-size:12px;color:#475569;font-weight:600}

/* search */
.mobileSearch{padding:10px 12px 0}
.searchBar input{width:100%;border:1px solid #cbd5e1;background:#fff;outline:none;padding:13px 14px;border-radius:14px;box-shadow:0 2px 8px rgba(15,23,42,.03)}
.searchBar input::placeholder{color:#94a3b8}

/* generic text */
.overline{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#64748b;font-weight:600}
.overlineLight{color:#cbd5e1}

/* hero */
.hero,.panel,.card,.expenseCard{background:#fff;border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 6px 18px rgba(15,23,42,.04)}
.hero{padding:18px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;background:linear-gradient(135deg,#0f172a 0%,#172554 100%);color:#fff;flex-direction:column}
.hero h1{margin:8px 0 4px;font-size:clamp(20px,6.6vw,28px);line-height:1.08;letter-spacing:-.03em;font-weight:700}
.hero p{margin:0;color:#dbeafe;font-size:14px;line-height:1.45}
.heroPill{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12);padding:9px 12px;border-radius:999px;font-weight:600;white-space:nowrap;font-size:12px}

/* stats */
.statsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.statCard{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px;min-height:82px}
.statCardDark{background:#0f172a;color:#fff;border-color:#0f172a}
.statLabel{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#64748b;font-weight:600}
.statCardDark .statLabel{color:#94a3b8}
.statValue{margin-top:7px;font-size:18px;font-weight:700;line-height:1.05;letter-spacing:-.02em}

/* panels */
.grid2{display:grid;grid-template-columns:1fr;gap:14px}
.panel{padding:16px}
.panelTitle{font-size:16px;font-weight:700;line-height:1.18;letter-spacing:-.02em}
.panelSub{margin-top:5px;color:#64748b;font-size:13px;line-height:1.45}
.list{display:grid;gap:10px;margin-top:14px}
.listRow{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:16px;padding:12px 13px;border:0;width:100%}
.listRow.clickable:hover{background:#eef2ff}
.rowTitle{font-weight:600;text-align:left;font-size:14px;line-height:1.35}
.rowSub{margin-top:4px;color:#64748b;font-size:13px;text-align:left;line-height:1.35}
.rowAmount{white-space:nowrap;font-weight:600;font-size:14px}
.emptyState{padding:14px;border:1px dashed #cbd5e1;border-radius:16px;color:#64748b;font-size:13px;background:#fafcff}

/* page blocks */
.pageHeader h1{margin:0;font-size:24px;line-height:1.08;letter-spacing:-.03em;font-weight:700}
.pageHeader p{margin:8px 0 0;color:#64748b;font-size:14px;line-height:1.45}
.cards{display:grid;grid-template-columns:1fr;gap:12px}
.card{padding:14px;text-align:left}
.cardHead,.cardMeta{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.cardTitle{font-size:16px;font-weight:700;line-height:1.18;letter-spacing:-.02em}
.cardSub{margin-top:5px;color:#64748b;font-size:12px;line-height:1.4}
.status{background:#dcfce7;color:#166534;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:600}
.miniGrid{margin-top:12px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.miniGrid>div{background:#f8fafc;border-radius:16px;padding:10px}
.miniLabel{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.12em;display:block}
.miniValue{margin-top:6px;font-weight:700;font-size:14px}
.emptyStateCard{padding:18px;border:1px dashed #cbd5e1;border-radius:18px;background:#fff;color:#64748b}

/* preview */
.preview{margin-top:14px;border:1px dashed #cbd5e1;background:#f8fafc;border-radius:20px;padding:26px 16px;text-align:center}
.previewIcon{font-size:42px}
.previewTitle{margin-top:12px;font-size:18px;font-weight:700;line-height:1.15}
.previewText{margin:8px auto 0;max-width:440px;color:#64748b;line-height:1.5;font-size:14px}
.previewPlaceholder{margin-top:16px;display:inline-flex;padding:12px 16px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;font-weight:600;word-break:break-word;font-size:14px}

/* expenses mobile */
.expenseCards{display:grid;gap:12px}
.expenseCard{padding:14px}
.expenseCardTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.expenseAmount{white-space:nowrap;font-size:15px;font-weight:700}
.expenseMetaGrid{margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.expenseMetaGrid span{display:block;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;font-weight:600}
.expenseMetaGrid strong{display:block;margin-top:4px;font-size:13px;line-height:1.35;font-weight:600;color:#0f172a}

/* expenses desktop */
.tableWrap{overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 6px 18px rgba(15,23,42,.04)}
.table{width:100%;border-collapse:collapse;min-width:980px}
.table thead{background:#f8fafc}
.table th,.table td{padding:12px 13px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:13px}
.table th{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#64748b;font-weight:600}

/* mobile nav */
.mobileNav{position:sticky;bottom:0;z-index:30;background:rgba(255,255,255,.98);backdrop-filter:blur(8px);border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:8px 10px env(safe-area-inset-bottom,10px)}
.mobileNavBtn{border:0;background:transparent;border-radius:14px;padding:8px 6px;color:#64748b;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;font-weight:600}
.mobileNavBtnActive{background:#0f172a;color:#fff}
.backButton{width:fit-content}

/* breakpoints */
@media (max-width:420px){
  .statsGrid{grid-template-columns:1fr}
  .expenseMetaGrid{grid-template-columns:1fr}
  .topTitle{font-size:16px}
}
@media (min-width:901px){
  .app{flex-direction:row}
  .desktopOnly{display:block}
  .mobileOnly{display:none}
  .mobileSearch{display:none}
  .content{padding:24px}
  .stack{gap:24px}
  .topbar{padding:18px 24px;gap:16px;align-items:center}
  .hero{padding:26px;flex-direction:row}
  .statsGrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
  .grid2{grid-template-columns:1.1fr 1fr;gap:20px}
  .cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .expenseCards{display:none}
}
@media (min-width:1180px){
  .statsGrid{grid-template-columns:repeat(6,minmax(0,1fr))}
  .cards{grid-template-columns:repeat(3,minmax(0,1fr))}
}
`;
