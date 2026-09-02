export async function GET() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}` }
    });
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
