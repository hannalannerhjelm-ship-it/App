# 🥋 Karate Läromaterial App

En intelligent app för att ladda upp karate läromaterial och automatiskt generera testfrågor enligt SBA och MCQ standarder med hjälp av AI.

## 📋 Funktioner

- **Filuppladdning**: Stöd för `.txt`, `.pdf`, `.docx` filer
- **Drag & Drop**: Enkel användargränssnitt för att ladda upp filer
- **AI-genererade frågor**: Använder Claude AI för att skapa relevanta testfrågor
- **Två frågetyper**:
  - **SBA (Single Best Answer)**: Frågor med endast ett rätt svar
  - **MCQ (Multiple Choice Questions)**: Frågor med möjlighet till flera rätta svar
- **Interaktiv testtaker**: Svara på frågor och få omedelbar feedback
- **Poängberäkning**: Se hur många frågor du svarade rätt på
- **Exportfunktion**: Ladda ner alla frågor som en textfil
- **Responsiv design**: Fungerar på både desktop och mobila enheter

## 🚀 Installation

### Förutsättningar

- Node.js (version 18 eller senare)
- npm eller yarn
- Anthropic API-nyckel

### Steg 1: Klona projektet

```bash
cd App
```

### Steg 2: Installera beroenden

```bash
npm install
```

### Steg 3: Konfigurera miljövariabler

Skapa en `.env` fil i root-katalogen:

```bash
cp .env.example .env
```

Redigera `.env` och lägg till din Anthropic API-nyckel:

```
ANTHROPIC_API_KEY=din_api_nyckel_här
PORT=3000
```

För att få en API-nyckel:
1. Gå till [https://console.anthropic.com/](https://console.anthropic.com/)
2. Skapa ett konto eller logga in
3. Navigera till API Keys
4. Skapa en ny API-nyckel

### Steg 4: Starta appen

```bash
npm run dev
```

Detta startar både backend-servern (port 3000) och frontend utvecklingsservern (port 5173).

Öppna din webbläsare och gå till: `http://localhost:5173`

## 📖 Användning

1. **Ladda upp läromaterial**:
   - Klicka på uppladdningsområdet eller dra och släpp en fil
   - Accepterade format: `.txt`, `.pdf`, `.docx`
   - Max filstorlek: 10 MB

2. **Välj frågetyp**:
   - **SBA**: Frågor med endast ett rätt svar (bäst för fakta-baserade frågor)
   - **MCQ**: Frågor med flera möjliga rätta svar

3. **Ange antal frågor**:
   - Välj mellan 1-20 frågor
   - Standard: 5 frågor

4. **Generera frågor**:
   - Klicka på "Generera Frågor"
   - AI:n analyserar materialet och skapar frågor
   - Detta kan ta 10-30 sekunder beroende på materialets längd

5. **Svara på frågor**:
   - Klicka på svarsalternativ för att välja
   - För MCQ kan du välja flera alternativ
   - Klicka "Kontrollera Svar" för att se om du hade rätt
   - Navigera mellan frågor med piltangenterna

6. **Se resultat**:
   - Klicka "Visa Resultat" efter sista frågan
   - Se din poäng och procentuell framgång

7. **Exportera**:
   - Klicka "📥 Exportera Frågor" för att ladda ner alla frågor som text
   - Filen innehåller frågor, alternativ, rätta svar och förklaringar

## 🏗️ Projektstruktur

```
App/
├── server/
│   └── index.js              # Express backend API
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx    # Filuppladdningskomponent
│   │   ├── FileUpload.css
│   │   ├── QuestionDisplay.jsx  # Frågevisningskomponent
│   │   └── QuestionDisplay.css
│   ├── App.jsx               # Huvudkomponent
│   ├── App.css
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styling
├── uploads/                  # Temporär lagring av uppladdade filer
├── .env                      # Miljövariabler (skapas av dig)
├── .env.example              # Exempel på miljövariabler
├── package.json
├── vite.config.js
└── index.html
```

## 🛠️ Teknologier

### Frontend
- React 18
- Vite (build tool)
- CSS3 (med moderna features)

### Backend
- Node.js
- Express.js
- Multer (filuppladdning)
- pdf-parse (PDF-bearbetning)
- mammoth (DOCX-bearbetning)

### AI
- Anthropic Claude API (Sonnet 4.5)

## 📝 API Endpoints

### POST /api/upload
Laddar upp en fil och genererar frågor.

**Request:**
- `multipart/form-data`
- `file`: Fil att ladda upp
- `questionType`: "SBA" eller "MCQ"
- `numQuestions`: Antal frågor (1-20)

**Response:**
```json
{
  "success": true,
  "questionType": "SBA",
  "questions": [
    {
      "question": "Frågetexten",
      "options": ["A) Alt 1", "B) Alt 2", "C) Alt 3", "D) Alt 4"],
      "correctAnswer": "A",
      "explanation": "Förklaring"
    }
  ]
}
```

### GET /api/health
Hälsokontroll för API:et.

## 🔒 Säkerhet

- Filvalidering: Endast tillåtna filtyper accepteras
- Filstorleksbegränsning: Max 10 MB
- Temporär fillagring: Uppladdade filer raderas efter bearbetning
- API-nyckel lagras säkert i miljövariabler

## 🐛 Felsökning

### "Kunde inte läsa innehållet från filen"
- Kontrollera att filen innehåller läsbar text
- PDF-filer kan ibland vara skannande bilder utan text
- Försök med en annan fil eller format

### "Ett fel uppstod vid generering av frågor"
- Kontrollera att din ANTHROPIC_API_KEY är korrekt
- Se till att du har tillräckligt med credits i ditt Anthropic-konto
- Kontrollera serverloggar för mer detaljerad information

### Backend startar inte
- Kontrollera att port 3000 inte används av en annan applikation
- Se till att alla npm-paket är installerade
- Kontrollera att .env filen existerar och innehåller rätt variabler

## 📈 Framtida förbättringar

- [ ] Stöd för fler filformat (Markdown, HTML)
- [ ] Databas för att spara genererade frågor
- [ ] Användarautentisering
- [ ] Historik över tidigare test
- [ ] Möjlighet att redigera genererade frågor
- [ ] Stöd för bilder i frågor
- [ ] Delning av frågesamlingar
- [ ] Flera språk (engelska, etc.)

## 📄 Licens

Detta projekt är skapat för utbildningsändamål.

## 🤝 Bidrag

Välkommen att bidra till projektet! Öppna en issue eller skicka en pull request.

## 📧 Support

För frågor eller problem, öppna en issue på GitHub.

---

Skapad med ❤️ för karateutövare
