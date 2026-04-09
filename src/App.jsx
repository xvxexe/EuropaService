import { useMemo, useState } from "react";
import { bossAccount, employeeAccounts } from "./data/authData";
import { site } from "./data/siteData";
import { recordsSeed } from "./data/recordsData";
import { currency, dateLabel, monthKey } from "./utils/formatters";

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
        "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white active:scale-[0.99] transition",
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
        "rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 active:scale-[0.99] transition",
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

function SectionToggle({ value, onChange, leftLabel = "Semplice", rightLabel = "Completa" }) {
  return (
    <div className="rounded-2xl bg-white/80 p-1 shadow-sm border border-white/40">
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => onChange("simple")}
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-semibold transition",
            value === "simple" ? "bg-slate-900 text-white" : "text-slate-500"
          )}
        >
          {leftLabel}
        </button>
        <button
          onClick={() => onChange("advanced")}
          className={cn(
            "rounded-xl px-3 py-2 text-xs font-semibold transition",
            value === "advanced" ? "bg-slate-900 text-white" : "text-slate-500"
          )}
        >
          {rightLabel}
        </button>
      </div>
    </div>
  );
}

function HeaderBlock({ eyebrow, title, subtitle, action }) {
  return (
    <div className="px-1">
      {eyebrow ? <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{eyebrow}</div> : null}
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

  return (
    <Card className={cn("p-4", emphasis && "bg-slate-900 text-white border-slate-900")}>
      <div className={cn("text-[11px] uppercase tracking-[0.18em]", emphasis ? "text-slate-300" : "text-slate-500")}>
        {label}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold", emphasis ? "text-white" : "text-slate-950")}>{safeValue}</div>
      {hint ? <div className={cn("mt-1 text-xs", emphasis ? "text-slate-300" : "text-slate-500")}>{hint}</div> : null}
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
    ...safe.map((item) => (mode === "double" ? Math.max(item.primary || 0, item.secondary || 0) : item.value || 0)),
    1
  );

  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
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
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${Math.max(4, ((item.primary || 0) / maxValue) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-[10px] text-slate-400">IVA</div>
                  <div className="h-3 rounded-full bg-white overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-400"
                      style={{ width: `${Math.max(4, ((item.secondary || 0) / maxValue) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3 h-3 rounded-full bg-white overflow-hidden border border-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${Math.max(4, ((item.value || 0) / maxValue) * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function SummaryBanner({ role, currentUserName, totalRecords, totalAmount }) {
  const safeTotalAmount = Number.isFinite(totalAmount) ? totalAmount : 0;
  const safeTotalRecords = Number.isFinite(totalRecords) ? totalRecords : 0;

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">
              {role === "capo" ? "Area amministrazione" : "Area dipendente"}
            </div>
            <div className="mt-2 text-xl font-semibold leading-6">
              {role === "capo" ? "Controllo spese del cantiere" : `Ciao ${currentUserName}`}
            </div>
            <div className="mt-2 text-sm text-slate-300">
              {role === "capo"
                ? "Una vista chiara di lavorazioni, documenti e costi del cantiere Barcelò Roma."
                : "Qui puoi caricare spese e controllare rapidamente solo quelle inserite da te."}
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-right backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">Documenti</div>
            <div className="mt-1 text-lg font-semibold">{safeTotalRecords}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
          <div>
            <div className="text-xs text-slate-300">Totale visibile</div>
            <div className="mt-1 text-xl font-semibold">{currency(safeTotalAmount)}</div>
          </div>
          <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-medium text-emerald-200">
            {site.name}
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
                  onOpenJob(record.job);
                }}
              >
                {record.job}
              </button>
            ) : (
              <div className="mt-1 text-xs text-slate-500">{record.job}</div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">{dateLabel(record.date)}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">{record.paymentMethod}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">{record.status}</div>
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
          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
            {record.supplier} • {record.category}
            {record.externalCompany ? ` • Ditta esterna: ${record.externalCompany}` : ""}
          </div>
        ) : null}
      </Card>
    </button>
  );
}

function JobCard({ item, onOpen, advanced = false }) {
  return (
    <button onClick={() => onOpen(item.job)} className="w-full text-left">
      <Card className="p-4 active:scale-[0.99] transition">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">{item.job}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">
              {item.externalCompanies.length ? `Ditta esterna: ${item.externalCompanies.join(", ")}` : "Lavorazione interna"}
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

function LoginScreen({
  loginMode,
  setLoginMode,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  loginError,
  bossAccount,
  employeeAccounts,
  handleLogin,
  fillDemoCredentials,
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen max-w-md px-4 py-6">
        <div className="space-y-4">
          <div className="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300">Accesso demo</div>
            <h1 className="mt-3 text-3xl font-semibold leading-9">Gestione spese Barcelò Roma</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Interfaccia mobile per consultare costi, lavorazioni, alloggi, vitto e documenti del cantiere.
            </p>
          </div>

          <Card className="p-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLoginMode("capo")}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold",
                  loginMode === "capo" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                )}
              >
                Accesso capo
              </button>
              <button
                onClick={() => setLoginMode("dipendente")}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold",
                  loginMode === "dipendente" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                )}
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
            <div className="grid grid-cols-2 gap-3">
              <PrimaryButton onClick={handleLogin}>Entra</PrimaryButton>
              <SecondaryButton onClick={fillDemoCredentials}>Compila demo</SecondaryButton>
            </div>
            {loginError ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{loginError}</div> : null}
          </Card>

          <Card className="p-4">
            <div className="text-sm font-semibold text-slate-900">Credenziali demo</div>
            {loginMode === "capo" ? (
              <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">
                <div><span className="text-slate-500">Email:</span> {bossAccount.email}</div>
                <div className="mt-1"><span className="text-slate-500">Password:</span> {bossAccount.password}</div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {employeeAccounts.map((employee) => (
                  <div key={employee.email} className="rounded-2xl bg-slate-50 p-4 text-sm">
                    <div className="font-semibold text-slate-900">{employee.name}</div>
                    <div className="mt-1"><span className="text-slate-500">Email:</span> {employee.email}</div>
                    <div className="mt-1"><span className="text-slate-500">Password:</span> {employee.password}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
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

    return {
      total,
      imponibile,
      vat,
      docs: records.length,
      average: records.length ? total / records.length : 0,
    };
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
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const supplierBreakdown = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.supplier] = (map[record.supplier] || 0) + record.amount;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [records]);

  const paymentBreakdown = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.paymentMethod] = (map[record.paymentMethod] || 0) + record.amount;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const uploaderBreakdown = useMemo(() => {
    const map = {};
    records.forEach((record) => {
      map[record.uploadedBy] = (map[record.uploadedBy] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const topJob = jobStats[0];

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
      const employee = employeeAccounts.find(
        (account) => account.email === loginEmail && account.password === loginPassword
      );

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
      category: form.job === "Alloggi" ? "Alloggi" : form.job === "Vitto" ? "Vitto" : "Lavori",
      uploadedBy: role === "capo" ? "Capo/Admin" : currentUserName,
      items: [],
    };

    setRecords((prev) => [newRecord, ...prev]);
    setForm({
      date: "2026-04-07",
      job: form.job,
      amount: "",
      vat: "",
      description: "",
      file: "",
    });
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
      <LoginScreen
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        loginError={loginError}
        bossAccount={bossAccount}
        employeeAccounts={employeeAccounts}
        handleLogin={handleLogin}
        fillDemoCredentials={fillDemoCredentials}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen max-w-md bg-slate-100 pb-24">
        <div className="px-4 pb-3 pt-4">
          <SummaryBanner
            role={role}
            currentUserName={currentUserName}
            totalRecords={role === "capo" ? totals.docs : myRecords.length}
            totalAmount={role === "capo" ? totals.total : myRecords.reduce((sum, record) => sum + record.amount, 0)}
          />
        </div>

        {role === "capo" ? (
          <div className="sticky top-0 z-20 bg-slate-100/95 px-4 pb-3 backdrop-blur">
            <SectionToggle
              value={bossViewMode}
              onChange={setBossViewMode}
              leftLabel="Vista semplice"
              rightLabel="Vista completa"
            />
          </div>
        ) : null}

        <main className="space-y-4 px-4 pb-4">
          {screen === "dashboard" && role === "capo" && (
            <>
              <HeaderBlock
                eyebrow="Panoramica"
                title="Dashboard spese"
                subtitle="Navigazione più chiara e dati principali sempre visibili."
                action={<PrimaryButton onClick={() => setScreen("add")}>+ Nuova spesa</PrimaryButton>}
              />

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Spese totali" value={currency(totals.total)} hint="Totale uscite" emphasis />
                <StatCard label="Documenti" value={String(totals.docs)} hint="Spese registrate" />
                <StatCard label="Imponibile" value={currency(totals.imponibile)} hint="Base imponibile" />
                <StatCard label="IVA totale" value={currency(totals.vat)} hint="IVA complessiva" />
                {bossViewMode === "advanced" ? <StatCard label="Spesa media" value={currency(totals.average)} hint="Media per documento" /> : null}
                {bossViewMode === "advanced" ? (
                  <StatCard
                    label="Lavorazione principale"
                    value={topJob ? topJob.job : "—"}
                    hint={topJob ? currency(topJob.total) : "Nessun dato"}
                  />
                ) : null}
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
                    <div className="mt-1 text-xs text-slate-500">Cliente, stato e riepilogo generale del sito.</div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700">{site.status}</div>
                </div>
                <div className="mt-4 space-y-2">
                  <InfoRow label="Nome cantiere" value={site.name} highlight />
                  <InfoRow label="Cliente" value={site.client} />
                  <InfoRow label="Luogo" value={site.location} />
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

              {bossViewMode === "advanced" ? (
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
              ) : null}

              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Ultime spese</div>
                    <div className="mt-1 text-xs text-slate-500">Le registrazioni più recenti del sistema.</div>
                  </div>
                  <SecondaryButton onClick={() => setScreen("archive")} className="px-3 py-2 text-xs">
                    Apri archivio
                  </SecondaryButton>
                </div>
                <div className="mt-4 space-y-3">
                  {records.slice(0, 4).map((record) => (
                    <ExpenseCard
                      key={record.id}
                      record={record}
                      onOpen={setSelectedRecord}
                      onOpenJob={openJob}
                      canOpenJob
                      showMeta={bossViewMode === "advanced"}
                    />
                  ))}
                </div>
              </Card>
            </>
          )}

          {screen === "dashboard" && role === "dipendente" && (
            <>
              <HeaderBlock
                eyebrow="Area dipendente"
                title="Home"
                subtitle="Una schermata più chiara per caricare spese e controllare rapidamente la tua attività."
                action={<PrimaryButton onClick={() => setScreen("add")}>Nuova spesa</PrimaryButton>}
              />

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Le tue spese" value={String(myRecords.length)} hint="Documenti inseriti da te" emphasis />
                <StatCard
                  label="Totale caricato"
                  value={currency(myRecords.reduce((sum, record) => sum + record.amount, 0))}
                  hint="Somma delle tue spese"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <QuickActionCard
                  icon="➕"
                  title="Carica spesa"
                  subtitle="Aggiungi subito un nuovo documento."
                  onClick={() => setScreen("add")}
                />
                <QuickActionCard
                  icon="📄"
                  title="Le mie spese"
                  subtitle="Apri l’archivio filtrato sul tuo utente."
                  onClick={() => setScreen("archive")}
                />
              </div>

              <Card className="p-4">
                <div className="text-sm font-semibold text-slate-900">Cosa puoi fare</div>
                <div className="mt-3 space-y-2">
                  <InfoRow label="Permessi" value="Caricamento spese" />
                  <InfoRow label="Visibilità" value="Solo documenti caricati da te" />
                  <InfoRow label="Cantiere" value={site.name} />
                </div>
              </Card>

              {myRecords.length ? (
                <Card className="p-4">
                  <div className="text-sm font-semibold text-slate-900">Le tue ultime spese</div>
                  <div className="mt-1 text-xs text-slate-500">Ultimi documenti inseriti da {currentUserName}.</div>
                  <div className="mt-4 space-y-3">
                    {myRecords.slice(0, 3).map((record) => (
                      <ExpenseCard
                        key={record.id}
                        record={record}
                        onOpen={setSelectedRecord}
                        onOpenJob={openJob}
                        canOpenJob={false}
                      />
                    ))}
                  </div>
                </Card>
              ) : (
                <EmptyState
                  title="Nessuna spesa caricata"
                  subtitle="Quando aggiungerai il primo documento, lo vedrai qui."
                  action={<PrimaryButton onClick={() => setScreen("add")}>Carica la prima spesa</PrimaryButton>}
                />
              )}
            </>
          )}

          {screen === "archive" && (
            <>
              <HeaderBlock
                eyebrow="Archivio"
                title={role === "capo" ? "Archivio spese" : "Le mie spese"}
                subtitle={
                  role === "capo"
                    ? "Ricerca, filtri e riepilogo in una sola schermata."
                    : `Qui vedi solo i documenti caricati da ${currentUserName}.`
                }
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
                  <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Lavorazioni</div>
                  <div className="-mx-1 overflow-x-auto px-1">
                    <div className="flex gap-2">
                      <Pill active={jobFilter === "Tutti"} onClick={() => setJobFilter("Tutti")}>Tutte</Pill>
                      {jobs.map((job) => (
                        <Pill key={job} active={jobFilter === job} onClick={() => setJobFilter(job)}>
                          {job}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Documenti visibili" value={String(filteredRecords.length)} hint="Dopo i filtri" />
                <StatCard
                  label="Totale visibile"
                  value={currency(filteredRecords.reduce((sum, record) => sum + record.amount, 0))}
                  hint="Somma selezionata"
                  emphasis
                />
              </div>

              {role === "capo" && archiveViewMode === "advanced" ? (
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="IVA visibile"
                    value={currency(filteredRecords.reduce((sum, record) => sum + record.vat, 0))}
                  />
                  <StatCard
                    label="Imponibile visibile"
                    value={currency(filteredRecords.reduce((sum, record) => sum + record.imponibile, 0))}
                  />
                </div>
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
                  <EmptyState
                    title="Nessuna spesa trovata"
                    subtitle="Prova a cambiare ricerca o lavorazione selezionata."
                  />
                )}
              </div>
            </>
          )}

          {screen === "add" && (
            <>
              <HeaderBlock
                eyebrow="Inserimento"
                title="Aggiungi spesa"
                subtitle="Form più pulito e leggibile, pensato per compilazione veloce da telefono."
              />

              <Card className="p-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">Lavorazione</label>
                  <select
                    value={form.job}
                    onChange={(e) => setForm({ ...form, job: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  >
                    {jobs.map((job) => (
                      <option key={job} value={job}>
                        {job}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">Totale spesa</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-500">IVA</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.vat}
                      onChange={(e) => setForm({ ...form, vat: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">Descrizione</label>
                  <input
                    placeholder="Es. Materiali cartongesso"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-500">Nome file / documento</label>
                  <input
                    placeholder="Es. fattura_aprile.pdf"
                    value={form.file}
                    onChange={(e) => setForm({ ...form, file: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                  Cantiere: <span className="font-semibold text-slate-900">{site.name}</span> • Registrata da{" "}
                  <span className="font-semibold text-slate-900">{role === "capo" ? bossAccount.name : currentUserName}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <PrimaryButton onClick={addRecord}>Salva</PrimaryButton>
                  <SecondaryButton
                    onClick={() => {
                      setForm({ ...form, amount: "", vat: "", description: "", file: "" });
                      setNotice("Campi del form ripuliti.");
                    }}
                  >
                    Pulisci
                  </SecondaryButton>
                </div>
              </Card>
            </>
          )}

          {screen === "site" && role === "capo" && (
            <>
              <HeaderBlock
                eyebrow="Cantiere"
                title={site.name}
                subtitle="Una sola schermata per capire il cantiere e navigare le lavorazioni."
                action={<SectionToggle value={siteViewMode} onChange={setSiteViewMode} />}
              />

              <Card className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{site.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Cliente: {site.client} • {site.location}
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-medium text-emerald-700">
                    {site.status}
                  </div>
                </div>

                <div className={cn("mt-4 grid gap-2", siteViewMode === "advanced" ? "grid-cols-4" : "grid-cols-3")}>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Lavorazioni</div>
                    <div className="mt-1 text-sm font-semibold">{jobStats.length}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Documenti</div>
                    <div className="mt-1 text-sm font-semibold">{totals.docs}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Spesa totale</div>
                    <div className="mt-1 text-sm font-semibold">{currency(totals.total)}</div>
                  </div>
                  {siteViewMode === "advanced" ? (
                    <div className="rounded-2xl bg-slate-50 p-3 text-center">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">IVA totale</div>
                      <div className="mt-1 text-sm font-semibold">{currency(totals.vat)}</div>
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

              <div className="space-y-3">
                {jobStats.map((item) => (
                  <JobCard key={item.job} item={item} onOpen={openJob} advanced={siteViewMode === "advanced"} />
                ))}
              </div>
            </>
          )}

          {screen === "job" && role === "capo" && visibleJob && (
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

              <Card className="p-4">
                <div className="text-sm font-semibold text-slate-900">Spese collegate alla lavorazione</div>
                <div className="mt-4 space-y-3">
                  {records
                    .filter((record) => record.job === visibleJob.job)
                    .map((record) => (
                      <ExpenseCard
                        key={record.id}
                        record={record}
                        onOpen={setSelectedRecord}
                        onOpenJob={openJob}
                        canOpenJob
                        showMeta
                      />
                    ))}
                </div>
              </Card>
            </>
          )}

          {screen === "users" && role === "capo" && (
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
                  <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">Capo</div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-900">Dipendente</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Può caricare spese e vedere soltanto i documenti caricati da lui.
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700">Limitato</div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-sm font-semibold text-slate-900">Account demo</div>
                <div className="mt-4 space-y-2">
                  <InfoRow label="Capo" value={bossAccount.email} />
                  {employeeAccounts.map((employee) => (
                    <InfoRow key={employee.email} label={employee.name} value={employee.email} />
                  ))}
                </div>
              </Card>
            </>
          )}
        </main>

        <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className={cn("grid px-2 py-2", role === "capo" ? "grid-cols-5" : "grid-cols-3")}>
            {navItems.map((item) => {
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedRecord(null);
                    if (role === "dipendente" && ["site", "users", "job"].includes(item.id)) {
                      return;
                    }
                    setScreen(item.id);
                    if (item.id !== "job") setSelectedJob(null);
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

        {selectedRecord ? (
          <div className="fixed inset-0 z-30 bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
            <div className="mx-auto mt-8 max-w-md">
              <Card className="max-h-[85vh] overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Dettaglio spesa</div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">{selectedRecord.description}</div>
                    </div>
                    <SecondaryButton onClick={() => setSelectedRecord(null)} className="px-3 py-2 text-xs">
                      Chiudi
                    </SecondaryButton>
                  </div>
                </div>

                <div className="max-h-[calc(85vh-92px)] overflow-y-auto px-5 py-4 space-y-3">
                  <InfoRow label="Cantiere" value={selectedRecord.site} />
                  <InfoRow label="Lavorazione" value={selectedRecord.job} />
                  <InfoRow label="Data" value={dateLabel(selectedRecord.date)} />
                  <InfoRow label="Totale" value={currency(selectedRecord.amount)} highlight />
                  <InfoRow label="Imponibile" value={currency(selectedRecord.imponibile)} />
                  <InfoRow label="IVA" value={currency(selectedRecord.vat)} />
                  <InfoRow label="Fornitore" value={selectedRecord.supplier || "—"} />
                  <InfoRow label="Metodo" value={selectedRecord.paymentMethod || "—"} />
                  <InfoRow label="Categoria" value={selectedRecord.category || "—"} />
                  {selectedRecord.externalCompany ? <InfoRow label="Ditta esterna" value={selectedRecord.externalCompany} /> : null}
                  <InfoRow label="Caricata da" value={selectedRecord.uploadedBy || "—"} />
                  <InfoRow label="Documento" value={selectedRecord.file} />

                  {selectedRecord.items?.length ? (
                    <Card className="p-4 bg-slate-50 border-slate-100">
                      <div className="text-sm font-semibold text-slate-900">Dettaglio materiali / voci</div>
                      <div className="mt-3 space-y-2">
                        {selectedRecord.items.slice(0, 10).map((item, index) => (
                          <div key={`${item.name}-${index}`} className="rounded-2xl bg-white px-3 py-3">
                            <div className="text-sm font-medium text-slate-900">{item.name}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {item.category}
                              {item.qty ? ` • Q.tà ${item.qty}` : ""}
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
                        setNotice(`Apertura documento: ${selectedRecord.file}`);
                        setSelectedRecord(null);
                      }}
                    >
                      Apri file
                    </PrimaryButton>
                    {role === "capo" ? (
                      <SecondaryButton
                        onClick={() => {
                          openJob(selectedRecord.job);
                          setSelectedRecord(null);
                        }}
                      >
                        Vai alla lavorazione
                      </SecondaryButton>
                    ) : (
                      <SecondaryButton onClick={() => setSelectedRecord(null)}>Chiudi</SecondaryButton>
                    )}
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
