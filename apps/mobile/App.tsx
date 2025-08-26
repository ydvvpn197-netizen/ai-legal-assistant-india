import { useEffect, useState } from "react";
import {
	SafeAreaView,
	Text,
	TextInput,
	Button,
	ScrollView,
	View,
} from "react-native";

type Msg = { role: "user" | "assistant"; content: string };

export default function App() {
	const [messages, setMessages] = useState<Msg[]>([]);
	const [input, setInput] = useState("");

	async function send() {
		if (!input.trim()) return;
		const next = [...messages, { role: "user", content: input }];
		setMessages(next);
		setInput("");
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/health`,
			);
			if (res.ok)
				setMessages([
					...next,
					{ role: "assistant", content: "Hello from API (mobile)!" },
				]);
			else
				setMessages([
					...next,
					{ role: "assistant", content: "API not reachable." },
				]);
		} catch (e) {
			setMessages([
				...next,
				{ role: "assistant", content: "Network error." },
			]);
		}
	}

	return (
		<SafeAreaView>
			<ScrollView
				style={{ height: "90%" }}
				contentContainerStyle={{ padding: 16 }}
			>
				{messages.map((m, i) => (
					<View key={i} style={{ marginBottom: 12 }}>
						<Text style={{ fontWeight: "bold" }}>
							{m.role === "user" ? "You" : "Assistant"}:
						</Text>
						<Text>{m.content}</Text>
					</View>
				))}
			</ScrollView>
			<View style={{ padding: 16 }}>
				<TextInput
					value={input}
					onChangeText={setInput}
					placeholder="Ask about Indian law..."
					style={{ borderWidth: 1, padding: 8 }}
				/>
				<Button title="Send" onPress={send} />
			</View>
		</SafeAreaView>
	);
}
