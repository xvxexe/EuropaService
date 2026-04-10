import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  FolderOpen,
  FileText,
  Receipt,
  Search,
  Plus,
  Filter,
  ArrowLeft,
  LayoutGrid,
  BarChart3,
  HardDriveUpload,
  Eye,
  Wallet,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const currentUser = {
  role: "owner",
  name: "Gabriel Stroe",
};

const sitesSeed = [
  {
    id: "site-barcelo-roma",
    name: "Barcelo Roma",
    client: "Barcelo",
    city: "Roma",
    status: "Attivo",
    folderPath: "Cantieri/Barcelo-Roma",
    masterFile: "Barcelo-Roma_Master.xlsx",
    jobs: [
      { id: "job-piscina", name: "Piscina", type: "Lavoro", externalCompany: "Midas Roma", note: "Costruzione piscina" },
      { id: "job-alloggi", name: "Alloggi", type: "Servizio", externalCompany: "", note: "Alloggi squadra" },
      { id: "job-vitto", name: "Vitto", type: "Servizio", externalCompany: "", note: "Pasti squadra" },
      { id: "job-scala", name: "Scala esterna e aiuola", type: "Lavoro", externalCompany: "", note: "Lavori esterni" },
      { id: "job-massetti", name: "Massetti griglia ristorante", type: "Lavoro", externalCompany: "", note: "Massetti" },
      { id: "job-soffitti", name: "Soffitti fase 2", type: "Lavoro", externalCompany: "", note: "Soffitti e fissaggi" },
      { id: "job-rifiuti", name: "Rifiuti / container", type: "Servizio", externalCompany: "Edil Nollo", note: "Smaltimento macerie" },
      { id: "job-mezzi", name: "Mezzi di cantiere", type: "Servizio", externalCompany: "", note: "Bobcat, gomme e mezzi" },
    ],
  },
  {
    id: "site-template",
    name: "Template nuovo cantiere",
    client: "Da definire",
    city: "-",
    status: "Template",
    folderPath: "Cantieri/TEMPLATE_CANTIERE",
    masterFile: "TEMPLATE_Master.xlsx",
    jobs: [],
  },
];

const documentsSeed = [
  {
    id: "doc-1",
    siteId: "site-barcelo-roma",
    jobId: "job-piscina",
    type: "Fattura",
    fileName: "2026-04-07_Eurofer_Fattura_3562_Piscina.pdf",
    folder: "01_Documenti/01_Fatture",
    supplier: "Eurofer",
    documentNumber: "3562",
    amount: 255.29,
    linkedExpenseIds: ["exp-1"],
    uploadedAt: "2026-04-07",
  },
  {
    id: "doc-2",
    siteId: "site-barcelo-roma",
    jobId: "job-piscina",
    type: "Fattura",
    fileName: "2026-04-07_Comfer_Docc_2602_Piscina.pdf",
    folder: "01_Documenti/01_Fatture",
    supplier: "Comfer",
    documentNumber: "2602",
    amount: 1922.4,
    linkedExpenseIds: ["exp-2"],
    uploadedAt: "2026-04-07",
  },
  {
    id: "doc-3",
    siteId: "site-barcelo-roma",
    jobId: "job-alloggi",
    type: "Fattura",
    fileName: "2026-04-02_LorisBotone_Fattura_Affitto_Alloggi.pdf",
    folder: "01_Documenti/01_Fatture",
    supplier: "Loris Botone",
    documentNumber: "AFFITTO-APRILE",
    amount: 2200,
    linkedExpenseIds: ["exp-3"],
    uploadedAt: "2026-04-02",
  },
  {
    id: "doc-4",
    siteId: "site-barcelo-roma",
    jobId: "job-vitto",
    type: "Scontrino",
    fileName: "2026-03-28_PAM_Scontrino_Vitto.pdf",
    folder: "01_Documenti/06_Extra",
    supplier: "PAM Panorama",
    documentNumber: "SCONTRINO-0328",
    amount: 37.32,
    linkedExpenseIds: ["exp-4"],
    uploadedAt: "2026-03-28",
  },
  {
    id: "doc-5",
    siteId: "site-barcelo-roma",
    jobId: "job-rifiuti",
    type: "FIR",
    fileName: "2026-04-09_FIR_VLKMJ008324VX_Container.pdf",
    folder: "01_Documenti/06_Extra",
    supplier: "Edil Nollo",
    documentNumber: "VLKMJ008324VX",
    amount: 2000,
    linkedExpenseIds: ["exp-5"],
    uploadedAt: "2026-04-09",
  },
  {
    id: "doc-6",
    siteId: "site-barcelo-roma",
    jobId: "job-mezzi",
    type: "Bonifico",
    fileName: "2026-04-08_CifarelliGomme_Bonifico_583_Bobcat.pdf",
    folder: "01_Documenti/02_Bonifici",
    supplier: "Cifarelli Gomme Srl",
    documentNumber: "583",
    amount: 565.01,
    linkedExpenseIds: ["exp-6"],
    uploadedAt: "2026-04-08",
  },
];

