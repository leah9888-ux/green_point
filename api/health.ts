
export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  return res.status(200).json({
    status: "ok",
    service: "GREEN POINT API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
}
