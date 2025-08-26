"use client";
import { useState } from "react";

export default function DocumentsPage() {
  const [slug, setSlug] = useState("nda-mutual");
  const [company, setCompany] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  async function generate() {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/documents/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateSlug: slug, inputs: { company } })
    });
    const data = await res.json();
    setPdfUrl((process.env.NEXT_PUBLIC_API_URL || "") + data.url);
  }
  return (
    <main style={{ padding: 24 }}>
      <h1>Generate Document</h1>
      <label>Template slug: <input value={slug} onChange={(e) => setSlug(e.target.value)} /></label>
      <br/>
      <label>Company: <input value={company} onChange={(e) => setCompany(e.target.value)} /></label>
      <br/>
      <button onClick={generate}>Generate</button>
      {pdfUrl && (
        <div>
          <p>Generated:</p>
          <a href={pdfUrl} target="_blank">Open</a>
        </div>
      )}
    </main>
  );
}

