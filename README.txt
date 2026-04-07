Progetto separato in file veri .js

Struttura principale:
- src/data/authData.js
- src/data/siteData.js
- src/data/recordsData.js
- src/utils/formatters.js
- src/App.jsx

Quando vorrai aggiungere nuove spese, nella maggior parte dei casi basterà modificare:
src/data/recordsData.js

Avvio locale:
npm install
npm run dev
