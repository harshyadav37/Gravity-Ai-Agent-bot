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
import { AgentConfig, db, tools } from "@/db";
import { currentUser } from "@clerk/nextjs/server";

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
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const aiTools = await db
    .select({ slug: tools.slug })
    .from(tools);
  const availableTools = aiTools.map(({ slug }) => slug).join("\n- ");

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model: MODEL,
        input: AgentConfigSystemPrompt
          .replace("{USER_PROMPT}", prompt)
          .replace("{AVAILABLE_TOOLS}", availableTools),
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: AgentConfigRespSchema,
        },
        generation_config: {
          thinking_level: "medium",
        },
      });

      const outputText = interaction.output_text?.trim();

      if (!outputText) {
        throw new Error("The AI model returned an empty response");
      }


      const aiOutput = JSON.parse(outputText);

      if (aiOutput.status === "ready") {
        const agentId = crypto.randomUUID();
        const dbResult = await db
          .insert(AgentConfig)
          .values({
            ...aiOutput.config,
            agentImage:
              "https://api.dicebear.com/10.x/clay/svg?tags=animation&seed=" +
              agentId,
            agentId,
            userEmail: user.primaryEmailAddress.emailAddress,
          })
          .returning();

        return NextResponse.json(
          { ...aiOutput, agent: dbResult[0] },
          { status: 200 }
        );
      }

      return NextResponse.json(aiOutput, { status: 200 });
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