import server from "bunrest";
import cors from "buncors";
import { NotionAPILoader } from "langchain/document_loaders/web/notionapi";
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import axios from "axios";
import { combineDocuments, linkedInProfileToText } from "./utils";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

/**
 *
 * Server setup
 *
 */
const app = server();
app.use(cors());

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

/**
 *
 * contstants
 *
 */
// notion
const NOTION_API_KEY = "secret_TBjmOS6LRKxZKWHtnI2PgGaMwtbKZaeiKdtZK6pMpxT";
const PAGE_ID = "20f1bbafd1c94345a2031351db765f3f";

// supabase
const SUPABASE_PROJECT_URL = "https://sxwlhqdqdbneyqrmeeid.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4d2xocWRxZGJuZXlxcm1lZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2NzA0OTcsImV4cCI6MjAyODI0NjQ5N30.ooWTE4M8qRqa7NjQZMCsgT9jooKNG0WNpTqZ-zhQp8U";
const SUPABASE_TABLE_NAME = "documents";

// openai
const OPENAI_KEY = "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";

// langchain
const CHUNK_SIZE = 500;
const SEPARATORS = ["\n\n", "\n", " ", ""];
const CHUNK_OVERLAP = 50;

// others
const LINKEDIN_USER = "gcalabria";

/**
 *
 *
 * global instances
 *
 */
// langchain
const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_KEY });
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  separators: SEPARATORS,
  chunkOverlap: CHUNK_OVERLAP,
});
const llm = new ChatOpenAI({ openAIApiKey: OPENAI_KEY });

// prompt template
const standaloneQuestionTemplate =
  "Given a question, convert it into a standalone question. Question: {question} Standalone question:";

// answer template
const answerTemplate = `
You are Guilherme Calabria Lopes, a helpful and enthusiastic support
bot who can answer questions about your career. You are a also a
computer scientist specialized in AI Engineering. Try to find the
answer in the context. If you really do not know the answer, then say
"I am sorry, I do not know the answer for that." Do not try to make up
an answer. Speak as if you were chatting to a friend.
context: {context}
question: {question}
answer:
`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

// prompt
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

// supabase
const supabaseClient = createClient(SUPABASE_PROJECT_URL, SUPABASE_API_KEY);
const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabaseClient,
  tableName: SUPABASE_TABLE_NAME,
});
const retriever = vectorStore.asRetriever();

// chains
const standaloneQuestionChain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser());
const retrieverChain = RunnableSequence.from([
  (prevResult) => prevResult.standalone_question,
  retriever,
  combineDocuments,
]);
const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

// link up chain with .pipe methods
const chain = RunnableSequence.from([
  {
    standalone_question: standaloneQuestionChain,
    original_input: new RunnablePassthrough(),
  },
  {
    context: retrieverChain,
    question: ({ original_input }) => original_input.question,
  },
  answerChain,
]);

/**
 *
 *
 * routes
 *
 */
app.get("/api/notion", async (req, res) => {
  const pageLoader = new NotionAPILoader({
    clientOptions: {
      auth: NOTION_API_KEY,
    },
    id: PAGE_ID,
    type: "page",
  });

  const pageDocs = await pageLoader.loadAndSplit();

  const vectorStore = await SupabaseVectorStore.fromDocuments(
    pageDocs,
    embeddings,
    {
      client: supabaseClient,
      tableName: SUPABASE_TABLE_NAME,
    }
  );
  console.log(vectorStore);

  res.status(200).json(pageDocs);
});

app.get("/api/linkedin", async (req, res) => {
  // Crawl linkedin profile
  const response = await axios.get("https://linkedin-api8.p.rapidapi.com/", {
    headers: {
      "X-RapidAPI-Key": "b551f4841amsh8279ccf4c2a4582p1937c2jsnd5fea3ce5a6b",
      "X-RapidAPI-Host": "linkedin-api8.p.rapidapi.com",
    },
    params: {
      username: LINKEDIN_USER,
    },
  });

  // Add documents (linkedin profile) to supabase vectorstore
  const profile = response.data;
  const text = linkedInProfileToText(profile);
  const output = await splitter.createDocuments([text]);
  const vectorStore = await SupabaseVectorStore.fromDocuments(
    output,
    embeddings,
    {
      client: supabaseClient,
      tableName: SUPABASE_TABLE_NAME,
    }
  );

  res.status(200).json(vectorStore);
});

app.post("/api/answer", async (req, res) => {
  if (typeof req.body === "object") {
    const question = req.body.question;
    const answer = await chain.invoke({
      question: question,
    });

    res.status(201).json({ answer });
  } else {
    res.status(400).json({ error: "Invalid question" });
  }
});
