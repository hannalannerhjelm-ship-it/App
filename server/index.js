import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
try {
  await fs.mkdir(uploadsDir, { recursive: true });
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.pdf', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Endast .txt, .pdf, .docx filer är tillåtna'));
    }
  }
});

// Initialize Anthropic client
const DEMO_MODE = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'ANGE_DIN_API_NYCKEL_HÄR';
const anthropic = DEMO_MODE ? null : new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

if (DEMO_MODE) {
  console.log('⚠️  Running in DEMO MODE - Using mock questions (no API key configured)');
} else {
  console.log('✓ Using Anthropic API for question generation');
}

// Extract text from different file types
async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  try {
    if (ext === '.txt') {
      return await fs.readFile(filePath, 'utf-8');
    } else if (ext === '.pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Kunde inte läsa innehållet från ${ext} filen`);
  }

  throw new Error('Filtyp stöds ej');
}

// Generate mock questions for demo mode
function generateMockQuestions(questionType, numQuestions = 5) {
  const sbaQuestions = [
    {
      question: "Vad betyder ordet 'karate' på japanska?",
      options: ["A) Kraftfull hand", "B) Tom hand", "C) Snabb hand", "D) Stark hand"],
      correctAnswer: "B",
      explanation: "Karate betyder 'tom hand' och avser att man kämpar utan vapen."
    },
    {
      question: "Vem anses vara modern karates fader?",
      options: ["A) Mas Oyama", "B) Gichin Funakoshi", "C) Kenwa Mabuni", "D) Hironori Ohtsuka"],
      correctAnswer: "B",
      explanation: "Gichin Funakoshi spred karate till Japan på 1920-talet och anses vara modern karates fader."
    },
    {
      question: "Vilket bälte har en nybörjare i karate?",
      options: ["A) Gult bälte", "B) Orange bälte", "C) Vitt bälte", "D) Brunt bälte"],
      correctAnswer: "C",
      explanation: "Vitt bälte (9:e kyu) är för nybörjare som just börjat träna karate."
    },
    {
      question: "Vad heter en framspark på japanska?",
      options: ["A) Yoko-geri", "B) Mawashi-geri", "C) Mae-geri", "D) Ushiro-geri"],
      correctAnswer: "C",
      explanation: "Mae-geri är den japanska termen för framspark, en av de grundläggande sparkarna i karate."
    },
    {
      question: "Vad kallas träningssalen i karate?",
      options: ["A) Dojo", "B) Tatami", "C) Sensei", "D) Kata"],
      correctAnswer: "A",
      explanation: "Dojo är den japanska termen för träningssal där karate utövas."
    }
  ];

  const mcqQuestions = [
    {
      question: "Vilka av följande är grundläggande tekniker i karate? (Välj alla som stämmer)",
      options: ["A) Tsuki (slag)", "B) Geri (sparkar)", "C) Uke (block)", "D) Judo (kast)"],
      correctAnswers: ["A", "B", "C"],
      explanation: "Tsuki (slag), Geri (sparkar) och Uke (block) är alla grundläggande tekniker i karate. Judo är en annan kampsport."
    },
    {
      question: "Vilka färger på bälten finns i karate-graderingssystemet? (Välj alla som stämmer)",
      options: ["A) Vitt", "B) Gult", "C) Grönt", "D) Silver"],
      correctAnswers: ["A", "B", "C"],
      explanation: "Vitt, gult och grönt är alla vanliga bältesfärger i karate. Silver används normalt inte."
    },
    {
      question: "Vilka av dessa är typer av kumite (sparring)?",
      options: ["A) Kihon kumite", "B) Jiyu kumite", "C) Ippon kumite", "D) Heian kumite"],
      correctAnswers: ["A", "B", "C"],
      explanation: "Kihon kumite (grundläggande), Jiyu kumite (fri) och Ippon kumite (en-stegs) är alla typer av sparring. Heian är kata, inte kumite."
    }
  ];

  const questions = questionType === 'SBA' ? sbaQuestions : mcqQuestions;
  const selectedQuestions = questions.slice(0, Math.min(numQuestions, questions.length));

  return { questions: selectedQuestions };
}

// Generate questions using Claude
async function generateQuestions(text, questionType, numQuestions = 5) {
  // Use mock data in demo mode
  if (DEMO_MODE) {
    console.log('Using mock questions (demo mode)');
    return generateMockQuestions(questionType, numQuestions);
  }
  const sbaPrompt = `Analysera följande läromaterial om karate och generera ${numQuestions} Single Best Answer (SBA) frågor.

SBA-format:
- En fråga med 4-5 svarsalternativ
- Endast ETT rätt svar
- Svarsalternativen ska vara plausibla men endast ett helt korrekt
- Inkludera en kort förklaring till det rätta svaret

Läromaterial:
${text}

Generera frågorna i följande JSON-format:
{
  "questions": [
    {
      "question": "Frågetexten här",
      "options": ["A) Alternativ 1", "B) Alternativ 2", "C) Alternativ 3", "D) Alternativ 4"],
      "correctAnswer": "A",
      "explanation": "Förklaring till varför detta är rätt svar"
    }
  ]
}`;

  const mcqPrompt = `Analysera följande läromaterial om karate och generera ${numQuestions} Multiple Choice Questions (MCQ) frågor.

MCQ-format:
- En fråga med 4-5 svarsalternativ
- KAN ha flera rätta svar
- Svarsalternativen ska vara relevanta
- Inkludera en kort förklaring till de rätta svaren

Läromaterial:
${text}

Generera frågorna i följande JSON-format:
{
  "questions": [
    {
      "question": "Frågetexten här",
      "options": ["A) Alternativ 1", "B) Alternativ 2", "C) Alternativ 3", "D) Alternativ 4"],
      "correctAnswers": ["A", "C"],
      "explanation": "Förklaring till varför dessa är rätt svar"
    }
  ]
}`;

  const prompt = questionType === 'SBA' ? sbaPrompt : mcqPrompt;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Kunde inte tolka svaret från AI');
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new Error('Fel vid generering av frågor: ' + error.message);
  }
}

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ingen fil uppladdad' });
    }

    const { questionType = 'SBA', numQuestions = 5 } = req.body;

    // Extract text from uploaded file
    const text = await extractText(req.file.path, req.file.originalname);

    if (!text || text.trim().length < 100) {
      await fs.unlink(req.file.path); // Clean up
      return res.status(400).json({ error: 'Filen innehåller för lite text för att generera frågor' });
    }

    // Generate questions
    const questions = await generateQuestions(text, questionType, parseInt(numQuestions));

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      questionType,
      ...questions
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      error: error.message || 'Ett fel uppstod vid uppladdning och bearbetning av filen'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Karate Learning Material API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
