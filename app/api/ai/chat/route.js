export async function POST(request) {
  try {
    const { message } = await request.json();
    if (!message) return Response.json({ text: "" }, { status: 400 });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }],
        max_tokens: 2048,
        temperature: 1
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq error:", data);
      return Response.json({ error: data.error?.message, text: "" }, { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content || "";
    console.log("Groq success!");
    return Response.json({ text });

  } catch (error) {
    console.error("Route error:", error);
    return Response.json({ error: error.message, text: "" }, { status: 500 });
  }
}
