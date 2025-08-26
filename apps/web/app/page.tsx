export default async function Page() {
	const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/config");
	const cfg = await res.json();
	return (
		<main style={{ padding: 24 }}>
			<h1>{cfg.name}</h1>
			<p>Welcome. Go to /app/chat to start.</p>
			<a href="/app/chat">Open Chat</a>
		</main>
	);
}
