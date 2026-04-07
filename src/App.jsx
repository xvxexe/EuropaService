import { useMemo, useState } from "react";
import { bossAccount, employeeAccounts } from "./data/authData";
import { site } from "./data/siteData";
import { recordsSeed } from "./data/recordsData";
import { currency, dateLabel, monthKey } from "./utils/formatters";

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs font-medium transition ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </Card>
  );
}

function ScreenTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="px-1">
      {eyebrow ? <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{eyebrow}</div> : null}
      <div className="mt-1 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}

function SectionToggle({ value, onChange, leftLabel = "Semplice", rightLabel = "Completa" }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-1 flex gap-1">
      <button
        onClick={() => onChange("simple")}
        className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium ${value === "simple" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
      >
        {leftLabel}
      </button>
      <button
        onClick={() => onChange("advanced")}
        className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium ${value === "advanced" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
      >
        {rightLabel}
      </button>
    </div>
  );
}

function HorizontalChart({ title, subtitle, data, mode = "single" }) {
  const safe = data && data.length ? data : [{ label: "Nessun dato", value: 0 }];
  const maxValue = Math.max(
    ...safe.map((item) => (mode === "double" ? Math.max(item.primary || 0, item.secondary || 0) : item.value || 0)),
    1
  );

  return (
    <Card className="p-4">
      <div className="text-sm font-semibold">{title}</div>
      {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
      <div className="mt-4 space-y-3">
        {safe.map((item) => (
          <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
              <span className="truncate">{item.label}</span>
              <span>
                {mode === "double"
                  ? `${currency(item.primary || 0)} • IVA ${currency(item.secondary || 0)}`
                  : currency(item.value || 0)}
              </span>
            </div>
            {mode === "double" ? (
              <div className="mt-3 space-y-2">
                <div>
                  <div className="mb-1 text-[10px] text-slate-400">Spesa</div>
                  <div className="h-3 rounded-full bg-white overflow-hidden border border-slate-200">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(4, ((item.primary || 0) / maxValue) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] text-slate-400">IVA</div>
                  <div className="h-3 rounded-full bg-white overflow-hidden border border-slate-200">
                    <div className="h-full rounded-full bg-slate-400" style={{ width: `${Math.max(4, ((item.secondary || 0) / maxValue) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 h-3 rounded-full bg-white overflow-hidden border border-slate-200">
                <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(4, ((item.value || 0) / maxValue) * 100)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExpenseCard({ record, onOpen, onOpenJob, canOpenJob = true, showMeta = false }) {
  return (
    <button onClick={() => onOpen(record)} className="w-full text-left">
      <Card className="p-4 active:scale-[0.99] transition">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">{record.description}</div>
            {canOpenJob ? (
              <button
                type="button"
                className="mt-1 text-xs text-slate-500 underline underline-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenJob(record.job);
                }}
              >
                {record.job}
              </button>
            ) : (
              <div className="mt-1 text-xs text-slate-500">{record.job}</div>
            )}
            <div className="mt-1 text-[11px] text-slate-400">Caricata da: {record.uploadedBy || "—"}</div>
            {showMeta ? (
              <div className="mt-1 text-[11px] text-slate-400">
                {record.supplier} • {record.paymentMethod}
                {record.externalCompany ? ` • Ditta esterna: ${record.externalCompany}` : ""}
              </div>
            ) : null}
          </div>
          <span className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-slate-100 text-slate-700">{record.status}</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-slate-50 p-2.5">
            <div className="text-[10px] text-slate-500">Totale</div>
            <div className="mt-1 text-sm font-semibold">{currency(record.amount)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2.5">
            <div className="text-[10px] text-slate-500">Imponibile</div>
            <div className="mt-1 text-sm font-semibold">{currency(record.imponibile)}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-2.5">
            <div className="text-[10px] text-slate-500">IVA</div>
            <div className="mt-1 text-sm font-semibold">{currency(record.vat)}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-500">{dateLabel(record.date)}</div>
      </Card>
    </button>
  );
}

export default function App() {
  const [role, setRole] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState("capo");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [screen, setScreen] = useState("dashboard");
  const [bossViewMode, setBossViewMode] = useState("simple");
  const [archiveViewMode, setArchiveViewMode] = useState("simple");
  const [siteViewMode, setSiteViewMode] = useState("simple");
  const [records, setRecords] = useState([...recordsSeed].sort((a, b) => new Date(b.date) - new Date(a.date)));
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("Tutti");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [notice, setNotice] = useState("Archivio spese caricato con dati reali del cantiere Barcelò Roma.");
  const [form, setForm] = useState({
    date: "2026-04-07",
    job: "Piscina",
    amount: "",
    vat: "",
    description: "",
    file: "",
  });

  const jobs = useMemo(() => [...new Set(records.map((record) => record.job))], [records]);
  const myRecords = useMemo(() => records.filter((record) => record.uploadedBy === currentUserName), [records, currentUserName]);

  const filteredRecords = useMemo(() => {
    const baseList = role === "capo" ? records : myRecords;
    const term = search.toLowerCase();
    return baseList.filter((record) => {
      const matchesSearch =
        record.description.toLowerCase().includes(term) ||
        record.job.toLowerCase().includes(term) ||
        record.supplier.toLowerCase().includes(term) ||
        record.category.toLowerCase().includes(term) ||
        (record.externalCompany || "").toLowerCase().includes(term);
      const matchesJob = jobFilter === "Tutti" || record.job === jobFilter;
      return matchesSearch && matchesJob;
    });
  }, [records, myRecords, role, search, jobFilter]);

  const totals = useMemo(() => {
    const total = records.reduce((sum, record) => sum + record.amount, 0);
    const imponibile = records.reduce((sum, record) => sum + record.imponibile, 0);
    const vat = records.reduce((sum, record) => sum + record.vat, 0);
    return { total, imponibile, vat, docs: records.length, average: records.length ? total / records.length : 0 };
  }, [records]);

  const jobStats = useMemo(() => {
    return jobs
      .map((job) => {
        const related = records.filter((record) => record.job === job);
        return {
          job,
          total: related.reduce((sum, record) => sum + record.amount, 0),
          imponibile: related.reduce((sum, record) => sum + record.imponibile, 0),
          vat: related.reduce((sum, record) => sum + record.vat, 0),
          count: related.length,
          externalCompanies: [...new Set(related.map((record) => record.externalCompany).filter(Boolean))],
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [jobs, records]);

  const visibleJob = selectedJob ? jobStats.find((item) => item.job === selectedJob) : null;

  const monthlySpend = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      const key = monthKey(record.date);
      if (!map[key]) map[key] = { label: key.replace("2026-", ""), primary: 0, secondary: 0 };
      map[key].primary += record.amount;
      map[key].secondary += record.vat;
    });
    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
  }, [records]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.category] = (map[record.category] || 0) + record.amount;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [records]);

  const supplierBreakdown = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.supplier] = (map[record.supplier] || 0) + record.amount;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [records]);

  const paymentBreakdown = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.paymentMethod] = (map[record.paymentMethod] || 0) + record.amount;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [records]);

  const uploaderBreakdown = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.uploadedBy] = (map[record.uploadedBy] || 0) + 1;
    });
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [records]);

  const fillDemoCredentials = () => {
    if (loginMode === "capo") {
      setLoginEmail(bossAccount.email);
      setLoginPassword(bossAccount.password);
    } else {
      setLoginEmail(employeeAccounts[0].email);
      setLoginPassword(employeeAccounts[0].password);
    }
    setLoginError("");
  };

  const handleLogin = () => {
    if (loginMode === "capo") {
      if (loginEmail === bossAccount.email && loginPassword === bossAccount.password) {
        setRole("capo");
        setCurrentUserName(bossAccount.name);
        setIsAuthenticated(true);
        setScreen("dashboard");
        setNotice("Accesso capo effettuato con successo.");
        setLoginError("");
        return;
      }
    } else {
      const employee = employeeAccounts.find((account) => account.email === loginEmail && account.password === loginPassword);
      if (employee) {
        setRole("dipendente");
        setCurrentUserName(employee.name);
        setIsAuthenticated(true);
        setScreen("dashboard");
        setNotice(`Accesso dipendente effettuato: ${employee.name}.`);
        setLoginError("");
        return;
      }
    }
    setLoginError("Credenziali non valide. Usa quelle demo mostrate sotto.");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setCurrentUserName("");
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setSelectedRecord(null);
    setSelectedJob(null);
    setScreen("dashboard");
    setNotice("Sei uscito dall’account.");
  };

  const openJob = (job) => {
    if (role !== "capo") {
      setNotice("Il dipendente non può aprire il dettaglio lavorazione.");
      return;
    }
    setSelectedJob(job);
    setScreen("job");
    setNotice(`Aperto dettaglio lavorazione: ${job}`);
  };

  const addRecord = () => {
    const amount = Number(form.amount);
    const vat = Number(form.vat);
    if (!form.date || !form.job || !form.description || !amount || (!vat && vat !== 0)) {
      setNotice("Compila tutti i campi principali prima di salvare.");
      return;
    }

    const newRecord = {
      id: Date.now(),
      date: form.date,
      site: site.name,
      job: form.job,
      amount,
      imponibile: Math.max(0, amount - vat),
      vat,
      status: role === "capo" ? "Registrata" : "In verifica",
      description: form.description,
      file: form.file || "Documento_caricato.pdf",
      supplier: role === "capo" ? "Inserimento manuale" : currentUserName,
      paymentMethod: "Da confermare",
      externalCompany: null,
      category: form.job === "Alloggi squadra" ? "Alloggi" : form.job === "Vitto squadra" ? "Vitto" : "Lavori",
      uploadedBy: role === "capo" ? "Capo/Admin" : currentUserName,
      items: [],
    };

    setRecords((prev) => [newRecord, ...prev]);
    setForm({ date: "2026-04-07", job: form.job, amount: "", vat: "", description: "", file: "" });
    setScreen(role === "capo" ? "archive" : "dashboard");
    setNotice(`Spesa salvata con successo da ${newRecord.uploadedBy}.`);
  };

  const navItems =
    role === "capo"
      ? [
          { id: "dashboard", label: "Home", emoji: "🏠" },
          { id: "archive", label: "Spese", emoji: "📄" },
          { id: "add", label: "Aggiungi", emoji: "➕" },
          { id: "site", label: "Cantiere", emoji: "🏗️" },
          { id: "users", label: "Utenti", emoji: "👥" },
        ]
      : [
          { id: "dashboard", label: "Home", emoji: "🏠" },
          { id: "add", label: "Carica", emoji: "➕" },
          { id: "archive", label: "Le mie", emoji: "📄" },
        ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto min-h-screen max-w-md px-4 py-6">
          <div className="space-y-4">
            <div className="px-1 pt-2">
              <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Demo accesso</div>
              <h1 className="mt-1 text-3xl font-semibold">Login gestione spese</h1>
              <p className="mt-2 text-sm text-slate-600">Archivio professionale per il controllo spese del cantiere Barcelò Roma.</p>
            </div>

            <Card className="p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setLoginMode("capo");
                    setLoginError("");
                  }}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${loginMode === "capo" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  Accesso capo
                </button>
                <button
                  onClick={() => {
                    setLoginMode("dipendente");
                    setLoginError("");
                  }}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${loginMode === "dipendente" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  Accesso dipendente
                </button>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Email</label>
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={loginMode === "capo" ? bossAccount.email : employeeAccounts[0].email}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Inserisci password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button onClick={handleLogin} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                  Entra
                </button>
                <button onClick={fillDemoCredentials} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                  Compila demo
                </button>
              </div>
              {loginError ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{loginError}</div> : null}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-24">
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-100/90 backdrop-blur">
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Gestionale mobile</div>
                <div className="text-lg font-semibold">Controllo spese cantiere</div>
              </div>
              <button onClick={logout} className="rounded-full bg-white px-3 py-2 text-xs font-medium shadow-sm border border-slate-200">
                Logout
              </button>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm border border-slate-200">
              <div>
                <div className="text-xs text-slate-500">Cantiere</div>
                <div className="text-sm font-medium">{site.name}</div>
              </div>
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-white">{role === "capo" ? bossAccount.name : currentUserName}</div>
            </div>
            {role === "capo" ? <SectionToggle value={bossViewMode} onChange={setBossViewMode} leftLabel="Vista semplice" rightLabel="Vista completa" /> : null}
          </div>
        </div>

        <main className="px-4 py-4 space-y-4">
          {screen === "dashboard" && role === "capo" && (
            <>
              <ScreenTitle
                eyebrow="Panoramica"
                title={bossViewMode === "simple" ? "Dashboard spese" : "Dashboard spese completa"}
                subtitle={bossViewMode === "simple" ? "Un solo cantiere, più lavorazioni e centri di costo." : "Analisi completa delle spese del cantiere con lavorazioni, fornitori e ditte esterne."}
                action={<button onClick={() => setScreen("add")} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">+ Nuova spesa</button>}
              />

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Spese totali" value={currency(totals.total)} hint="Totale uscite cantiere" />
                <StatCard label="IVA totale" value={currency(totals.vat)} hint="IVA complessiva" />
                <StatCard label="Imponibile" value={currency(totals.imponibile)} hint="Base imponibile" />
                <StatCard label="Documenti" value={String(totals.docs)} hint="Spese registrate" />
                {bossViewMode === "advanced" ? <StatCard label="Spesa media" value={currency(totals.average)} hint="Media per documento" /> : null}
                {bossViewMode === "advanced" ? <StatCard label="Lavorazione principale" value={jobStats[0]?.job || "—"} hint={jobStats[0] ? currency(jobStats[0].total) : "—"} /> : null}
              </div>

              <Card className="p-4">
                <div className="text-sm font-semibold">Cantiere attivo</div>
                <div className="mt-4 rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{site.name}</div>
                      <div className="mt-1 text-sm text-slate-500">Cliente: {site.client} • {site.location}</div>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-700">{site.status}</div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-2xl bg-white p-3">
                      <div className="text-[11px] text-slate-500">Lavorazioni</div>
                      <div className="mt-1 text-sm font-semibold">{jobStats.length}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <div className="text-[11px] text-slate-500">Documenti</div>
                      <div className="mt-1 text-sm font-semibold">{totals.docs}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <div className="text-[11px] text-slate-500">Spesa</div>
                      <div className="mt-1 text-sm font-semibold">{currency(totals.total)}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {bossViewMode === "simple" ? (
                <>
                  <HorizontalChart title="Spese per periodo" subtitle="Confronto tra spesa totale e IVA per periodo." data={monthlySpend} mode="double" />
                  <HorizontalChart title="Spese per lavorazione" subtitle="Le lavorazioni più costose del cantiere." data={jobStats.slice(0, 5).map((item) => ({ label: item.job, value: item.total }))} />
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">Ultime spese</div>
                        <div className="text-xs text-slate-500">Controllo rapido dei documenti più recenti</div>
                      </div>
                      <button onClick={() => setScreen("archive")} className="text-sm font-medium text-slate-900">Apri</button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {records.slice(0, 4).map((record) => (
                        <ExpenseCard key={record.id} record={record} onOpen={setSelectedRecord} onOpenJob={openJob} canOpenJob />
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  <HorizontalChart title="Spese e IVA per periodo" subtitle="Andamento economico del cantiere nel tempo." data={monthlySpend} mode="double" />
                  <HorizontalChart title="Spese per lavorazione" subtitle="Ripartizione tra le diverse lavorazioni e centri di costo del cantiere." data={jobStats.map((item) => ({ label: item.job, value: item.total }))} />
                  <HorizontalChart title="Spese per categoria" subtitle="Materiali, vitto, alloggi, noleggi e altre aree di costo." data={categoryBreakdown} />
                  <HorizontalChart title="Fornitori principali" subtitle="I fornitori che incidono di più sul costo totale." data={supplierBreakdown} />
                  <HorizontalChart title="Metodi di pagamento" subtitle="Ripartizione tra bonifico, carta, contanti e altri metodi." data={paymentBreakdown} />
                  <HorizontalChart title="Caricamenti per utente" subtitle="Controllo operativo su chi sta registrando i documenti." data={uploaderBreakdown} />
                </>
              )}
            </>
          )}

          {screen === "dashboard" && role === "dipendente" && (
            <>
              <ScreenTitle
                eyebrow="Area dipendente"
                title="Caricamento spese"
                subtitle="Puoi registrare nuove spese e vedere solo quelle inserite da te."
                action={<button onClick={() => setScreen("add")} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">Nuova spesa</button>}
              />
              <Card className="p-4">
                <div className="text-sm font-semibold">Permessi limitati</div>
                <div className="mt-2 text-sm text-slate-600">Non puoi vedere il riepilogo completo del cantiere né i dati caricati dagli altri utenti.</div>
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Le tue spese" value={String(myRecords.length)} hint="Documenti inseriti da te" />
                <StatCard label="Totale caricato" value={currency(myRecords.reduce((sum, record) => sum + record.amount, 0))} hint="Somma delle tue spese" />
              </div>
              <Card className="p-4">
                <div className="text-sm font-semibold">Le tue ultime spese</div>
                <div className="mt-1 text-xs text-slate-500">Visibili solo i documenti caricati da {currentUserName}.</div>
                <div className="mt-4 space-y-3">
                  {myRecords.length ? (
                    myRecords.slice(0, 3).map((record) => (
                      <ExpenseCard key={record.id} record={record} onOpen={setSelectedRecord} onOpenJob={openJob} canOpenJob={false} />
                    ))
                  ) : (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Non hai ancora caricato spese.</div>
                  )}
                </div>
              </Card>
            </>
          )}

          {screen === "archive" && (
            <>
              <ScreenTitle
                eyebrow="Archivio"
                title={role === "capo" ? "Archivio spese" : "Le mie spese"}
                subtitle={role === "capo" ? "Documenti organizzati per lavorazione, fornitore e dettaglio costo." : `Qui vedi solo i documenti caricati da ${currentUserName}.`}
                action={role === "capo" ? <SectionToggle value={archiveViewMode} onChange={setArchiveViewMode} /> : null}
              />
              <Card className="p-4 space-y-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per lavorazione, fornitore, descrizione o categoria"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                />
                <div>
                  <div className="mb-2 text-xs text-slate-500">Lavorazione</div>
                  <div className="flex flex-wrap gap-2">
                    <Pill active={jobFilter === "Tutti"} onClick={() => setJobFilter("Tutti")}>Tutte</Pill>
                    {jobs.map((job) => (
                      <Pill key={job} active={jobFilter === job} onClick={() => setJobFilter(job)}>{job}</Pill>
                    ))}
                  </div>
                </div>
              </Card>

              {role === "capo" && archiveViewMode === "advanced" ? (
                <Card className="p-4">
                  <div className="text-sm font-semibold">Riepilogo selezione</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <StatCard label="Documenti filtrati" value={String(filteredRecords.length)} />
                    <StatCard label="Totale filtrato" value={currency(filteredRecords.reduce((sum, record) => sum + record.amount, 0))} />
                    <StatCard label="IVA filtrata" value={currency(filteredRecords.reduce((sum, record) => sum + record.vat, 0))} />
                    <StatCard label="Imponibile filtrato" value={currency(filteredRecords.reduce((sum, record) => sum + record.imponibile, 0))} />
                  </div>
                </Card>
              ) : null}

              <div className="space-y-3">
                {filteredRecords.length ? (
                  filteredRecords.map((record) => (
                    <ExpenseCard
                      key={record.id}
                      record={record}
                      onOpen={setSelectedRecord}
                      onOpenJob={openJob}
                      canOpenJob={role === "capo"}
                      showMeta={role === "capo" && archiveViewMode === "advanced"}
                    />
                  ))
                ) : (
                  <Card className="p-6 text-center text-sm text-slate-500">Nessuna spesa trovata con questi filtri.</Card>
                )}
              </div>
            </>
          )}

          {screen === "add" && (
            <>
              <ScreenTitle eyebrow="Inserimento veloce" title="Aggiungi spesa" subtitle="Registrazione semplice del documento per il cantiere Barcelò Roma." />
              <Card className="p-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Data</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Lavorazione</label>
                  <select value={form.job} onChange={(e) => setForm({ ...form, job: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
                    {jobs.map((job) => (
                      <option key={job} value={job}>{job}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">Totale spesa</label>
                    <input type="number" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">IVA</label>
                    <input type="number" placeholder="0" value={form.vat} onChange={(e) => setForm({ ...form, vat: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Descrizione</label>
                  <input placeholder="Es. Materiali cartongesso" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Nome file / documento</label>
                  <input placeholder="Es. fattura_aprile.pdf" value={form.file} onChange={(e) => setForm({ ...form, file: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
                  Cantiere: <span className="font-medium text-slate-900">{site.name}</span> • Registrata da <span className="font-medium text-slate-900">{role === "capo" ? bossAccount.name : currentUserName}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={addRecord} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">Salva</button>
                  <button onClick={() => { setForm({ ...form, amount: "", vat: "", description: "", file: "" }); setNotice("Campi del form ripuliti."); }} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Pulisci</button>
                </div>
              </Card>
            </>
          )}

          {screen === "site" && role === "capo" && (
            <>
              <ScreenTitle eyebrow="Cantiere" title={site.name} subtitle="Un solo cantiere con lavorazioni, centri di costo e ditte esterne collegate." action={<SectionToggle value={siteViewMode} onChange={setSiteViewMode} />} />
              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{site.name}</div>
                    <div className="mt-1 text-sm text-slate-500">Cliente: {site.client} • {site.location}</div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-700">{site.status}</div>
                </div>
                <div className={`mt-4 grid gap-2 text-center ${siteViewMode === "advanced" ? "grid-cols-4" : "grid-cols-3"}`}>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Lavorazioni</div><div className="mt-1 text-sm font-semibold">{jobStats.length}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Documenti</div><div className="mt-1 text-sm font-semibold">{totals.docs}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Spesa totale</div><div className="mt-1 text-sm font-semibold">{currency(totals.total)}</div></div>
                  {siteViewMode === "advanced" ? <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">IVA totale</div><div className="mt-1 text-sm font-semibold">{currency(totals.vat)}</div></div> : null}
                </div>
              </Card>
              {siteViewMode === "advanced" ? <HorizontalChart title="Spese per lavorazione" subtitle="Distribuzione del costo tra le varie lavorazioni del cantiere." data={jobStats.map((item) => ({ label: item.job, value: item.total }))} /> : null}
              <Card className="p-4">
                <div className="text-sm font-semibold">Lavorazioni e centri di costo</div>
                <div className="mt-4 space-y-3">
                  {jobStats.map((item) => (
                    <button key={item.job} onClick={() => openJob(item.job)} className="w-full text-left rounded-2xl bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium">{item.job}</div>
                          <div className="text-xs text-slate-500">{item.externalCompanies.length ? `Ditta esterna: ${item.externalCompanies.join(", ")}` : "Lavorazione / costo interno"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{currency(item.total)}</div>
                          <div className="text-[11px] text-slate-500">spesa</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

          {screen === "job" && role === "capo" && visibleJob && (
            <>
              <ScreenTitle eyebrow="Lavorazione" title={visibleJob.job} subtitle={visibleJob.externalCompanies.length ? `Ditta esterna collegata: ${visibleJob.externalCompanies.join(", ")}` : "Lavorazione / centro di costo interno"} action={<button onClick={() => setScreen("site")} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Indietro</button>} />
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Spesa totale" value={currency(visibleJob.total)} />
                <StatCard label="IVA" value={currency(visibleJob.vat)} />
                <StatCard label="Imponibile" value={currency(visibleJob.imponibile)} />
                <StatCard label="Documenti" value={String(visibleJob.count)} />
              </div>
              <Card className="p-4">
                <div className="text-sm font-semibold">Spese collegate alla lavorazione</div>
                <div className="mt-4 space-y-3">
                  {records.filter((record) => record.job === visibleJob.job).map((record) => (
                    <ExpenseCard key={record.id} record={record} onOpen={setSelectedRecord} onOpenJob={openJob} canOpenJob showMeta={bossViewMode === "advanced"} />
                  ))}
                </div>
              </Card>
            </>
          )}

          {screen === "users" && role === "capo" && (
            <>
              <ScreenTitle eyebrow="Permessi" title="Utenti" subtitle="Ruoli distinti per controllo amministrativo e caricamento documenti." />
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Titolare / Admin</div>
                      <div className="text-sm text-slate-500">Accesso completo a dashboard, archivio spese, cantiere, lavorazioni e dettagli.</div>
                    </div>
                    <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-white">Capo</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">Dipendente</div>
                      <div className="text-sm text-slate-500">Può caricare spese e vedere soltanto i documenti caricati da lui.</div>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700">Limitato</div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </main>

        <div className="fixed inset-x-0 bottom-20 mx-auto max-w-md px-4">
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">{notice}</div>
        </div>

        <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md border-t border-slate-200 bg-white">
          <div className={`grid ${role === "capo" ? "grid-cols-5" : "grid-cols-3"}`}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedRecord(null);
                  if (role === "dipendente" && ["site", "users", "job"].includes(item.id)) {
                    setNotice("Accesso non consentito per il profilo dipendente.");
                    return;
                  }
                  setScreen(item.id);
                  if (item.id !== "job") setSelectedJob(null);
                  setNotice(`Sei nella sezione ${item.label}.`);
                }}
                className={`flex flex-col items-center gap-1 px-2 py-3 text-[11px] ${screen === item.id ? "text-slate-900" : "text-slate-500"}`}
              >
                <span className="text-base">{item.emoji}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {selectedRecord && (
          <div className="fixed inset-0 z-30 bg-slate-900/40 px-4 py-6">
            <div className="mx-auto mt-10 max-w-md">
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Dettaglio spesa</div>
                    <div className="mt-1 text-lg font-semibold">{selectedRecord.description}</div>
                  </div>
                  <button onClick={() => setSelectedRecord(null)} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    Chiudi
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Cantiere:</span> {selectedRecord.site}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Lavorazione:</span> {selectedRecord.job}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Data:</span> {dateLabel(selectedRecord.date)}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Totale:</span> {currency(selectedRecord.amount)}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Imponibile:</span> {currency(selectedRecord.imponibile)}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">IVA:</span> {currency(selectedRecord.vat)}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Fornitore:</span> {selectedRecord.supplier || "—"}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Metodo:</span> {selectedRecord.paymentMethod || "—"}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Categoria:</span> {selectedRecord.category || "—"}</div>
                  {selectedRecord.externalCompany ? <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Ditta esterna:</span> {selectedRecord.externalCompany}</div> : null}
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Caricata da:</span> {selectedRecord.uploadedBy || "—"}</div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Documento:</span> {selectedRecord.file}</div>
                  {selectedRecord.items?.length ? (
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-slate-500">Dettaglio materiali / voci</div>
                      <div className="mt-2 space-y-2">
                        {selectedRecord.items.slice(0, 8).map((item, index) => (
                          <div key={`${item.name}-${index}`} className="rounded-xl bg-white px-3 py-2">
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {item.category}{item.qty ? ` • Q.tà ${item.qty}` : ""}{item.total ? ` • ${currency(item.total)}` : ""}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => { setNotice(`Apertura documento: ${selectedRecord.file}`); setSelectedRecord(null); }} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">Apri file</button>
                  {role === "capo" ? (
                    <button onClick={() => { openJob(selectedRecord.job); setSelectedRecord(null); }} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Vai alla lavorazione</button>
                  ) : (
                    <button onClick={() => setSelectedRecord(null)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">Chiudi</button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
