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
    setSearch("");
    setActiveView("dashboard");
    setActiveSiteId("");
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
    .slice(0, 3);

  const quickJobs = enrichedJobs.slice(0, 4);

  if (!logged) {
    return (
      <>
        <style>{styles}</style>
        <div className="loginWrap">
          <div className="loginCard">
            <div className="badge">Europa Service</div>
            <h1 className="loginTitle">Accesso contabilità</h1>
            <p className="loginText">
              Versione ottimizzata per telefono. Legge i dati dal Google Sheets master.
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
                  <div className="loadingText">Sto leggendo i dati dal master.</div>
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

      <div className="app">
        <header className="header">
          <div className="headerTop">
            <div>
              <div className="eyebrow">Portale protetto</div>
              <div className="siteTitle">{activeSite.name || activeSite.siteName}</div>
              <div className="siteMeta">
                {activeSite.client || "-"} • {activeSite.city || "-"} • {activeSite.status || "-"}
              </div>
            </div>
            <button className="ghostBtn" onClick={logout}>
              Esci
            </button>
          </div>

          <div className="headerBottom">
            <select
              className="siteSelect"
              value={currentSiteId}
              onChange={(e) => {
                setActiveSiteId(e.target.value);
                setSelectedJobId("");
                setSelectedDocumentId("");
                setActiveView("dashboard");
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

            <div className="updatedAt">
              Aggiornato: {generatedAt ? formatDateTime(generatedAt) : "-"}
            </div>
          </div>
        </header>

        <div className="searchWrap">
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
                <div className="heroLabel">Cantiere attivo</div>
                <div className="heroName">{activeSite.name || activeSite.siteName}</div>
                <div className="heroSub">
                  Cliente: {activeSite.client || "-"} • Stato: {activeSite.status || "-"}
                </div>
              </section>

              <section className="stats">
                <InfoCard label="Spese totali" value={formatCurrency(totals.total)} dark />
                <InfoCard label="Documenti" value={String(totals.docs)} />
                <InfoCard label="Imponibile" value={formatCurrency(totals.imponibile)} />
                <InfoCard label="IVA" value={formatCurrency(totals.iva)} />
              </section>

              <section className="sectionCard">
                <div className="sectionHead">
                  <div>
                    <div className="sectionTitle">Lavorazioni</div>
                    <div className="sectionSub">
                      {query ? "Risultati filtrati." : "Le principali lavorazioni del cantiere."}
                    </div>
                  </div>
                  <button className="linkBtn" onClick={() => setActiveView("jobs")}>
                    Vedi tutte
                  </button>
                </div>

                <div className="list">
                  {quickJobs.length ? (
                    quickJobs.map((job) => (
                      <button
                        key={job.jobId}
                        className="rowButton"
                        onClick={() => {
                          setSelectedJobId(job.jobId);
                          setSelectedDocumentId("");
                          setActiveView("jobs");
                        }}
                      >
                        <div className="rowMain">
                          <div className="rowTitle">{job.jobName}</div>
                          <div className="rowSub">
                            {job.externalCompany || "Lavorazione interna"} • {job.documentCount} documenti
                          </div>
                        </div>
                        <div className="rowValue">{formatCurrency(job.total)}</div>
                      </button>
                    ))
                  ) : (
                    <Empty text="Nessun risultato." />
                  )}
                </div>
              </section>

              <section className="sectionCard">
                <div className="sectionHead">
                  <div>
                    <div className="sectionTitle">Ultimi documenti</div>
                    <div className="sectionSub">
                      {query ? "Risultati filtrati." : "Gli ultimi documenti registrati."}
                    </div>
                  </div>
                  <button className="linkBtn" onClick={() => setActiveView("documents")}>
                    Vedi tutti
                  </button>
                </div>

                <div className="list">
                  {recentDocs.length ? (
                    recentDocs.map((doc) => (
                      <button
                        key={doc.documentId}
                        className="rowButton"
                        onClick={() => {
                          setSelectedDocumentId(doc.documentId);
                          setSelectedJobId("");
                          setActiveView("documents");
                        }}
                      >
                        <div className="rowMain">
                          <div className="rowTitle clamp2">{doc.fileName}</div>
                          <div className="rowSub">
                            {doc.supplier || "-"} • {formatDate(doc.date)}
                          </div>
                        </div>
                        <div className="rowValue">{formatCurrency(doc.amount)}</div>
                      </button>
                    ))
                  ) : (
                    <Empty text="Nessun risultato." />
                  )}
                </div>
              </section>
            </div>
          )}

          {activeView === "jobs" && (
            <div className="stack">
              {!selectedJob ? (
                <>
                  <PageHead
                    title="Lavorazioni"
                    subtitle={query ? "Risultati filtrati dalla ricerca." : "Tutte le lavorazioni del cantiere."}
                  />

                  <div className="cardList">
                    {enrichedJobs.length ? (
                      enrichedJobs.map((job) => (
                        <button
                          key={job.jobId}
                          className="infoBlockButton"
                          onClick={() => setSelectedJobId(job.jobId)}
                        >
                          <div className="infoBlockTitle">{job.jobName}</div>
                          <div className="infoBlockSub">
                            {job.externalCompany || "Lavorazione interna"}
                          </div>

                          <div className="chipGrid">
                            <MiniStat label="Totale" value={formatCurrency(job.total)} />
                            <MiniStat label="Spese" value={String(job.expenseCount)} />
                            <MiniStat label="Documenti" value={String(job.documentCount)} />
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
                  <button className="secondaryBtn backBtn" onClick={() => setSelectedJobId("")}>
                    Indietro
                  </button>

                  <PageHead
                    title={selectedJob.jobName}
                    subtitle={selectedJob.externalCompany || "Lavorazione interna"}
                  />

                  <section className="sectionCard">
                    <div className="sectionTitle">Documenti collegati</div>
                    <div className="list">
                      {documentsForSelectedJob.length ? (
                        documentsForSelectedJob.map((doc) => (
                          <button
                            key={doc.documentId}
                            className="rowButton"
                            onClick={() => {
                              setSelectedDocumentId(doc.documentId);
                              setActiveView("documents");
                            }}
                          >
                            <div className="rowMain">
                              <div className="rowTitle clamp2">{doc.fileName}</div>
                              <div className="rowSub">{doc.type || "-"} • {doc.supplier || "-"}</div>
                            </div>
                            <div className="rowValue">{formatCurrency(doc.amount)}</div>
                          </button>
                        ))
                      ) : (
                        <Empty text="Nessun documento collegato." />
                      )}
                    </div>
                  </section>

                  <section className="sectionCard">
                    <div className="sectionTitle">Spese collegate</div>
                    <div className="list">
                      {expensesForSelectedJob.length ? (
                        expensesForSelectedJob.map((exp) => (
                          <div key={exp.expenseId} className="rowStatic">
                            <div className="rowMain">
                              <div className="rowTitle">{exp.description}</div>
                              <div className="rowSub">
                                {exp.supplier || "-"} • {formatDate(exp.date)}
                              </div>
                            </div>
                            <div className="rowValue">{formatCurrency(exp.amount)}</div>
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

          {activeView === "documents" && (
            <div className="stack">
              {!selectedDocument ? (
                <>
                  <PageHead
                    title="Documenti"
                    subtitle={query ? "Risultati filtrati dalla ricerca." : "Archivio digitale del cantiere."}
                  />

                  <div className="cardList">
                    {filteredDocuments.length ? (
                      filteredDocuments.map((doc) => (
                        <button
                          key={doc.documentId}
                          className="infoBlockButton"
                          onClick={() => setSelectedDocumentId(doc.documentId)}
                        >
                          <div className="infoBlockTitle clamp2">{doc.fileName}</div>
                          <div className="infoBlockSub">
                            {doc.supplier || "-"} • {doc.type || "-"} • {doc.documentNumber || "-"}
                          </div>

                          <div className="docFoot">
                            <span>{formatDate(doc.date)}</span>
                            <strong>{formatCurrency(doc.amount)}</strong>
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
                  <button className="secondaryBtn backBtn" onClick={() => setSelectedDocumentId("")}>
                    Indietro
                  </button>

                  <section className="sectionCard">
                    <div className="sectionTitle clamp2">{selectedDocument.fileName}</div>
                    <div className="sectionSub">Archivio digitale del documento selezionato.</div>

                    <div className="previewBox">
                      <div className="previewIcon">📄</div>
                      <div className="previewTitle">Anteprima documento</div>
                      <div className="previewText">
                        Se nel foglio Google aggiungi un fileUrl reale, qui potrai aprirlo direttamente.
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
                    <div className="list">
                      {linkedExpensesForDocument.length ? (
                        linkedExpensesForDocument.map((exp) => (
                          <div key={exp.expenseId} className="rowStatic">
                            <div className="rowMain">
                              <div className="rowTitle">{exp.description}</div>
                              <div className="rowSub">
                                {exp.supplier || "-"} • {formatDate(exp.date)}
                              </div>
                            </div>
                            <div className="rowValue">{formatCurrency(exp.amount)}</div>
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

          {activeView === "expenses" && (
            <div className="stack">
              <PageHead
                title="Spese"
                subtitle={query ? "Risultati filtrati dalla ricerca." : "Registro spese del cantiere."}
              />

              <div className="expenseList">
                {filteredExpenses.length ? (
                  filteredExpenses.map((item) => (
                    <div key={item.expenseId} className="expenseCard">
                      <div className="expenseTop">
                        <div className="rowMain">
                          <div className="rowTitle">{item.description || "-"}</div>
                          <div className="rowSub">
                            {siteJobs.find((job) => job.jobId === item.jobId)?.jobName || "-"} •{" "}
                            {formatDate(item.date)}
                          </div>
                        </div>
                        <div className="expenseTotal">{formatCurrency(item.amount)}</div>
                      </div>

                      <div className="expenseGrid">
                        <FieldPair label="Fornitore" value={item.supplier || "-"} />
                        <FieldPair label="Tipo" value={item.documentType || "-"} />
                        <FieldPair label="Pagamento" value={item.paymentMethod || "-"} />
                        <FieldPair label="Imponibile" value={formatCurrency(item.imponibile)} />
                        <FieldPair label="IVA" value={formatCurrency(item.vat)} />
                        <FieldPair label="Numero doc" value={item.documentNumber || "-"} />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyCard text="Nessun risultato." />
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

function MiniStat({ label, value }) {
  return (
    <div className="miniStat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FieldPair({ label, value }) {
  return (
    <div className="fieldPair">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ text }) {
  return <div className="emptyBox">{text}</div>;
}

function EmptyCard({ text }) {
  return <div className="emptyCard">{text}</div>;
}

function PageHead({ title, subtitle }) {
  return (
    <div className="pageHead">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
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
html,body,#root{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:#f3f5f9;color:#0f172a}
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
@keyframes spin{to{transform:rotate(360deg)}}
.center{min-height:100vh;display:grid;place-items:center}

/* app */
.app{min-height:100vh;display:flex;flex-direction:column}
.header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-bottom:1px solid #e2e8f0;padding:12px}
.headerTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#64748b;font-weight:700}
.siteTitle{margin-top:4px;font-size:20px;font-weight:700;letter-spacing:-.03em;line-height:1.05}
.siteMeta{margin-top:4px;font-size:13px;color:#475569;line-height:1.4}
.headerBottom{margin-top:12px;display:grid;gap:8px}
.siteSelect{width:100%;border:1px solid #cbd5e1;background:#fff;border-radius:14px;padding:12px 13px;outline:none}
.updatedAt{font-size:12px;color:#64748b}
.ghostBtn{border:1px solid #cbd5e1;background:#fff;border-radius:12px;padding:10px 12px;color:#0f172a;font-weight:600}

.searchWrap{padding:10px 12px 0}
.searchWrap input{width:100%;border:1px solid #cbd5e1;background:#fff;border-radius:14px;padding:13px 14px;outline:none;box-shadow:0 2px 8px rgba(15,23,42,.03)}

.page{padding:12px 12px 92px}
.stack{display:grid;gap:14px}

.heroCard{background:linear-gradient(135deg,#0f172a 0%,#172554 100%);color:#fff;border-radius:22px;padding:18px;box-shadow:0 8px 24px rgba(15,23,42,.08)}
.heroLabel{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#cbd5e1;font-weight:700}
.heroName{margin-top:8px;font-size:26px;line-height:1.05;font-weight:700;letter-spacing:-.03em}
.heroSub{margin-top:8px;color:#dbeafe;font-size:14px;line-height:1.45}

.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.infoCard{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:14px}
.infoCardDark{background:#0f172a;border-color:#0f172a;color:#fff}
.infoLabel{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:#64748b;font-weight:700}
.infoCardDark .infoLabel{color:#94a3b8}
.infoValue{margin-top:8px;font-size:19px;font-weight:700;line-height:1.05;letter-spacing:-.02em}

.sectionCard,.listCard,.expenseCard{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:14px;box-shadow:0 6px 18px rgba(15,23,42,.04)}
.sectionHead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.sectionTitle,.infoBlockTitle{font-size:17px;font-weight:700;line-height:1.15;letter-spacing:-.02em}
.sectionSub,.infoBlockSub{margin-top:5px;font-size:13px;color:#64748b;line-height:1.4}
.linkBtn{border:0;background:transparent;color:#2563eb;font-weight:700;padding:0}

.list{display:grid;gap:10px;margin-top:14px}
.rowButton,.rowStatic{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:16px;padding:12px 13px}
.rowButton{border:0;width:100%;text-align:left}
.rowMain{min-width:0;flex:1}
.rowTitle{font-size:14px;font-weight:600;line-height:1.35}
.rowSub{margin-top:4px;font-size:13px;color:#64748b;line-height:1.35}
.rowValue{white-space:nowrap;font-size:14px;font-weight:700;color:#2563eb}
.clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

.pageHead h2{margin:0;font-size:24px;line-height:1.08;letter-spacing:-.03em}
.pageHead p{margin:8px 0 0;font-size:14px;color:#64748b;line-height:1.45}

.cardList{display:grid;gap:12px}
.infoBlockButton{border:0;background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:14px;text-align:left;box-shadow:0 6px 18px rgba(15,23,42,.04)}
.chipGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
.miniStat{background:#f8fafc;border-radius:14px;padding:10px}
.miniStat span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#64748b;font-weight:700}
.miniStat strong{display:block;margin-top:6px;font-size:14px;font-weight:700}
.docFoot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px;font-size:13px;color:#64748b}
.docFoot strong{color:#0f172a}

.previewBox{margin-top:14px;border:1px dashed #cbd5e1;background:#f8fafc;border-radius:20px;padding:24px 14px;text-align:center}
.previewIcon{font-size:42px}
.previewTitle{margin-top:12px;font-size:18px;font-weight:700}
.previewText{margin:8px auto 0;max-width:420px;font-size:14px;line-height:1.5;color:#64748b}
.previewPlaceholder{margin-top:16px;display:inline-flex;padding:12px 16px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;font-size:14px;font-weight:600;word-break:break-word}

.expenseList{display:grid;gap:12px}
.expenseTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.expenseTotal{white-space:nowrap;font-size:15px;font-weight:700;color:#0f172a}
.expenseGrid{margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.fieldPair{background:#f8fafc;border-radius:14px;padding:10px}
.fieldPair span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700}
.fieldPair strong{display:block;margin-top:4px;font-size:13px;line-height:1.35;font-weight:600;color:#0f172a}

.emptyBox,.emptyCard{border:1px dashed #cbd5e1;border-radius:18px;padding:16px;background:#fff;color:#64748b;font-size:13px}
.backBtn{width:fit-content}

.mobileNav{position:sticky;bottom:0;z-index:30;background:rgba(255,255,255,.98);backdrop-filter:blur(8px);border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:8px 10px env(safe-area-inset-bottom,10px)}
.mobileNavBtn{border:0;background:transparent;border-radius:14px;padding:10px 6px;color:#64748b;font-size:11px;font-weight:700}
.mobileNavBtnActive{background:#0f172a;color:#fff}

@media (max-width:420px){
  .stats{grid-template-columns:1fr}
  .chipGrid{grid-template-columns:1fr}
  .expenseGrid{grid-template-columns:1fr}
  .siteTitle{font-size:18px}
  .heroName{font-size:24px}
}
`;
