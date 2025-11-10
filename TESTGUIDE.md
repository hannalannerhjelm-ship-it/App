# 🧪 Testguide för Karate Läromaterial App

## 📋 Snabbstart för testning

### Steg 1: Förberedelser

1. **Installera beroenden** (om du inte redan gjort det):
```bash
npm install
```

2. **Skapa .env fil**:
```bash
cp .env.example .env
```

3. **Lägg till din Anthropic API-nyckel** i `.env`:
```
ANTHROPIC_API_KEY=sk-ant-din-nyckel-här
PORT=3000
```

### Steg 2: Starta appen

```bash
npm run dev
```

Du bör se:
```
> server@1.0.0 server
> nodemon server/index.js

Server running on port 3000

  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Steg 3: Öppna i webbläsare

Gå till: `http://localhost:5173`

---

## 🎯 Funktioner att testa

### 1. ✅ Filuppladdning med Drag & Drop

**Test A: Drag & Drop**
- Dra filen `test-material-karate.txt` från projektmappen
- Släpp den över uppladdningsområdet
- Filens namn och storlek ska visas

**Test B: Klicka för att välja fil**
- Klicka på uppladdningsområdet
- Välj `test-material-karate.txt` från filväljaren
- Verifiera att filen laddats

**Test C: Fel filformat**
- Försök ladda upp en `.jpg` eller `.mp3` fil
- Du ska få felmeddelande: "Endast .txt, .pdf, .docx filer är tillåtna"

---

### 2. ✅ SBA (Single Best Answer) Frågor

**Test:**
1. Ladda upp `test-material-karate.txt`
2. Välj **Frågetyp: SBA**
3. Sätt **Antal frågor: 5**
4. Klicka **Generera Frågor**
5. Vänta 10-30 sekunder

**Förväntad:**
- 5 frågor genereras
- Varje fråga har 4-5 svarsalternativ (A, B, C, D)
- Endast ETT rätt svar per fråga
- Förklaring visas efter svar

**Testa interaktion:**
- Klicka på ett svarsalternativ → det markeras blått
- Klicka på ett annat alternativ → det nya markeras istället (endast ett val)
- Klicka **Kontrollera Svar**
- Rätt svar blir grönt, fel svar blir rött
- Förklaring visas

---

### 3. ✅ MCQ (Multiple Choice Questions) Frågor

**Test:**
1. Ladda upp `test-material-karate.txt` igen (eller klicka "Ladda upp ny fil")
2. Välj **Frågetyp: MCQ**
3. Sätt **Antal frågor: 3**
4. Klicka **Generera Frågor**

**Förväntad:**
- 3 frågor genereras
- Varje fråga har 4-5 svarsalternativ
- KAN ha FLERA rätta svar
- Du kan välja flera alternativ samtidigt

**Testa interaktion:**
- Klicka på flera alternativ → alla markeras blått
- Klicka igen för att avmarkera
- Alla rätta svar måste väljas för att få rätt

---

### 4. ✅ Navigation mellan frågor

**Test:**
- Klicka **Nästa →** för att gå till nästa fråga
- Klicka **← Föregående** för att gå tillbaka
- Dina svar ska sparas när du navigerar
- "Nästa" är inaktiverad på sista frågan
- "Föregående" är inaktiverad på första frågan

**Visuell feedback:**
- **Fråga X av Y** ska uppdateras
- Framstegsindikatorn visar vilken fråga du är på

---

### 5. ✅ Poängberäkning

**Test:**
1. Svara på alla frågor
2. På sista frågan, klicka **Visa Resultat**

**Förväntad:**
- En resultatruta visas högst upp
- Visar: "Du fick X av Y rätt (Z%)"
- Lila gradient bakgrund
- Du kan fortfarande navigera och se dina svar

---

### 6. ✅ Exportera frågor

**Test:**
1. Efter att ha genererat frågor
2. Klicka **📥 Exportera Frågor**

**Förväntad:**
- En `.txt` fil laddas ner
- Filnamn: `karate-fragor-SBA-[timestamp].txt` eller `karate-fragor-MCQ-[timestamp].txt`
- Filen innehåller:
  - Alla frågor numrerade
  - Alla svarsalternativ
  - Rätta svar
  - Förklaringar

---

### 7. ✅ Responsiv design

