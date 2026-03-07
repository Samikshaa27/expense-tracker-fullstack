import React, { useState, useRef, useEffect } from "react";
import { askChatbot } from "../services/api";

const G = {
    primary: "#2E7D32",
    light: "#A5D6A7",
    card: "#FFFFFF",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
};

function Chatbot({ height = "400px" }) {
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm your AI Financial Assistant. Ask me anything about your expenses." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await askChatbot(userMessage.content, token);
            setMessages(prev => [...prev, { role: "assistant", content: res.data.reply }]);
        } catch (error) {
            console.error("Chatbot error", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: height, background: G.card, borderRadius: "16px", border: `1px solid ${G.border}`, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${G.primary} 0%, #43A047 100%)`, padding: "16px", color: "white", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🤖</span>
                <span style={{ fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>AI Assistant</span>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#F9FAFB" }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                        <div style={{
                            padding: "10px 14px",
                            borderRadius: "14px",
                            background: msg.role === "user" ? G.primary : "white",
                            color: msg.role === "user" ? "white" : G.text,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            border: msg.role === "user" ? "none" : `1px solid ${G.border}`,
                            fontSize: "0.9rem",
                            lineHeight: "1.4"
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: "flex-start", padding: "10px 14px", background: "white", borderRadius: "14px", border: `1px solid ${G.border}`, color: G.muted, fontSize: "0.9rem" }}>
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "12px", borderTop: `1px solid ${G.border}`, display: "flex", gap: "8px", background: "white" }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about your spending..."
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: `1px solid ${G.border}`, outline: "none", fontSize: "0.9rem" }}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    style={{
                        padding: "0 16px", background: isLoading || !input.trim() ? "#ccc" : G.primary,
                        color: "white", border: "none", borderRadius: "8px", cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                        fontWeight: "600", transition: "0.2s"
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
