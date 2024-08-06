import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req) {
  try {
    const data = await req.json();
    const prompt =
      data.prompt || "Please respond to all quieries in a consice way";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const textUint8Array = encoder.encode(text);
          controller.enqueue(textUint8Array);
        } catch (err) {
          console.error("Error during streaming:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, {
      status: 500,
    });
  }
}