const expensesSeed = [
  {
    id: "exp-1",
    siteId: "site-barcelo-roma",
    jobId: "job-piscina",
    supplier: "Eurofer",
    description: "EUROFER 3562",
    date: "2026-04-07",
    amount: 255.29,
    imponibile: 209.25,
    vat: 46.04,
    paymentMethod: "Bonifico",
    documentType: "Fattura",
    status: "Verificata",
    uploadedBy: "Capo/Admin",
  },
  {
    id: "exp-2",
    siteId: "site-barcelo-roma",
    jobId: "job-piscina",
    supplier: "Comfer",
    description: "COMFER Docc 2602",
    date: "2026-04-07",
    amount: 1922.4,
    imponibile: 1576.56,
    vat: 345.84,
    paymentMethod: "Bonifico",
    documentType: "Fattura",
    status: "Verificata",
    uploadedBy: "Capo/Admin",
  },
  {
    id: "exp-3",
    siteId: "site-barcelo-roma",
    jobId: "job-alloggi",
    supplier: "Loris Botone",
    description: "Affitto appartamento Roma",
    date: "2026-04-02",
    amount: 2200,
    imponibile: 0,
    vat: 0,
    paymentMethod: "Bonifico",
    documentType: "Fattura",
    status: "Verificata",
    uploadedBy: "Capo/Admin",
  },
  {
    id: "exp-4",
    siteId: "site-barcelo-roma",
    jobId: "job-vitto",
    supplier: "PAM Panorama",
    description: "PAM Panorama - Spesa pranzo",
    date: "2026-03-28",
    amount: 37.32,
    imponibile: 0,
    vat: 0,
    paymentMethod: "Carta",
    documentType: "Scontrino",
    status: "Verificata",
    uploadedBy: "Mario Rossi",
  },
  {
    id: "exp-5",
    siteId: "site-barcelo-roma",
    jobId: "job-rifiuti",
    supplier: "Edil Nollo",
    description: "Acconto container macerie",
    date: "2026-04-09",
    amount: 2000,
    imponibile: 0,
    vat: 0,
    paymentMethod: "Bonifico",
    documentType: "FIR",
    status: "Verificata",
    uploadedBy: "Capo/Admin",
  },
  {
    id: "exp-6",
    siteId: "site-barcelo-roma",
    jobId: "job-mezzi",
    supplier: "Cifarelli Gomme Srl",
    description: "Pneumatici Bobcat - saldo fattura 583",
    date: "2026-04-08",
    amount: 565.01,
    imponibile: 0,
    vat: 0,
    paymentMethod: "Bonifico",
    documentType: "Bonifico",
    status: "Verificata",
    uploadedBy: "Capo/Admin",
  },
];

