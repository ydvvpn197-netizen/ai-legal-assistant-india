"use client";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
	const [messages, setMessages] = useState<Msg[]>([]);
	const [input, setInput] = useState("");
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	async function send() {
		if (!input.trim()) return;
		const next = [...messages, { role: "user", content: input } as Msg];
		setMessages(next);
		setInput("");
		// Demo call to health
		const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/health");
		if (res.ok) {
			setMessages([
				...next,
				{ role: "assistant", content: "Hello! RAG coming soon." },
			]);
		} else {
			setMessages([
				...next,
				{ role: "assistant", content: "API not reachable." },
			]);
		}
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100vh",
			}}
		>
			<div style={{ flex: 1, overflow: "auto", padding: 16 }}>
				{messages.map((m, i) => (
					<div key={i} style={{ marginBottom: 12 }}>
						<b>{m.role === "user" ? "You" : "Assistant"}:</b>{" "}
						{m.content}
					</div>
				))}
				<div ref={endRef} />
			</div>
			<div
				style={{
					display: "flex",
					gap: 8,
					padding: 16,
					borderTop: "1px solid #eee",
				}}
			>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					style={{ flex: 1 }}
					placeholder="Ask about Indian law..."
				/>
				<button onClick={send}>Send</button>
			</div>
		</div>
	);
}
