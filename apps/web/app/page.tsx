export default async function Page() {
	const res = await fetch(
		(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") +
			"/api/v1/config",
		{ cache: "no-store" },
	);
	const cfg = await res.json();
	return (
		<main className="p-10">
			<section className="max-w-4xl mx-auto text-center">
				<h1 className="text-4xl font-bold mb-4">{cfg.name}</h1>
				<p className="text-gray-600 mb-6">
					Indian-law assistant: chat, documents, compliance, and
					sources.
				</p>
				<div className="flex gap-4 justify-center">
					<a
						className="px-4 py-2 bg-blue-600 text-white rounded"
						href="/app/chat"
					>
						Open Chat
					</a>
					<a className="px-4 py-2 border rounded" href="/pricing">
						Pricing
					</a>
				</div>
			</section>
		</main>
	);
}
