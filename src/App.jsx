import { useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbznT45oMXeEA968iARFhdUWIEpit17cd2EF_I2gORicQzNt6DGKm_Wa_kJqFEbWATR1/exec";

export default function App() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [data, setData] = useState(null);

  const [activeSiteId, setActiveSiteId] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

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
      const firstSiteId =
        payload?.sites?.[0]?.id || payload?.sites?.[0]?.siteId || "";

      setLogged(true);
      setData(payload);
      setActiveSiteId(firstSiteId);
      setActiveTab("dashboard");
      setSelectedJobId("");
      setSelectedDocumentId("");
      setSearch("");
    } catch (error) {
      console.error(error);
      setAuthError("Errore di collegamento con Apps Script");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setPassword("");
    setLogged(false);
    setAuthError("");
    setData(null);
    setActiveSiteId("");
    setActiveTab("dashboard");
    setSelectedJobId("");
    setSelectedDocumentId("");
    setSearch("");
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
    () => expenses.filter((expense) => expense.siteId === currentSiteId),
    [expenses, currentSiteId]
  );

  const query = search.trim().toLowerCase();

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

  const filteredJobs = useMemo(() => {
    if (!query) return siteJobs;
    return siteJobs.filter((job) =>
      [job.jobName, job.type, job.externalCompany, job.note]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [siteJobs, query]);

  const computedTotals = useMemo(() => {
    return {
      total: siteExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0),
      imponibile: siteExpenses.reduce((sum, item) => sum + toNumber(item.imponibile), 0),
      iva: siteExpenses.reduce((sum, item) => sum + toNumber(item.vat), 0),
      documenti: siteDocuments.length,
      lavori: siteJobs.length,
    };
  }, [siteExpenses, siteDocuments.length, siteJobs.length]);

  const siteTotals = useMemo(() => {
    return extractSiteTotals(data, activeSite, computedTotals);
  }, [data, activeSite, computedTotals]);

  const jobsWithStats = useMemo(() => {
    return filteredJobs.map((job) => {
      const relatedExpenses = siteExpenses.filter((expense) => expense.jobId === job.jobId);
      const relatedDocuments = siteDocuments.filter((doc) => doc.jobId === job.jobId);

      return {
        ...job,
        total: relatedExpenses.reduce((sum, item) => sum + toNumber(item.amount), 0),
        imponibile: relatedExpenses.reduce((sum, item) => sum + toNumber(item.imponibile), 0),
        iva: relatedExpenses.reduce((sum, item) => sum + toNumber(item.vat), 0),
        expenseCount: relatedExpenses.length,
        documentCount: relatedDocuments.length,
      };
    });
  }, [filteredJobs, siteExpenses, siteDocuments]);

  const selectedJob =
    siteJobs.find((job) => job.jobId === selectedJobId) || null;
  const selectedDocument =
    siteDocuments.find((doc) => doc.documentId === selectedDocumentId) || null;

  const selectedJobExpenses = useMemo(() => {
    if (!selectedJob) return [];
    return siteExpenses.filter((expense) => expense.jobId === selectedJob.jobId);
  }, [selectedJob, siteExpenses]);

  const selectedJobDocuments = useMemo(() => {
    if (!selectedJob) return [];
    return siteDocuments.filter((doc) => doc.jobId === selectedJob.jobId);
  }, [selectedJob, siteDocuments]);

  const selectedDocumentExpenses = useMemo(() => {
    if (!selectedDocument) return [];
    return siteExpenses.filter((expense) => expense.documentId === selectedDocument.documentId);
  }, [selectedDocument, siteExpenses]);

  const recentDocuments = [...filteredDocuments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const dashboardJobs = jobsWithStats.slice(0, 4);

  if (!logged) {
    return (
      <>
        <style>{styles}</style>
        <div className="loginShell">
          <div className="loginCard">
            <div className="loginBadge">Europa Service</div>
            <h1 className="loginTitle">Accesso contabilità</h1>
            <p className="loginText">
              Il sito è pronto a leggere i totali del master direttamente dall'API.
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

            {authError ? <div className="errorBox">{authError}</div> : null}
          </div>
        </div>
      </>
    );
  }

  if (!data || !activeSite) {
    return (
      <>
        <style>{styles}</style>
        <div className="centerShell">Caricamento dati...</div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="appShell">
        <header className="header">
          <div className="headerTop">
            <div>
              <div className="eyebrow">Portale protetto</div>
              <div className="siteTitle">{activeSite.name || activeSite.siteName}</div>
              <div className="siteMeta">
                {(activeSite.client || "-") + " • " + (activeSite.city || "-") + " • " + (activeSite.status || "-")}
              </div>
            </div>
            <button className="ghostBtn" onClick={logout}>Esci</button>
          </div>

          <div className="headerControls">
            <select
              className="siteSelect"
              value={currentSiteId}
              onChange={(e) => {
                setActiveSiteId(e.target.value);
                setActiveTab("dashboard");
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

        <main className="content">
          {activeTab === "dashboard" && (
            <div className="stack">
              <section className="heroCard">
                <div className="heroLabel">Contabilità cantiere</div>
                <div className="heroTitle">Dashboard master</div>
                <div className="heroText">
                  Qui i totali vengono letti dal master se l'API li invia. Fonte attuale: <strong>{siteTotals.sourceLabel}</strong>.
                </div>
              </section>

              <section className="statsGrid">
                <StatBox label="Spese totali" value={currency(siteTotals.total)} dark />
                <StatBox label="Imponibile" value={currency(siteTotals.imponibile)} />
                <StatBox label="IVA" value={currency(siteTotals.iva)} />
                <StatBox label="Documenti" value={String(siteTotals.documenti)} />
              </section>

              <section className="cardSection">
                <div className="sectionHeader">
                  <div>
                    <div className="sectionTitle">Lavorazioni</div>
                    <div className="sectionSub">Panoramica rapida delle lavorazioni del cantiere.</div>
                  </div>
                  <button className="linkBtn" onClick={() => setActiveTab("jobs")}>Vedi tutte</button>
                </div>

                <div className="listWrap">
                  {dashboardJobs.length ? (
                    dashboardJobs.map((job) => (
                      <button
                        key={job.jobId}
                        className="rowCard clickable"
                        onClick={() => {
                          setSelectedJobId(job.jobId);
                          setActiveTab("jobs");
                        }}
                      >
                        <div className="rowMain">
                          <div className="rowTitle">{job.jobName}</div>
                          <div className="rowSub">{job.externalCompany || "Lavorazione interna"}</div>
                        </div>
                        <div className="rowAmount">{currency(job.total)}</div>
                      </button>
                    ))
                  ) : (
                    <EmptyBox text="Nessun risultato." />
                  )}
                </div>
              </section>

              <section className="cardSection">
                <div className="sectionHeader">
                  <div>
                    <div className="sectionTitle">Ultimi documenti</div>
                    <div className="sectionSub">Documenti più recenti del cantiere.</div>
                  </div>
                  <button className="linkBtn" onClick={() => setActiveTab("documents")}>Vedi tutti</button>
                </div>

                <div className="listWrap">
                  {recentDocuments.length ? (
                    recentDocuments.map((doc) => (
                      <button
                        key={doc.documentId}
                        className="rowCard clickable"
                        onClick={() => {
                          setSelectedDocumentId(doc.documentId);
                          setActiveTab("documents");
                        }}
                      >
                        <div className="rowMain">
                          <div className="rowTitle clamp2">{doc.fileName || "Documento"}</div>
                          <div className="rowSub">{(doc.supplier || "-") + " • " + formatDate(doc.date)}</div>
                        </div>
                        <div className="rowAmount">{currency(doc.amount)}</div>
                      </button>
                    ))
                  ) : (
                    <EmptyBox text="Nessun risultato." />
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="stack">
              <SectionTitle
                title="Spese"
                subtitle={query ? "Risultati filtrati dalla ricerca." : "Registro spese del cantiere."}
              />

              {filteredExpenses.length ? (
                filteredExpenses.map((item) => {
                  const relatedJob = jobMapFromJobs(siteJobs).get(item.jobId);
                  return (
                    <ExpenseItemCard
                      key={item.expenseId}
                      item={item}
                      relatedJob={relatedJob}
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
                  <SectionTitle
                    title="Documenti"
                    subtitle={query ? "Risultati filtrati dalla ricerca." : "Archivio digitale del cantiere."}
                  />

                  {filteredDocuments.length ? (
                    filteredDocuments.map((doc) => (
                      <button
                        key={doc.documentId}
                        className="listBlock clickable"
                        onClick={() => setSelectedDocumentId(doc.documentId)}
                      >
                        <div className="listBlockTitle clamp2">{doc.fileName || "Documento"}</div>
                        <div className="listBlockSub">
                          {(doc.supplier || "-") + " • " + (doc.type || "-") + " • " + (doc.documentNumber || "-")}
                        </div>
                        <div className="listBlockFoot">
                          <span>{formatDate(doc.date)}</span>
                          <strong>{currency(doc.amount)}</strong>
                        </div>
                      </button>
                    ))
                  ) : (
                    <EmptyCard text="Nessun risultato." />
                  )}
                </>
              ) : (
                <>
                  <button className="secondaryBtn backBtn" onClick={() => setSelectedDocumentId("")}>Indietro</button>

                  <section className="cardSection">
                    <div className="sectionTitle clamp2">{selectedDocument.fileName || "Documento"}</div>
                    <div className="sectionSub">Dettaglio documento selezionato.</div>

                    <div className="infoGrid">
                      <InfoCell label="Data" value={formatDate(selectedDocument.date)} />
                      <InfoCell label="Importo" value={currency(selectedDocument.amount)} />
                      <InfoCell label="Fornitore" value={selectedDocument.supplier || "-"} />
                      <InfoCell label="Tipo" value={selectedDocument.type || "-"} />
                      <InfoCell label="Numero" value={selectedDocument.documentNumber || "-"} />
                      <InfoCell label="Cartella" value={selectedDocument.folder || "-"} />
                    </div>

                    {selectedDocument.fileUrl ? (
                      <a className="primaryBtn fileBtn" href={selectedDocument.fileUrl} target="_blank" rel="noreferrer">
                        Apri documento
                      </a>
                    ) : null}
                  </section>

                  <section className="cardSection">
                    <div className="sectionTitle">Spese collegate</div>
                    <div className="listWrap">
                      {selectedDocumentExpenses.length ? (
                        selectedDocumentExpenses.map((item) => (
                          <div key={item.expenseId} className="rowCard">
                            <div className="rowMain">
                              <div className="rowTitle">{item.description || "-"}</div>
                              <div className="rowSub">{(item.supplier || "-") + " • " + formatDate(item.date)}</div>
                            </div>
                            <div className="rowAmount">{currency(item.amount)}</div>
                          </div>
                        ))
                      ) : (
                        <EmptyBox text="Nessuna spesa collegata." />
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="stack">
              {!selectedJob ? (
                <>
                  <SectionTitle
                    title="Lavorazioni"
                    subtitle={query ? "Risultati filtrati dalla ricerca." : "Vista completa delle lavorazioni del cantiere."}
                  />

                  {jobsWithStats.length ? (
                    jobsWithStats.map((job) => (
                      <button
                        key={job.jobId}
                        className="listBlock clickable"
                        onClick={() => setSelectedJobId(job.jobId)}
                      >
                        <div className="listBlockTitle">{job.jobName}</div>
                        <div className="listBlockSub">{job.externalCompany || "Lavorazione interna"}</div>

                        <div className="metricGrid">
                          <InfoCell label="Totale" value={currency(job.total)} />
                          <InfoCell label="Imponibile" value={currency(job.imponibile)} />
                          <InfoCell label="IVA" value={currency(job.iva)} />
                          <InfoCell label="Documenti" value={String(job.documentCount)} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <EmptyCard text="Nessun risultato." />
                  )}
                </>
              ) : (
                <>
                  <button className="secondaryBtn backBtn" onClick={() => setSelectedJobId("")}>Indietro</button>

                  <SectionTitle
                    title={selectedJob.jobName}
                    subtitle={selectedJob.externalCompany || "Lavorazione interna"}
                  />

                  <section className="cardSection">
                    <div className="sectionTitle">Documenti collegati</div>
                    <div className="listWrap">
                      {selectedJobDocuments.length ? (
                        selectedJobDocuments.map((doc) => (
                          <button
                            key={doc.documentId}
                            className="rowCard clickable"
                            onClick={() => {
                              setSelectedDocumentId(doc.documentId);
                              setActiveTab("documents");
                            }}
                          >
                            <div className="rowMain">
                              <div className="rowTitle clamp2">{doc.fileName || "Documento"}</div>
                              <div className="rowSub">{(doc.type || "-") + " • " + (doc.supplier || "-")}</div>
                            </div>
                            <div className="rowAmount">{currency(doc.amount)}</div>
                          </button>
                        ))
                      ) : (
                        <EmptyBox text="Nessun documento collegato." />
                      )}
                    </div>
                  </section>

                  <section className="cardSection">
                    <div className="sectionTitle">Spese collegate</div>
                    <div className="listWrap">
                      {selectedJobExpenses.length ? (
                        selectedJobExpenses.map((item) => (
                          <div key={item.expenseId} className="rowCard">
                            <div className="rowMain">
                              <div className="rowTitle">{item.description || "-"}</div>
                              <div className="rowSub">{(item.supplier || "-") + " • " + formatDate(item.date)}</div>
                            </div>
                            <div className="rowAmount">{currency(item.amount)}</div>
                          </div>
                        ))
                      ) : (
                        <EmptyBox text="Nessuna spesa collegata." />
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </main>

        <nav className="mobileNav">
          <button className={navClass(activeTab === "dashboard")} onClick={() => goTab(setActiveTab, setSelectedJobId, setSelectedDocumentId, "dashboard")}>
            Home
          </button>
          <button className={navClass(activeTab === "expenses")} onClick={() => goTab(setActiveTab, setSelectedJobId, setSelectedDocumentId, "expenses")}>
            Spese
          </button>
          <button className={navClass(activeTab === "documents")} onClick={() => goTab(setActiveTab, setSelectedJobId, setSelectedDocumentId, "documents")}>
            Documenti
          </button>
          <button className={navClass(activeTab === "jobs")} onClick={() => goTab(setActiveTab, setSelectedJobId, setSelectedDocumentId, "jobs")}>
            Lavori
          </button>
        </nav>
      </div>
    </>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="pageHead">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function StatBox({ label, value, dark = false }) {
  return (
    <div className={dark ? "statCard statCardDark" : "statCard"}>
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="infoCell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyBox({ text }) {
  return <div className="emptyBox">{text}</div>;
}

function EmptyCard({ text }) {
  return <div className="emptyCard">{text}</div>;
}

function ExpenseItemCard({ item, relatedJob }) {
  return (
    <section className="expenseCard">
      <div className="expenseTop">
        <div className="rowMain">
          <div className="rowTitle">{item.description || "-"}</div>
          <div className="rowSub">
            {((relatedJob && relatedJob.jobName) || item.category || "-") + " • " + formatDate(item.date)}
          </div>
        </div>
        <div className="expenseTotal">{currency(item.amount)}</div>
      </div>

      <div className="expenseGrid">
        <InfoCell label="Fornitore" value={item.supplier || "-"} />
        <InfoCell label="Tipo" value={item.documentType || "-"} />
        <InfoCell label="Pagamento" value={item.paymentMethod || "-"} />
        <InfoCell label="Imponibile" value={currency(item.imponibile)} />
        <InfoCell label="IVA" value={currency(item.vat)} />
        <InfoCell label="Numero doc" value={item.documentNumber || "-"} />
      </div>
    </section>
  );
}

function goTab(setActiveTab, setSelectedJobId, setSelectedDocumentId, tab) {
  setSelectedJobId("");
  setSelectedDocumentId("");
  setActiveTab(tab);
}

function navClass(active) {
  return active ? "mobileNavBtn mobileNavBtnActive" : "mobileNavBtn";
}

function extractSiteTotals(payload, activeSite, computedTotals) {
  const siteId = activeSite?.id || activeSite?.siteId || "";
  const siteName = activeSite?.name || activeSite?.siteName || "";

  const candidates = [
    activeSite?.masterTotals,
    activeSite?.totals,
    activeSite?.summary,
    activeSite?.summaryTotals,
    payload?.masterTotals,
    payload?.totals,
    payload?.summary,
    payload?.siteSummary,
    payload?.siteTotals,
    getMappedSummary(payload?.masterTotalsBySite, siteId, siteName),
    getMappedSummary(payload?.siteSummaries, siteId, siteName),
    getMappedSummary(payload?.summariesBySite, siteId, siteName),
  ].filter(Boolean);

  for (const source of candidates) {
    const total = pickNumber(source, [
      "total",
      "totale",
      "totalSpese",
      "speseTotali",
      "amountTotal",
      "grandTotal",
    ]);
    const imponibile = pickNumber(source, [
      "imponibile",
      "totaleImponibile",
      "totalImponibile",
      "taxableTotal",
    ]);
    const iva = pickNumber(source, [
      "iva",
      "vat",
      "totaleIva",
      "totalIva",
      "vatTotal",
    ]);
    const documenti = pickNumber(source, [
      "documenti",
      "documents",
      "documentCount",
      "totalDocuments",
    ]);

    const hasAtLeastOneMasterValue = [total, imponibile, iva, documenti].some((v) => v !== undefined);
    if (hasAtLeastOneMasterValue) {
      return {
        total: total !== undefined ? total : computedTotals.total,
        imponibile: imponibile !== undefined ? imponibile : computedTotals.imponibile,
        iva: iva !== undefined ? iva : computedTotals.iva,
        documenti: documenti !== undefined ? documenti : computedTotals.documenti,
        lavori: computedTotals.lavori,
        source: "master",
        sourceLabel: "Master/API",
      };
    }
  }

  return {
    total: computedTotals.total,
    imponibile: computedTotals.imponibile,
    iva: computedTotals.iva,
    documenti: computedTotals.documenti,
    lavori: computedTotals.lavori,
    source: "calculated",
    sourceLabel: "Calcolato dal sito",
  };
}

function getMappedSummary(container, siteId, siteName) {
  if (!container || typeof container !== "object") return null;
  return container[siteId] || container[siteName] || null;
}

function pickNumber(source, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const raw = source[key];
      if (raw === null || raw === undefined || raw === "") return 0;
      const parsed = toNumber(raw);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return undefined;
}

function jobMapFromJobs(jobs) {
  const map = new Map();
  jobs.forEach((job) => map.set(job.jobId, job));
  return map;
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^\d.-]/g, "");
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

const styles = `
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:Inter,Arial,sans-serif;background:#f3f5f9;color:#0f172a}
button,input,select,a{font:inherit}
button{cursor:pointer}
a{text-decoration:none}
.loginShell{min-height:100vh;display:grid;place-items:center;padding:20px;background:linear-gradient(180deg,#eef2ff 0%,#f8fafc 100%)}
.loginCard{width:min(100%,420px);background:#fff;border:1px solid #e2e8f0;border-radius:24px;padding:22px;box-shadow:0 18px 40px rgba(15,23,42,.08)}
.loginBadge{display:inline-block;background:#eef2ff;color:#1e293b;border-radius:999px;padding:8px 12px;font-size:12px;font-weight:700}
.loginTitle{margin:16px 0 8px;font-size:30px;line-height:1.08;letter-spacing:-.03em;font-weight:700}
.loginText{margin:0 0 18px;color:#475569;line-height:1.55;font-size:15px}.field{display:grid;gap:8px}.field label{font-size:13px;font-weight:700;color:#334155}.field input{width:100%;border:1px solid #cbd5e1;background:#f8fafc;border-radius:14px;padding:14px 16px;outline:none;font-size:16px}.primaryBtn,.secondaryBtn,.ghostBtn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;padding:12px 14px;font-weight:700;text-decoration:none}.primaryBtn{background:#0f172a;color:#fff;border:0}.secondaryBtn{background:#fff;color:#0f172a;border:1px solid #cbd5e1}.ghostBtn{background:#fff;color:#0f172a;border:1px solid #cbd5e1}.full{width:100%}.errorBox{margin-top:14px;background:#fef2f2;border:1px solid #fecaca;padding:12px 14px;border-radius:14px;font-size:13px;color:#b91c1c}.centerShell{min-height:100vh;display:grid;place-items:center;font-size:18px}.appShell{min-height:100vh;max-width:540px;margin:0 auto;background:#f3f5f9;padding-bottom:90px}.header{padding:14px}.headerTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#64748b;font-weight:700}.siteTitle{margin-top:5px;font-size:24px;font-weight:700;letter-spacing:-.03em;line-height:1.04}.siteMeta{margin-top:6px;font-size:14px;color:#475569;line-height:1.45}.headerControls{margin-top:12px;display:grid;gap:8px}.siteSelect{width:100%;border:1px solid #cbd5e1;background:#fff;border-radius:16px;padding:14px 15px;outline:none;font-size:16px}.updatedAt{font-size:12px;color:#64748b}.searchWrap{padding:0 14px}.searchWrap input{width:100%;border:1px solid #cbd5e1;background:#fff;border-radius:16px;padding:14px 15px;outline:none;font-size:16px}.content{padding:14px}.stack{display:grid;gap:14px}.heroCard{background:linear-gradient(135deg,#0f172a 0%,#172554 100%);color:#fff;border-radius:24px;padding:18px}.heroLabel{font-size:10px;text-transform:uppercase;letter-spacing:.16em;color:#cbd5e1;font-weight:700}.heroTitle{margin-top:10px;font-size:28px;line-height:1.05;font-weight:700;letter-spacing:-.04em}.heroText{margin-top:10px;color:#dbeafe;font-size:15px;line-height:1.5}.statsGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.statCard{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:16px;min-height:102px}.statCardDark{background:#0f172a;border-color:#0f172a;color:#fff}.statLabel{font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:#64748b;font-weight:700}.statCardDark .statLabel{color:#94a3b8}.statValue{margin-top:10px;font-size:24px;font-weight:700;line-height:1.05;letter-spacing:-.03em}.pageHead h2{margin:0;font-size:28px;line-height:1.06;letter-spacing:-.03em}.pageHead p{margin:8px 0 0;font-size:15px;color:#64748b;line-height:1.5}.cardSection,.listBlock,.expenseCard{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:16px;box-shadow:0 6px 18px rgba(15,23,42,.04)}.sectionHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.sectionTitle,.listBlockTitle{font-size:18px;font-weight:700;line-height:1.15}.sectionSub,.listBlockSub{margin-top:6px;font-size:14px;color:#64748b;line-height:1.45}.linkBtn{border:0;background:transparent;color:#2563eb;font-weight:700;padding:0}.listWrap{display:grid;gap:12px;margin-top:16px}.rowCard{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;background:#f8fafc;border-radius:18px;padding:14px}.rowMain{min-width:0;flex:1}.rowTitle{font-size:16px;font-weight:700;line-height:1.32}.rowSub{margin-top:5px;font-size:14px;color:#64748b;line-height:1.4}.rowAmount{white-space:nowrap;font-size:15px;font-weight:700;color:#2563eb}.clickable{cursor:pointer;border:0;width:100%;text-align:left}.clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.listBlockFoot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px;font-size:14px;color:#64748b}.listBlockFoot strong{color:#0f172a;font-size:16px}.metricGrid,.expenseGrid,.infoGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.infoCell{background:#f8fafc;border-radius:16px;padding:12px}.infoCell span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700}.infoCell strong{display:block;margin-top:6px;font-size:15px;line-height:1.35;font-weight:700;color:#0f172a}.fileBtn{margin-top:14px;width:100%}.emptyBox,.emptyCard{border:1px dashed #cbd5e1;border-radius:18px;padding:16px;background:#fff;color:#64748b;font-size:14px}.backBtn{width:fit-content}.expenseTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.expenseTotal{white-space:nowrap;font-size:18px;font-weight:700;color:#0f172a}.mobileNav{position:fixed;left:0;right:0;bottom:0;max-width:540px;margin:0 auto;background:rgba(255,255,255,.98);backdrop-filter:blur(8px);border-top:1px solid #e2e8f0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:10px 10px calc(10px + env(safe-area-inset-bottom,0px))}.mobileNavBtn{border:0;background:transparent;border-radius:16px;padding:10px 8px;color:#64748b;font-size:12px;font-weight:700}.mobileNavBtnActive{background:#0f172a;color:#fff}@media (max-width:420px){.statsGrid{grid-template-columns:1fr}.metricGrid,.expenseGrid,.infoGrid{grid-template-columns:1fr}.siteTitle{font-size:22px}.heroTitle{font-size:26px}.statValue{font-size:22px}}
`;
