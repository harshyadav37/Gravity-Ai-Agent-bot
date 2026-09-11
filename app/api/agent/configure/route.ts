// import { NextResponse, NextRequest } from "next/server";
// import { GoogleGenAI, ThinkingLevel } from "@google/genai";
// import { AgentConfigSystemPrompt } from "@/data/Prompt";
// import { AgentConfigRespSchema } from "@/data/ResponseSchema";

// const MODEL = "gemini-2.5-pro";
// const MAX_ATTEMPTS = 3;

// function isRetryableModelError(error: any) {
//   const code = error?.code ?? error?.statusCode ?? error?.error?.code;
//   const status = error?.status ?? error?.error?.status;
//   const message = error?.message ?? error?.error?.message ?? "";

//   return (
//     code === 429 ||
//     code === 503 ||
//     status === "UNAVAILABLE" ||
//     status === "RESOURCE_EXHAUSTED" ||
//     /currently experiencing high demand|too many requests|retry later/i.test(message)
//   );
// }

// function parseModelText(text: string | undefined) {
//   const raw = text ?? "{}";
//   const cleaned = raw
//     .replace(/```json\s*/gi, "")
//     .replace(/```/g, "")
//     .trim();

//   return JSON.parse(cleaned);
// }

// export async function POST(req: NextRequest) {
//   const { prompt } = await req.json();

//   if (!prompt?.trim()) {
//     return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
//   }

//   const apiKey = process.env.GOOGLE_CLOUD_GEMINI_KEY;
//   if (!apiKey) {
//     return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
//   }

//   const ai = new GoogleGenAI({ apiKey });
//   let lastError: unknown = null;

//   for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
//     try {
//       const response = await ai.models.generateContent({
//         model: MODEL,
//         contents: AgentConfigSystemPrompt.replace("{USER_PROMPT}", prompt),
//         config: {
//           thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
//           responseMimeType: "application/json",
//           responseSchema: AgentConfigRespSchema,
//         },
//       });

//       return NextResponse.json(parseModelText(response.text), { status: 200 });
//     } catch (error) {
//       lastError = error;
//       console.error(`Error in /api/agent/configure attempt ${attempt}/${MAX_ATTEMPTS}:`, error);

//       if (!isRetryableModelError(error) || attempt === MAX_ATTEMPTS) {
//         break;
//       }
//     }
//   }

//   console.error("Error in /api/agent/configure:", lastError);
//   return NextResponse.json(
//     {
//       error: "The AI model is temporarily unavailable. Please try again in a moment.",
//     },
//     { status: 503 }
//   );
// }


import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AgentConfigSystemPrompt } from "@/data/Prompt";
import { AgentConfigRespSchema } from "@/data/ResponseSchema";

const MODEL = "gemini-3.6-flash";
const MAX_ATTEMPTS = 3;

function isRetryableModelError(error: any) {
  const code = error?.code ?? error?.statusCode ?? error?.error?.code;
  const status = error?.status ?? error?.error?.status;
  const message = error?.message ?? error?.error?.message ?? "";

  return (
    code === 429 ||
    code === 503 ||
    status === "UNAVAILABLE" ||
    status === "RESOURCE_EXHAUSTED" ||
    /currently experiencing high demand|too many requests|retry later/i.test(message)
  );
}

function isRetiredModelError(error: any) {
  const message = error?.message ?? error?.error?.message ?? "";
  return /no longer available to new users|no longer supported|has reached its end of life|deprecated|retired/i.test(message);
}

export async function POST(req: NextRequest) {
  let prompt: string | undefined;

  try {
    const body = await req.json();
    prompt = body?.prompt;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_CLOUD_GEMINI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is not configured" },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model: MODEL,
        input: AgentConfigSystemPrompt.replace("{USER_PROMPT}", () => prompt!),
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: AgentConfigRespSchema,
        },
        generation_config: {
          thinking_level: "medium",
        },
      });

      return NextResponse.json(
        JSON.parse(interaction.output_text),
        { status: 200 }
      );
    } catch (error: any) {
      lastError = error;
      console.error(
        `Error in /api/agent/configure attempt ${attempt}/${MAX_ATTEMPTS}:`,
        error
      );

      // Fail fast on retired models — don't waste retries
      if (isRetiredModelError(error)) {
        return NextResponse.json(
          {
            error: "Model has been retired",
            detail: error?.message ?? String(error),
          },
          { status: 410 }
        );
      }

      if (!isRetryableModelError(error)) {
        const detail =
          error?.message ?? error?.error?.message ?? "Unknown model error";
        return NextResponse.json(
          { error: "AI request failed", detail },
          { status: 400 }
        );
      }

      if (attempt === MAX_ATTEMPTS) {
        break;
      }
    }
  }

  console.error("Error in /api/agent/configure (retries exhausted):", lastError);
  return NextResponse.json(
    {
      error:
        "The AI model is temporarily unavailable. Please try again in a moment.",
      detail:
        process.env.NODE_ENV === "development"
          ? (lastError as any)?.message ?? String(lastError)
          : undefined,
    },
    { status: 503 }
  );
}