function cn() {
  return Array.from(arguments).filter(Boolean).join(" ");
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

function AppShell({ children, sidebar, header }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
          {sidebar}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            {header}
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={cn("rounded-3xl border border-slate-200 bg-white shadow-sm", className)}>{children}</div>;
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn("inline-flex items-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white", className)}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={cn("inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700", className)}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, icon: Icon, dark = false }) {
  return (
    <div className={cn("rounded-3xl border p-5 shadow-sm", dark ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={cn("text-xs uppercase tracking-[0.18em]", dark ? "text-slate-400" : "text-slate-500")}>{label}</div>
          <div className="mt-3 text-3xl font-semibold">{value}</div>
        </div>
        <div className={cn("rounded-2xl p-3", dark ? "bg-white/10" : "bg-slate-100")}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-top whitespace-nowrap">{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Sidebar({ nav, active, onChange, sites, activeSiteId, onSiteChange }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="rounded-3xl bg-slate-950 p-5 text-white">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Europa Service</div>
        <div className="mt-2 text-2xl font-semibold">Gestione cantieri</div>
        <div className="mt-2 text-sm text-slate-300">Sistema multi-cantiere con archivio digitale e struttura scalabile.</div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cantiere attivo</div>
        <select
          value={activeSiteId}
          onChange={(e) => onSiteChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const activeItem = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                activeItem ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-slate-900">Sistema automatico</div>
        <div className="mt-2 text-sm text-slate-600">Drive + Sheets + Form + Apps Script. Pronto per crescere con molti cantieri.</div>
      </div>
    </div>
  );
}

export default function MultiSiteAccountingApp() {
  const [activeView, setActiveView] = useState("dashboard");
  const [activeSiteId, setActiveSiteId] = useState("site-barcelo-roma");
  const [query, setQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const sites = sitesSeed;
  const activeSite = useMemo(() => sites.find((s) => s.id === activeSiteId) || sites[0], [activeSiteId]);

  const siteExpenses = useMemo(() => expensesSeed.filter((e) => e.siteId === activeSite.id), [activeSite]);
  const siteDocuments = useMemo(() => documentsSeed.filter((d) => d.siteId === activeSite.id), [activeSite]);

  const filteredExpenses = useMemo(() => {
    const q = query.toLowerCase();
    return siteExpenses.filter((e) =>
      [e.description, e.supplier, e.documentType, e.paymentMethod].join(" ").toLowerCase().includes(q)
    );
  }, [siteExpenses, query]);

  const totals = useMemo(() => ({
    total: siteExpenses.reduce((s, e) => s + e.amount, 0),
    imponibile: siteExpenses.reduce((s, e) => s + e.imponibile, 0),
    vat: siteExpenses.reduce((s, e) => s + e.vat, 0),
    docs: siteDocuments.length,
  }), [siteExpenses, siteDocuments]);

  const jobsWithStats = useMemo(() => {
    return activeSite.jobs.map((job) => {
      const expenses = siteExpenses.filter((e) => e.jobId === job.id);
      const docs = siteDocuments.filter((d) => d.jobId === job.id);
      return {
        ...job,
        total: expenses.reduce((s, e) => s + e.amount, 0),
        docs: docs.length,
        expenseCount: expenses.length,
      };
    });
  }, [activeSite, siteExpenses, siteDocuments]);

  const selectedJob = jobsWithStats.find((j) => j.id === selectedJobId) || null;
  const selectedJobDocuments = selectedJob ? siteDocuments.filter((d) => d.jobId === selectedJob.id) : [];
  const selectedDocument = siteDocuments.find((d) => d.id === selectedDocumentId) || null;
  const selectedDocumentExpenses = selectedDocument
    ? siteExpenses.filter((e) => selectedDocument.linkedExpenseIds.includes(e.id))
    : [];

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "sites", label: "Cantieri", icon: Building2 },
    { id: "expenses", label: "Spese", icon: Receipt },
    { id: "documents", label: "Documenti", icon: FolderOpen },
    { id: "automation", label: "Automazione", icon: HardDriveUpload },
  ];

  return (
    <AppShell
      sidebar={<Sidebar nav={nav} active={activeView} onChange={setActiveView} sites={sites} activeSiteId={activeSiteId} onSiteChange={setActiveSiteId} />}
      header={
        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Gestionale multi-cantiere</div>
            <div className="mt-1 text-xl font-semibold text-slate-950 lg:text-2xl">{activeSite.name}</div>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="relative w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca spese o documenti" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none" />
            </div>
            <PrimaryButton><Plus className="mr-2 h-4 w-4" />Nuova spesa</PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="px-4 pb-28 pt-5 lg:px-8 lg:pb-8">
        {activeView === "dashboard" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Stat label="Spese totali" value={formatCurrency(totals.total)} icon={Wallet} dark />
              <Stat label="Imponibile" value={formatCurrency(totals.imponibile)} icon={BarChart3} />
              <Stat label="IVA" value={formatCurrency(totals.vat)} icon={Receipt} />
              <Stat label="Documenti" value={String(totals.docs)} icon={FileText} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="p-5 lg:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">Lavorazioni del cantiere</div>
                    <div className="mt-1 text-sm text-slate-500">Vista chiara di costi e documenti per ogni lavoro.</div>
                  </div>
                  <button onClick={() => setActiveView("sites")} className="text-sm font-semibold text-slate-900">Apri tutto</button>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {jobsWithStats.map((job) => (
                    <button key={job.id} onClick={() => { setSelectedJobId(job.id); setActiveView("documents"); }} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-950">{job.name}</div>
                          <div className="mt-1 text-sm text-slate-500">{job.externalCompany || "Lavorazione interna"}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-2xl bg-white px-3 py-2">
                          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Spesa</div>
                          <div className="mt-1 text-sm font-semibold">{formatCurrency(job.total)}</div>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2">
                          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Spese</div>
                          <div className="mt-1 text-sm font-semibold">{job.expenseCount}</div>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-2">
                          <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Documenti</div>
                          <div className="mt-1 text-sm font-semibold">{job.docs}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-5 lg:p-6">
                <div className="text-lg font-semibold text-slate-950">Sistema organizzativo</div>
                <div className="mt-1 text-sm text-slate-500">Struttura pensata per molti cantieri senza perdere ordine.</div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Cartella cantiere", activeSite.folderPath, FolderOpen],
                    ["Master file", activeSite.masterFile, FileText],
                    ["Archivio documenti", "Fatture, bonifici, preventivi, contratti, foto, extra", HardDriveUpload],
                    ["Inserimento", "Google Form -> Apps Script -> Sheets + Drive", CheckCircle2],
                  ].map(([label, value, Icon]) => (
                    <div key={label} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                      <div className="rounded-2xl bg-white p-2"><Icon className="h-4 w-4" /></div>
                      <div>
                        <div className="text-sm font-semibold text-slate-950">{label}</div>
                        <div className="mt-1 text-sm text-slate-500">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeView === "sites" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-2xl font-semibold text-slate-950">Cantieri</div>
                <div className="mt-1 text-sm text-slate-500">Ogni cantiere ha file master, lavorazioni e archivio documenti.</div>
              </div>
              <PrimaryButton><Plus className="mr-2 h-4 w-4" />Nuovo cantiere</PrimaryButton>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {sites.map((site) => (
                <Card key={site.id} className="p-5 lg:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xl font-semibold text-slate-950">{site.name}</div>
                      <div className="mt-1 text-sm text-slate-500">Cliente: {site.client} • {site.city}</div>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", site.status === "Attivo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700")}>{site.status}</span>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Cartella</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900 break-all">{site.folderPath}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Master</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900 break-all">{site.masterFile}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <SecondaryButton onClick={() => setActiveSiteId(site.id)}>Apri cantiere</SecondaryButton>
                    <SecondaryButton>Duplica template</SecondaryButton>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === "expenses" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-2xl font-semibold text-slate-950">Spese</div>
                <div className="mt-1 text-sm text-slate-500">Registro spese unico del cantiere selezionato.</div>
              </div>
              <div className="flex gap-3">
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca nel registro spese" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none" />
                </div>
                <SecondaryButton><Filter className="mr-2 h-4 w-4" />Filtri</SecondaryButton>
              </div>
            </div>

            <Table
              columns={[
                { key: "date", label: "Data" },
                { key: "job", label: "Lavorazione" },
                { key: "description", label: "Descrizione" },
                { key: "supplier", label: "Fornitore" },
                { key: "amount", label: "Totale" },
                { key: "paymentMethod", label: "Pagamento" },
                { key: "status", label: "Stato" },
              ]}
              rows={filteredExpenses.map((e) => ({
                date: formatDate(e.date),
                job: activeSite.jobs.find((j) => j.id === e.jobId)?.name || "-",
                description: e.description,
                supplier: e.supplier,
                amount: formatCurrency(e.amount),
                paymentMethod: e.paymentMethod,
                status: e.status,
              }))}
            />
          </motion.div>
        )}

        {activeView === "documents" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {!selectedJob ? (
              <>
                <div>
                  <div className="text-2xl font-semibold text-slate-950">Archivio documenti</div>
                  <div className="mt-1 text-sm text-slate-500">Scegli una lavorazione e apri tutti i documenti collegati a quel lavoro.</div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {jobsWithStats.map((job) => (
                    <button key={job.id} onClick={() => setSelectedJobId(job.id)} className="text-left">
                      <Card className="p-5 transition hover:-translate-y-0.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-slate-950">{job.name}</div>
                            <div className="mt-1 text-sm text-slate-500">{job.externalCompany || "Lavorazione interna"}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Documenti</div>
                            <div className="mt-1 text-xl font-semibold text-slate-950">{job.docs}</div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Totale</div>
                            <div className="mt-1 text-base font-semibold text-slate-950">{formatCurrency(job.total)}</div>
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </>
            ) : !selectedDocument ? (
              <>
                <div className="flex items-center gap-3">
                  <SecondaryButton onClick={() => setSelectedJobId(null)}><ArrowLeft className="mr-2 h-4 w-4" />Indietro</SecondaryButton>
                  <div>
                    <div className="text-2xl font-semibold text-slate-950">{selectedJob.name}</div>
                    <div className="mt-1 text-sm text-slate-500">Documenti collegati alla lavorazione selezionata.</div>
                  </div>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {selectedJobDocuments.map((doc) => (
                    <button key={doc.id} onClick={() => setSelectedDocumentId(doc.id)} className="text-left">
                      <Card className="p-5 transition hover:-translate-y-0.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                              <FileText className="h-4 w-4" />
                              {doc.fileName}
                            </div>
                            <div className="mt-2 text-sm text-slate-500">{doc.supplier} • {doc.type} • {doc.documentNumber}</div>
                          </div>
                          <Eye className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-2xl bg-slate-50 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Data</div>
                            <div className="mt-1 text-sm font-semibold text-slate-950">{formatDate(doc.uploadedAt)}</div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Importo</div>
                            <div className="mt-1 text-sm font-semibold text-slate-950">{formatCurrency(doc.amount)}</div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-3 py-2">
                            <div className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Cartella</div>
                            <div className="mt-1 truncate text-sm font-semibold text-slate-950">{doc.folder.split("/").slice(-1)[0]}</div>
                          </div>
                        </div>
                      </Card>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <SecondaryButton onClick={() => setSelectedDocumentId(null)}><ArrowLeft className="mr-2 h-4 w-4" />Indietro</SecondaryButton>
                  <div>
                    <div className="text-2xl font-semibold text-slate-950">Documento</div>
                    <div className="mt-1 text-sm text-slate-500">Archivio digitale del file selezionato.</div>
                  </div>
                </div>
                <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                      <FileText className="h-5 w-5" />
                      {selectedDocument.fileName}
                    </div>
                    <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
                        <Eye className="h-6 w-6 text-slate-500" />
                      </div>
                      <div className="mt-4 text-lg font-semibold text-slate-950">Anteprima documento</div>
                      <div className="mt-2 text-sm text-slate-500">Qui puoi mostrare PDF, immagini o scansioni quando i file saranno serviti da Drive pubblico o cartella public/docs del sito.</div>
                      <div className="mt-4 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">{selectedDocument.fileName}</div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <Card className="p-5">
                      <div className="text-lg font-semibold text-slate-950">Dettagli documento</div>
                      <div className="mt-4 space-y-3">
                        {[
                          ["Tipo", selectedDocument.type],
                          ["Fornitore", selectedDocument.supplier],
                          ["Numero documento", selectedDocument.documentNumber],
                          ["Data", formatDate(selectedDocument.uploadedAt)],
                          ["Importo", formatCurrency(selectedDocument.amount)],
                          ["Cartella", selectedDocument.folder],
                        ].map(([label, value]) => (
                          <div key={label} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                            <div className="text-sm text-slate-500">{label}</div>
                            <div className="text-sm font-semibold text-right text-slate-950 break-all">{value}</div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-5">
                      <div className="text-lg font-semibold text-slate-950">Spese collegate</div>
                      <div className="mt-4 space-y-3">
                        {selectedDocumentExpenses.map((exp) => (
                          <div key={exp.id} className="rounded-2xl bg-slate-50 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-slate-950">{exp.description}</div>
                                <div className="mt-1 text-sm text-slate-500">{exp.supplier} • {formatDate(exp.date)}</div>
                              </div>
                              <div className="text-sm font-semibold text-slate-950">{formatCurrency(exp.amount)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeView === "automation" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <div className="text-2xl font-semibold text-slate-950">Sistema automatico</div>
              <div className="mt-1 text-sm text-slate-500">Flusso consigliato per crescere senza perdere ordine: Drive + Sheets + Form + Apps Script.</div>
            </div>
            <div className="grid gap-4 xl:grid-cols-4">
              {[
                ["1. Nuova spesa", "Google Form compilato da capo o dipendente", HardDriveUpload],
                ["2. Archivio", "File rinominato e spostato nella cartella giusta", FolderOpen],
                ["3. Registro", "Riga aggiunta in Registro_Spese", Receipt],
                ["4. Documenti", "Riga aggiunta in Documenti", FileText],
              ].map(([title, desc, Icon]) => (
                <Card key={title} className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100"><Icon className="h-5 w-5" /></div>
                  <div className="mt-4 text-lg font-semibold text-slate-950">{title}</div>
                  <div className="mt-2 text-sm text-slate-500">{desc}</div>
                </Card>
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="p-6">
                <div className="text-lg font-semibold text-slate-950">Struttura cantiere standard</div>
                <div className="mt-4 rounded-3xl bg-slate-50 p-5 font-mono text-sm leading-7 text-slate-700">
                  Cantieri/<br />
                  &nbsp;&nbsp;Barcelo-Roma/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;00_Master/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Barcelo-Roma_Master.xlsx<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;01_Documenti/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01_Fatture/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;02_Bonifici/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;03_Preventivi/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;04_Contratti/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;05_Foto/<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;06_Extra/
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-lg font-semibold text-slate-950">Cosa fara il sito</div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-4">Leggere un file master per ogni cantiere.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Mostrare archivio documenti per lavorazione.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Aprire documento, dettagli e spese collegate.</div>
                  <div className="rounded-2xl bg-slate-50 p-4">Scalare facilmente a molti cantieri con lo stesso schema.</div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium", active ? "bg-slate-900 text-white" : "text-slate-500")}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
