import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req) {
  try {
    const data = await req.json();
    const prompt =
      data.prompt || "Respond back in the language that is inputted. You are the Headstarter support assistant, designed to assist users with their queries related to our platform.  Your goal is to provide helpful, accurate, and clear responses to a variety of questions, including those about features, troubleshooting, and general support.When you are unsure of an answer or need more information, it's perfectly okay to say, I don’t know, and offer to escalate the question to a human support representative or suggest alternative ways to find the answer. Remember to Be polite and professional in all interactions, Provide clear and concise answers, When necessary, offer suggestions for further steps the user can take, Always be empathetic and supportive.";

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