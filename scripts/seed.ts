import { prisma } from "@aila/db";

async function main() {
	const admin = await prisma.user.upsert({
		where: { email: "admin@example.com" },
		create: {
			email: "admin@example.com",
			name: "Admin",
			role: "ADMIN" as any,
			locale: "en",
		},
		update: {},
	});
	const free = await prisma.user.upsert({
		where: { email: "free@example.com" },
		create: {
			email: "free@example.com",
			name: "Free User",
			role: "USER" as any,
			locale: "en",
		},
		update: {},
	});
	const pro = await prisma.user.upsert({
		where: { email: "pro@example.com" },
		create: {
			email: "pro@example.com",
			name: "Pro User",
			role: "USER" as any,
			locale: "en",
		},
		update: {},
	});

	const org = await prisma.org.upsert({
		where: { id: "seed_org" },
		update: {},
		create: { id: "seed_org", name: "Sample SME", ownerId: admin.id },
	});
	await prisma.orgMember.upsert({
		where: { orgId_userId: { orgId: org.id, userId: admin.id } },
		update: {},
		create: { orgId: org.id, userId: admin.id, role: "ADMIN" as any },
	});

	// Document templates (6)
	const templates = [
		{ slug: "nda-mutual", title: "NDA (Mutual)", category: "contracts" },
		{
			slug: "rent-agreement-residential",
			title: "Residential Rent Agreement (India)",
			category: "real_estate",
		},
		{
			slug: "employment-offer-probation",
			title: "Employment Offer Letter (Probation)",
			category: "employment",
		},
		{
			slug: "termination-notice-misconduct",
			title: "Employment Termination Notice (Misconduct)",
			category: "employment",
		},
		{
			slug: "founders-agreement-basic",
			title: "Founders’ Agreement (Basic)",
			category: "corporate",
		},
		{
			slug: "privacy-policy-india",
			title: "Privacy Policy (India)",
			category: "privacy",
		},
	];
	for (const t of templates) {
		await prisma.documentTemplate.upsert({
			where: { slug: t.slug },
			update: {},
			create: {
				slug: t.slug,
				title: t.title,
				category: t.category,
				schema: { fields: [] },
				sample: { body: "Sample content" },
				locale: "en",
				isPremium: t.slug === "privacy-policy-india",
			},
		});
	}

	// Compliance checklists (3)
	const checklists = [
		{
			name: "GST Registration Readiness",
			items: [{ id: "pan", text: "PAN available" }],
		},
		{
			name: "Shops & Establishments Basics",
			items: [{ id: "registration", text: "Registration certificate" }],
		},
		{
			name: "Basic Labour Posters/Registrations",
			items: [{ id: "gratuity", text: "Gratuity Act poster" }],
		},
	];
	for (const c of checklists) {
		await prisma.complianceChecklist.create({
			data: { name: c.name, locale: "en", items: c.items as any },
		});
	}

	// Sample sources (10)
	const sources = [
		{ title: "Indian Contract Act, 1872 - Consideration", sourceType: "bare_act", jurisdiction: "India", language: "en", text: "Section 2(d) defines consideration..." },
		{ title: "Information Technology Act, 2000 - Reasonable Security", sourceType: "bare_act", jurisdiction: "India", language: "en", text: "Section 43A provides..." },
		{ title: "DPDP Act, 2023 - Obligations of Data Fiduciaries", sourceType: "bare_act", jurisdiction: "India", language: "en", text: "Data fiduciaries shall..." },
		{ title: "GST Act - Thresholds", sourceType: "guideline", jurisdiction: "India", language: "en", text: "Registration thresholds include..." },
		{ title: "Shops & Establishments - State Rules", sourceType: "guideline", jurisdiction: "India", language: "en", text: "Typical requirements include..." },
		{ title: "Industrial Disputes Act - Termination", sourceType: "bare_act", jurisdiction: "India", language: "en", text: "Retrenchment procedures..." },
		{ title: "Case: XYZ v. ABC (2019) - NDA Enforceability", sourceType: "judgment", jurisdiction: "India", language: "en", text: "The court held..." },
		{ title: "Case: DEF v. GHI (2021) - Landlord-Tenant", sourceType: "judgment", jurisdiction: "India", language: "en", text: "On eviction grounds..." },
		{ title: "Companies Act - Founders Agreements", sourceType: "bare_act", jurisdiction: "India", language: "en", text: "Shareholders rights include..." },
		{ title: "Payment of Wages Act - Payslips", sourceType: "bare_act", jurisdiction: "India", language: "en", text: "Employers must provide..." },
	];
	for (const s of sources) {
		const src = await prisma.source.create({
			data: { title: s.title, sourceType: s.sourceType as any, url: null, jurisdiction: s.jurisdiction, language: s.language },
		});
		await prisma.sourceChunk.create({
			data: {
				sourceId: src.id,
				chunk: s.text,
				embedding: Buffer.alloc(0),
				citationMeta: { note: "seed" } as any,
				page: 1,
			},
		});
	}

	console.log("Seed completed", {
		admin: admin.email,
		free: free.email,
		pro: pro.email,
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
