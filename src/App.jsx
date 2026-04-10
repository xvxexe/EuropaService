import { useState, useEffect } from "react";

export default function App() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [data, setData] = useState(null);

  const API_URL = "https://script.google.com/macros/s/AKfycbz0EWvBcz3m45D_FuFd6iU70ZjV1ikyLa_zEcP_0ZmB4KTnzHbybx1p-QuS-5u9sZAL/exec";

const login = async () => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ password })
    });

    const json = await res.json();
    console.log(json);

    if (json.success) {
      setLogged(true);
      setData(json.data);
    } else {
      alert(json.message || "Password errata");
    }
  } catch (err) {
    console.error(err);
    alert("Errore di collegamento con Apps Script");
  }
};

  if (!logged) {
    return (
      <div style={{padding:40}}>
        <h2>Login</h2>
        <input value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={login}>Entra</button>
      </div>
    );
  }

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{padding:20}}>
      <h1>Dashboard</h1>
      <p>Totale spese: {data.expenses.reduce((a,b)=>a+Number(b.amount||0),0)}</p>

      <h2>Cantieri</h2>
      {data.sites.map(s=>(
        <div key={s.siteId} style={{border:"1px solid #ccc",margin:10,padding:10}}>
          <h3>{s.siteName}</h3>
          <p>{s.city}</p>
        </div>
      ))}
    </div>
  );
}
