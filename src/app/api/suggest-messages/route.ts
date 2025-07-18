// import { openai } from '@ai-sdk/openai';
// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;
// export async function POST(req: Request) {
//   const prompt = {"Create the sentence that best describes the following text": "The quick brown fox jumps over the lazy dog."};
//   const response= await openai.completions.create({
//     model: openai('gpt-4o'),
//     max_tokens: 400,
//     stream:true,
//     prompt
//   });
//   return response.toDataStreamResponse();
// }