**Test A: Desktop**
- Appen ska vara centrerad
- Allt innehåll läsbart

**Test B: Mobil**
1. Öppna Chrome DevTools (F12)
2. Klicka på "Toggle device toolbar" (eller Ctrl+Shift+M)
3. Välj en mobilenhet (t.ex. iPhone 12)

**Förväntad:**
- Layout anpassar sig
- Knappar staplas vertikalt
- Text är läsbar utan att zooma

---

### 8. ✅ Felhantering

**Test A: För liten fil**
1. Skapa en fil med bara "test" i (< 100 tecken)
2. Försök generera frågor

**Förväntad:**
- Fel: "Filen innehåller för lite text för att generera frågor"

**Test B: Ingen fil vald**
1. Klicka **Generera Frågor** utan att välja fil

**Förväntad:**
- Knappen är inaktiverad (grå)

**Test C: För många frågor**
1. Ladda upp `test-material-karate.txt`
2. Sätt antal frågor till 20
3. Generera

**Förväntad:**
- Appen försöker generera 20 frågor
- AI:n kanske genererar färre om materialet inte räcker

---

## 🔍 Backend API Testing

### Test API direkt (i ny terminal)

**Health check:**
```bash
curl http://localhost:3000/api/health
```

**Förväntat svar:**
```json
{"status":"ok","message":"Karate Learning Material API is running"}
```

**Upload test med curl:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-material-karate.txt" \
  -F "questionType=SBA" \
  -F "numQuestions=3"
```

---

## 🎨 UI/UX Funktioner att notera

### Visuella effekter:
- ✨ Hover-effekt på knappar
- 🎨 Färgkodning:
  - Blå = Valt alternativ
  - Grön = Rätt svar
  - Röd = Fel svar
  - Lila gradient = Resultat
- 🔄 Smooth övergångar
- 📱 Responsiv på alla skärmstorlekar

### Användarvänlighet:
- 📁 Drag & drop uppladdning
- 🔢 Frågeräknare
- 📊 Procentuell poäng
- 💾 Exportfunktion
- 🔄 Reset-knapp för att börja om

---

## 📝 Checklista för komplett testning

- [ ] Installera beroenden
- [ ] Konfigurera .env med API-nyckel
- [ ] Starta appen (npm run dev)
- [ ] Testa filuppladdning (drag & drop)
- [ ] Testa filuppladdning (klicka)
- [ ] Generera SBA-frågor (5 st)
- [ ] Svara på SBA-frågor
- [ ] Kontrollera att endast ett svar kan väljas
- [ ] Generera MCQ-frågor (3 st)
- [ ] Svara på MCQ-frågor
- [ ] Kontrollera att flera svar kan väljas
- [ ] Navigera fram och tillbaka mellan frågor
- [ ] Visa resultat/poäng
- [ ] Exportera frågor till fil
- [ ] Testa på mobil (DevTools)
- [ ] Testa felhantering (fel filformat)
- [ ] Testa felhantering (för liten fil)
- [ ] Testa API health endpoint
- [ ] Reset och ladda upp ny fil

---

## 🐛 Vanliga problem

### Problem: "Cannot find module '@anthropic-ai/sdk'"
**Lösning:**
```bash
npm install
```

### Problem: "Error: Invalid API key"
**Lösning:**
- Kontrollera att `.env` filen finns
- Kontrollera att API-nyckeln är korrekt kopierad
- Ingen extra mellanslag i .env
- Starta om servern efter att ha ändrat .env

### Problem: "Port 3000 is already in use"
**Lösning:**
- Ändra PORT i .env till 3001
- Eller stäng andra appar som använder port 3000

### Problem: "Failed to fetch"
**Lösning:**
- Kontrollera att både backend och frontend körs
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 📊 Prestandatestning

### Tidsmätning:
- Filuppladdning: < 1 sekund
- Textextraktion (PDF): 2-5 sekunder
- AI-generering (5 frågor): 10-30 sekunder
- Svarstid för kontroll: < 0.1 sekunder

### Kapacitet:
- Max filstorlek: 10 MB
- Max antal frågor: 20
- Stödda format: .txt, .pdf, .docx

---

## ✅ Fungerande app = Alla test klarade!

När alla test ovan fungerar har du en fullt fungerande karate läromaterial-app! 🥋
