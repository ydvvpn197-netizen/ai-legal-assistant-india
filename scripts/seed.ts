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
