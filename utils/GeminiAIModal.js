export const chatSession = {
  sendMessage: async (prompt) => {
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (!data.text) throw new Error(data.error || "Empty response");
      return { response: { text: () => data.text } };
    } catch (error) {
      console.error("AI call failed:", error);
      throw error;
    }
  },
  generateContent: async (prompt) => {
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (!data.text) throw new Error(data.error || "Empty response");
      return { response: { text: () => data.text } };
    } catch (error) {
      console.error("AI call failed:", error);
      throw error;
    }
  }
};
