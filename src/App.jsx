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

  const recentDocs = [...filteredDocuments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (!logged) {
    return (
      <>
        <style>{styles}</style>
        <div className="loginWrap">
          <div className="loginCard">
            <div className="badge">Europa Service · Accesso protetto</div>
            <h1 className="loginTitle">Contabilità cantieri</h1>
            <p className="loginText">
              Versione pensata prima di tutto per il cellulare. Il sito legge i dati dal Google Sheets master.
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

            <button className="primaryBtn full" onClick={login} disabled={authLoading}>
              {authLoading ? "Verifica accesso..." : "Entra"}
            </button>

            {authLoading ? (
              <div className="loadingCard">
                <div className="spinner" />
                <div>
                  <div className="loadingTitle">Caricamento in corso</div>
                  <div className="loadingText">
                    Verifica password e lettura dati dal master.
                  </div>
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

      <div className="layout">
        <aside className="sidebar desktopOnly">
          <div className="sideCard">
            <div className="sideOverline">Europa Service</div>
            <div className="sideTitle">Visualizzazione contabilità</div>
            <div className="sideText">Portale protetto collegato al Google Sheets master.</div>
          </div>

          <div className="sideBlock">
            <div className="sideLabel">Cantiere attivo</div>
            <select
              className="input"
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

          <div className="sideNav">
            <button className={desktopNavClass(activeView === "dashboard")} onClick={() => resetView("dashboard", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Dashboard</button>
            <button className={desktopNavClass(activeView === "sites")} onClick={() => resetView("sites", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Cantieri</button>
            <button className={desktopNavClass(activeView === "jobs")} onClick={() => resetView("jobs", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Lavorazioni</button>
            <button className={desktopNavClass(activeView === "documents")} onClick={() => resetView("documents", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Documenti</button>
            <button className={desktopNavClass(activeView === "expenses")} onClick={() => resetView("expenses", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Spese</button>
          </div>

          <button className="secondaryBtn" onClick={logout}>Esci</button>
        </aside>

        <div className="main">
          <header className="mobileHeader">
            <div className="topLine">Portale protetto</div>
            <div className="siteName">{activeSite.name || activeSite.siteName}</div>
            <div className="siteInfo">
              {activeSite.client || "-"} • {activeSite.city || "-"} • {activeSite.status || "-"}
            </div>
            <div className="updateInfo">
              Aggiornato: {generatedAt ? formatDateTime(generatedAt) : "-"}
            </div>
          </header>

          <div className="mobileSearch">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca spese, documenti, fornitori, lavorazioni..."
            />
          </div>

          <main className="page">
            {activeView === "dashboard" && (
              <div className="stack">
                <section className="heroCard">
                  <div className="heroTop">
                    <div>
                      <div className="smallLabel light">Cantiere attivo</div>
                      <h1>{activeSite.name || activeSite.siteName}</h1>
                    </div>
                    <div className="heroDocs">{totals.docs} documenti</div>
                  </div>
                  <div className="heroText">
                    Cliente: {activeSite.client || "-"} • {activeSite.city || "-"} • Stato:{" "}
                    {activeSite.status || "-"}
                  </div>
                </section>

                <section className="stats">
                  <InfoCard label="Spese totali" value={formatCurrency(totals.total)} dark />
                  <InfoCard label="Imponibile" value={formatCurrency(totals.imponibile)} />
                  <InfoCard label="IVA" value={formatCurrency(totals.iva)} />
                  <InfoCard label="Lavorazioni" value={String(totals.jobs)} />
                  <InfoCard label="Documenti" value={String(totals.docs)} />
                  <InfoCard label="Spesa media" value={formatCurrency(totals.avg)} />
                </section>

                <section className="sectionCard">
                  <div className="sectionTitle">Lavorazioni</div>
                  <div className="sectionSubtitle">
                    {query ? "Risultati filtrati dalla ricerca." : "Panoramica rapida delle lavorazioni."}
                  </div>

                  <div className="itemList">
                    {enrichedJobs.length ? (
                      enrichedJobs.slice(0, 6).map((job) => (
                        <button
                          key={job.jobId}
                          className="itemRow clickRow"
                          onClick={() => {
                            setSelectedJobId(job.jobId);
                            setSelectedDocumentId("");
                            setActiveView("jobs");
                          }}
                        >
                          <div>
                            <div className="itemTitle">{job.jobName}</div>
                            <div className="itemSub">
                              {job.externalCompany || "Lavorazione interna"} • {job.documentCount} documenti
                            </div>
                          </div>
                          <div className="itemValue">{formatCurrency(job.total)}</div>
                        </button>
                      ))
                    ) : (
                      <div className="emptyBox">Nessun risultato.</div>
                    )}
                  </div>
                </section>

                <section className="sectionCard">
                  <div className="sectionTitle">Ultimi documenti</div>
                  <div className="sectionSubtitle">
                    {query ? "Documenti filtrati dalla ricerca." : "Documenti più recenti del cantiere."}
                  </div>

                  <div className="itemList">
                    {recentDocs.length ? (
                      recentDocs.map((doc) => (
                        <button
                          key={doc.documentId}
                          className="itemRow clickRow"
                          onClick={() => {
                            setSelectedDocumentId(doc.documentId);
                            setSelectedJobId("");
                            setActiveView("documents");
                          }}
                        >
                          <div>
                            <div className="itemTitle">{doc.fileName}</div>
                            <div className="itemSub">
                              {doc.supplier || "-"} • {formatDate(doc.date)}
                            </div>
                          </div>
                          <div className="itemValue">{formatCurrency(doc.amount)}</div>
                        </button>
                      ))
                    ) : (
                      <div className="emptyBox">Nessun risultato.</div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeView === "sites" && (
              <div className="stack">
                <div className="pageHead">
                  <h2>Cantieri</h2>
                  <p>Tutti i cantieri letti dal Google Sheets master.</p>
                </div>

                <div className="cardGrid">
                  {sites.map((site) => {
                    const siteId = site.id || site.siteId;
                    const siteExpenseRows = expenses.filter((item) => item.siteId === siteId);
                    const siteDocumentRows = documents.filter((item) => item.siteId === siteId);
                    const total = siteExpenseRows.reduce((sum, item) => sum + toNumber(item.amount), 0);

                    return (
                      <div key={siteId} className="listCard">
                        <div className="listHead">
                          <div>
                            <div className="listTitle">{site.name || site.siteName}</div>
                            <div className="listSub">{site.client || "-"} • {site.city || "-"}</div>
                          </div>
                          <div className="statusPill">{site.status || "-"}</div>
                        </div>

                        <div className="miniStats">
                          <div>
                            <span>Spese</span>
                            <strong>{siteExpenseRows.length}</strong>
                          </div>
                          <div>
                            <span>Documenti</span>
                            <strong>{siteDocumentRows.length}</strong>
                          </div>
                          <div>
                            <span>Totale</span>
                            <strong>{formatCurrency(total)}</strong>
                          </div>
                        </div>

                        <button
                          className="secondaryBtn"
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
                </div>
              </div>
            )}

            {activeView === "jobs" && (
              <div className="stack">
                {!selectedJob ? (
                  <>
                    <div className="pageHead">
                      <h2>Lavorazioni</h2>
                      <p>{query ? "Risultati filtrati dalla ricerca." : "Vista completa delle lavorazioni del cantiere."}</p>
                    </div>

                    <div className="cardGrid">
                      {enrichedJobs.length ? (
                        enrichedJobs.map((job) => (
                          <button key={job.jobId} className="listCard buttonCard" onClick={() => setSelectedJobId(job.jobId)}>
                            <div className="listTitle">{job.jobName}</div>
                            <div className="listSub">{job.externalCompany || "Lavorazione interna"}</div>

                            <div className="miniStats">
                              <div>
                                <span>Totale</span>
                                <strong>{formatCurrency(job.total)}</strong>
                              </div>
                              <div>
                                <span>Spese</span>
                                <strong>{job.expenseCount}</strong>
                              </div>
                              <div>
                                <span>Documenti</span>
                                <strong>{job.documentCount}</strong>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="emptyCard">Nessun risultato.</div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button className="secondaryBtn backBtn" onClick={() => setSelectedJobId("")}>
                      Indietro
                    </button>

                    <div className="pageHead">
                      <h2>{selectedJob.jobName}</h2>
                      <p>{selectedJob.externalCompany || "Lavorazione interna"}</p>
                    </div>

                    <section className="sectionCard">
                      <div className="sectionTitle">Documenti collegati</div>
                      <div className="itemList">
                        {documentsForSelectedJob.length ? (
                          documentsForSelectedJob.map((doc) => (
                            <button
                              key={doc.documentId}
                              className="itemRow clickRow"
                              onClick={() => {
                                setSelectedDocumentId(doc.documentId);
                                setActiveView("documents");
                              }}
                            >
                              <div>
                                <div className="itemTitle">{doc.fileName}</div>
                                <div className="itemSub">{doc.type || "-"} • {doc.supplier || "-"}</div>
                              </div>
                              <div className="itemValue">{formatCurrency(doc.amount)}</div>
                            </button>
                          ))
                        ) : (
                          <div className="emptyBox">Nessun documento collegato.</div>
                        )}
                      </div>
                    </section>

                    <section className="sectionCard">
                      <div className="sectionTitle">Spese collegate</div>
                      <div className="itemList">
                        {expensesForSelectedJob.length ? (
                          expensesForSelectedJob.map((exp) => (
                            <div key={exp.expenseId} className="itemRow">
                              <div>
                                <div className="itemTitle">{exp.description}</div>
                                <div className="itemSub">{exp.supplier || "-"} • {formatDate(exp.date)}</div>
                              </div>
                              <div className="itemValue">{formatCurrency(exp.amount)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="emptyBox">Nessuna spesa collegata.</div>
                        )}
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeView === "documents" && (
              <div className="stack">
                {!selectedDocument ? (
                  <>
                    <div className="pageHead">
                      <h2>Documenti</h2>
                      <p>{query ? "Risultati filtrati dalla ricerca." : "Archivio digitale del cantiere."}</p>
                    </div>

                    <div className="cardGrid">
                      {filteredDocuments.length ? (
                        filteredDocuments.map((doc) => (
                          <button key={doc.documentId} className="listCard buttonCard" onClick={() => setSelectedDocumentId(doc.documentId)}>
                            <div className="listTitle">{doc.fileName}</div>
                            <div className="listSub">
                              {doc.supplier || "-"} • {doc.type || "-"} • {doc.documentNumber || "-"}
                            </div>
                            <div className="docMeta">
                              <span>{formatDate(doc.date)}</span>
                              <strong>{formatCurrency(doc.amount)}</strong>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="emptyCard">Nessun risultato.</div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button className="secondaryBtn backBtn" onClick={() => setSelectedDocumentId("")}>
                      Indietro
                    </button>

                    <section className="sectionCard">
                      <div className="sectionTitle">{selectedDocument.fileName}</div>
                      <div className="sectionSubtitle">Archivio digitale del documento selezionato.</div>

                      <div className="previewBox">
                        <div className="previewIcon">📄</div>
                        <div className="previewTitle">Anteprima documento</div>
                        <div className="previewText">
                          Se nel foglio Google aggiungi un vero fileUrl, qui potrai aprire il documento reale direttamente dal sito.
                        </div>

                        {selectedDocument.fileUrl ? (
                          <a
                            href={selectedDocument.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="primaryBtn"
                          >
                            Apri documento
                          </a>
                        ) : (
                          <div className="previewPlaceholder">{selectedDocument.fileName}</div>
                        )}
                      </div>
                    </section>

                    <section className="sectionCard">
                      <div className="sectionTitle">Spese collegate</div>
                      <div className="itemList">
                        {linkedExpensesForDocument.length ? (
                          linkedExpensesForDocument.map((exp) => (
                            <div key={exp.expenseId} className="itemRow">
                              <div>
                                <div className="itemTitle">{exp.description}</div>
                                <div className="itemSub">{exp.supplier || "-"} • {formatDate(exp.date)}</div>
                              </div>
                              <div className="itemValue">{formatCurrency(exp.amount)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="emptyBox">Nessuna spesa collegata.</div>
                        )}
                      </div>
                    </section>
                  </>
                )}
              </div>
            )}

            {activeView === "expenses" && (
              <div className="stack">
                <div className="pageHead">
                  <h2>Spese</h2>
                  <p>{query ? "Risultati filtrati dalla ricerca." : "Registro spese del cantiere."}</p>
                </div>

                <div className="expenseList">
                  {filteredExpenses.length ? (
                    filteredExpenses.map((item) => (
                      <div key={item.expenseId} className="expenseCard">
                        <div className="expenseTop">
                          <div>
                            <div className="itemTitle">{item.description || "-"}</div>
                            <div className="itemSub">
                              {siteJobs.find((job) => job.jobId === item.jobId)?.jobName || "-"} •{" "}
                              {formatDate(item.date)}
                            </div>
                          </div>
                          <div className="expenseTotal">{formatCurrency(item.amount)}</div>
                        </div>

                        <div className="expenseGrid">
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
                    <div className="emptyCard">Nessun risultato.</div>
                  )}
                </div>
              </div>
            )}
          </main>

          <nav className="mobileNav">
            <button className={mobileNavClass(activeView === "dashboard")} onClick={() => resetView("dashboard", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Home</button>
            <button className={mobileNavClass(activeView === "jobs")} onClick={() => resetView("jobs", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Lavori</button>
            <button className={mobileNavClass(activeView === "documents")} onClick={() => resetView("documents", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Documenti</button>
            <button className={mobileNavClass(activeView === "expenses")} onClick={() => resetView("expenses", setActiveView, setSelectedJobId, setSelectedDocumentId)}>Spese</button>
          </nav>
        </div>
      </div>
    </>
  );
}

function InfoCard({ label, value, dark = false }) {
  return (
    <div className={`infoCard ${dark ? "infoCardDark" : ""}`}>
      <div className="infoLabel">{label}</div>
      <div className="infoValue">{value}</div>
    </div>
  );
}

function desktopNavClass(active) {
  return active ? "desktopNav desktopNavActive" : "desktopNav";
}

function mobileNavClass(active) {
  return active ? "mobileNavBtn mobileNavBtnActive" : "mobileNavBtn";
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

function resetView(view, setActiveView, setSelectedJobId, setSelectedDocumentId) {
  setSelectedJobId("");
  setSelectedDocumentId("");
  setActiveView(view);
}

const styles = `
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:#f4f7fb;color:#0f172a}
button,input,select,a{font:inherit}
button{cursor:pointer}

/* login */
.loginWrap{min-height:100vh;display:grid;place-items:center;padding:20px;background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%)}
.loginCard{width:min(100%,420px);background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:22px;box-shadow:0 18px 40px rgba(15,23,42,.08)}
.badge{display:inline-block;background:#eef2ff;color:#1e293b;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:600}
.loginTitle{margin:16px 0 8px;font-size:28px;line-height:1.08;letter-spacing:-.03em;font-weight:700}
.loginText{margin:0 0 18px;color:#475569;line-height:1.55;font-size:15px}
.field{display:grid;gap:8px}
.field label{font-size:13px;font-weight:600;color:#334155}
.field input{width:100%;border:1px solid #cbd5e1;background:#f8fafc;border-radius:14px;padding:14px 16px;outline:none}
.primaryBtn,.secondaryBtn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;padding:12px 14px;font-weight:600;text-decoration:none}
.primaryBtn{background:#0f172a;color:#fff;border:0}
.secondaryBtn{background:#fff;color:#0f172a;border:1px solid #cbd5e1}
.full{width:100%}
.loadingCard{margin-top:14px;display:flex;align-items:center;gap:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:16px}
.spinner{width:22px;height:22px;border:3px solid #cbd5e1;border-top-color:#0f172a;border-radius:999px;animation:spin .8s linear infinite}
.loadingTitle{font-size:14px;font-weight:700;color:#0f172a}
.loadingText{font-size:13px;color:#64748b;line-height:1.35;margin-top:2px}
.noteBox{margin-top:14px;background:#f8fafc;border:1px solid #e2e8f0;padding:12px 14px;border-radius:14px;font-size:13px;color:#475569;line-height:1.45}
@keyframes spin{to{transform:rotate(360deg)}}
.center{min-height:100vh;display:grid;place-items:center}

/* layout mobile first */
.layout{min-height:100vh;display:flex;flex-direction:column}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.page{padding:12px 12px 92px}
.stack{display:grid;gap:14px}
.mobileOnly{display:block}
.desktopOnly{display:none}

/* top mobile */
.mobileHeader{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-bottom:1px solid #e2e8f0;padding:14px 14px 12px}
.topLine{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#64748b;font-weight:600}
.siteName{margin-top:4px;font-size:18px;font-weight:700;letter-spacing:-.02em}
.siteInfo{margin-top:4px;font-size:13px;color:#475569;line-height:1.4}
.updateInfo{margin-top:6px;font-size:12px;color:#64748b}
.mobileSearch{padding:10px 12px 0}
.mobileSearch input{width:100%;border:1px solid #cbd5e1;background:#fff;outline:none;padding:13px 14px;border-radius:14px;box-shadow:0 2px 8px rgba(15,23,42,.03)}

/* hero */
.heroCard{background:linear-gradient(135deg,#0f172a 0%,#172554 100%);color:#fff;border-radius:22px;padding:18px;box-shadow:0 8px 24px rgba(15,23,42,.08)}
.heroTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.heroCard h1{margin:8px 0 0;font-size:25px;line-height:1.05;letter-spacing:-.03em}
.heroText{margin-top:8px;color:#dbeafe;font-size:14px;line-height:1.45}
.heroDocs{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12);padding:8px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.smallLabel{font-size:10px;text-transform:uppercase;letter-spacing:.16em;font-weight:600}
.light{color:#cbd5e1}

/* stats */
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.infoCard{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:12px}
.infoCardDark{background:#0f172a;border-color:#0f172a;color:#fff}
.infoLabel{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:#64748b;font-weight:600}
.infoCardDark .infoLabel{color:#94a3b8}
.infoValue{margin-top:7px;font-size:18px;font-weight:700;line-height:1.05;letter-spacing:-.02em}

/* generic sections */
.sectionCard,.listCard{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:14px;box-shadow:0 6px 18px rgba(15,23,42,.04)}
.sectionTitle,.listTitle{font-size:16px;font-weight:700;line-height:1.18;letter-spacing:-.02em}
.sectionSubtitle,.listSub{margin-top:5px;color:#64748b;font-size:13px;line-height:1.45}
.itemList{display:grid;gap:10px;margin-top:14px}
.itemRow{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:16px;padding:12px 13px}
.clickRow{border:0;width:100%;text-align:left}
.itemTitle{font-size:14px;font-weight:600;line-height:1.35}
.itemSub{margin-top:4px;font-size:13px;color:#64748b;line-height:1.35}
.itemValue{white-space:nowrap;font-size:14px;font-weight:600}
.emptyBox,.emptyCard{background:#fff;border:1px dashed #cbd5e1;border-radius:18px;padding:16px;color:#64748b;font-size:13px}
.pageHead h2{margin:0;font-size:24px;line-height:1.08;letter-spacing:-.03em}
.pageHead p{margin:8px 0 0;color:#64748b;font-size:14px;line-height:1.45}
.cardGrid{display:grid;gap:12px}

/* list cards */
.listHead,.docMeta{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.statusPill{background:#dcfce7;color:#166534;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:600}
.miniStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
.miniStats>div{background:#f8fafc;border-radius:16px;padding:10px}
.miniStats span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#64748b;font-weight:600}
.miniStats strong{display:block;margin-top:6px;font-size:14px;font-weight:700}
.buttonCard{border:0;text-align:left}

/* preview */
.previewBox{margin-top:14px;border:1px dashed #cbd5e1;background:#f8fafc;border-radius:20px;padding:26px 16px;text-align:center}
.previewIcon{font-size:42px}
.previewTitle{margin-top:12px;font-size:18px;font-weight:700}
.previewText{margin:8px auto 0;max-width:460px;color:#64748b;line-height:1.5;font-size:14px}
.previewPlaceholder{margin-top:16px;display:inline-flex;padding:12px 16px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;font-size:14px;font-weight:600;word-break:break-word}

/* expenses mobile */
.expenseList{display:grid;gap:12px}
.expenseCard{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:14px;box-shadow:0 6px 18px rgba(15,23,42,.04)}
.expenseTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.expenseTotal{white-space:nowrap;font-size:15px;font-weight:700}
.expenseGrid{margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.expenseGrid span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:600}
.expenseGrid strong{display:block;margin-top:4px;font-size:13px;line-height:1.35;font-weight:600;color:#0f172a}

/* mobile nav */
.mobileNav{position:sticky;bottom:0;z-index:30;background:rgba(255,255,255,.98);backdrop-filter:blur(8px);border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:8px 10px env(safe-area-inset-bottom,10px)}
.mobileNavBtn{border:0;background:transparent;border-radius:14px;padding:8px 6px;color:#64748b;font-size:10px;font-weight:600}
.mobileNavBtnActive{background:#0f172a;color:#fff}
.backBtn{width:fit-content}

/* desktop */
.sidebar{width:290px;padding:18px;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;gap:18px}
.sideCard{background:linear-gradient(135deg,#0f172a 0%,#172554 100%);color:#fff;border-radius:22px;padding:18px}
.sideOverline{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#94a3b8}
.sideTitle{font-size:20px;line-height:1.1;font-weight:700;margin-top:10px;letter-spacing:-.02em}
.sideText{margin-top:10px;color:#cbd5e1;line-height:1.5;font-size:13px}
.sideBlock{display:grid;gap:8px}
.sideLabel{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#64748b;font-weight:600}
.input{width:100%;border:1px solid #cbd5e1;background:#f8fafc;outline:none;padding:13px 14px;border-radius:14px}
.sideNav{display:grid;gap:6px}
.desktopNav{border:0;background:transparent;border-radius:14px;padding:13px 14px;text-align:left;font-weight:600;color:#475569}
.desktopNavActive{background:#0f172a;color:#fff}
.searchBar input{width:100%;border:1px solid #cbd5e1;background:#fff;outline:none;padding:13px 14px;border-radius:14px}
.topbarRight .searchBar{min-width:320px}

@media (max-width:420px){
  .stats{grid-template-columns:1fr}
  .expenseGrid{grid-template-columns:1fr}
  .siteName{font-size:16px}
}

@media (min-width:901px){
  .layout{flex-direction:row}
  .desktopOnly{display:block}
  .mobileOnly{display:none}
  .page{padding:24px}
  .stack{gap:24px}
  .mobileHeader{display:none}
  .mobileSearch{display:none}
  .stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
  .cardGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  .mobileNav{display:none}
  .main{display:flex;flex-direction:column}
  .expenseList{display:none}
  .heroCard{padding:26px}
}
@media (min-width:1180px){
  .stats{grid-template-columns:repeat(6,minmax(0,1fr))}
  .cardGrid{grid-template-columns:repeat(3,minmax(0,1fr))}
}
`;
