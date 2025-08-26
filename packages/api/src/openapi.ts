import { OpenAPIObject, InfoObject, PathsObject } from "openapi3-ts";

export function buildOpenApi(): OpenAPIObject {
	const info: InfoObject = {
		title: "AI Legal Assistant API",
		version: "0.1.0",
	};
	const paths: PathsObject = {
		"/health": { get: { responses: { "200": { description: "ok" } } } },
		"/api/v1/chat": {
			post: { responses: { "200": { description: "answer" } } },
		},
		"/api/v1/documents/generate": {
			post: { responses: { "200": { description: "generated" } } },
		},
		"/api/v1/uploads/sign": {
			post: { responses: { "200": { description: "signed" } } },
		},
		"/api/v1/compliance/run": {
			post: { responses: { "200": { description: "result" } } },
		},
		"/api/v1/billing/order": {
			post: { responses: { "200": { description: "order" } } },
		},
	};
	return { openapi: "3.0.3", info, paths } as OpenAPIObject;
}
