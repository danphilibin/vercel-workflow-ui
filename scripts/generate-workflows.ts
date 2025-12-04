/**
 * Workflow Registry Generator
 *
 * Scans the workflows/ directory and generates a typed manifest.
 * Run with: npx tsx scripts/generate-workflows.ts
 *
 * Supports:
 * - Nested folders (users/index.ts → "users", users/create.ts → "users/create")
 * - Meta extraction (title, description, access, unlisted)
 * - Watch mode for development
 */

import * as fs from "node:fs";
import * as path from "node:path";

const WORKFLOWS_DIR = path.join(process.cwd(), "workflows");
const OUTPUT_FILE = path.join(process.cwd(), "generated", "workflows.ts");
const WATCH_MODE = process.argv.includes("--watch");

type ExtractedMeta = {
	title?: string;
	description?: string;
	access?: string[];
	unlisted?: boolean;
};

type WorkflowInfo = {
	slug: string;
	filePath: string;
	meta: ExtractedMeta;
	loaders: string[]; // Names of exported loaders
};

/**
 * Recursively find all workflow files
 */
function findWorkflowFiles(dir: string, base = ""): string[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		const relativePath = path.join(base, entry.name);

		if (entry.isDirectory()) {
			files.push(...findWorkflowFiles(fullPath, relativePath));
		} else if (entry.isFile() && entry.name.endsWith(".ts")) {
			// Skip index.ts in root (that's the old registry)
			if (
				base === "" &&
				(entry.name === "index.ts" || entry.name === "manifest.ts")
			) {
				continue;
			}
			files.push(relativePath);
		}
	}

	return files;
}

/**
 * Convert file path to URL slug
 * - users/index.ts → "users"
 * - users/create.ts → "users/create"
 * - hello-relay.ts → "hello-relay"
 */
function fileToSlug(filePath: string): string {
	// Remove .ts extension
	let slug = filePath.replace(/\.ts$/, "");
	// Convert backslashes to forward slashes (Windows)
	slug = slug.replace(/\\/g, "/");
	// Remove /index suffix
	slug = slug.replace(/\/index$/, "");
	// Handle root index
	if (slug === "index") {
		return "";
	}
	return slug;
}

/**
 * Extract a string value from a key: "value" or key: 'value' pattern
 * Handles apostrophes inside double-quoted strings and vice versa
 */
function extractStringValue(block: string, key: string): string | undefined {
	// Try double quotes first (can contain single quotes)
	const doubleMatch = block.match(new RegExp(`${key}:\\s*"([^"]*)"`, "s"));
	if (doubleMatch) return doubleMatch[1];

	// Try single quotes (can contain double quotes)
	const singleMatch = block.match(new RegExp(`${key}:\\s*'([^']*)'`, "s"));
	if (singleMatch) return singleMatch[1];

	// Try backticks
	const backMatch = block.match(new RegExp(`${key}:\\s*\`([^\`]*)\``, "s"));
	if (backMatch) return backMatch[1];

	return undefined;
}

/**
 * Extract loader export names from workflow file content
 * Looks for: export const xxxLoader = ...
 */
function extractLoaders(content: string): string[] {
	const loaderRegex = /export\s+const\s+(\w+Loader)\s*=/g;
	const loaders: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = loaderRegex.exec(content)) !== null) {
		loaders.push(match[1]);
	}
	return loaders;
}

/**
 * Extract meta object from workflow file content
 * Uses regex to parse the meta export - simple but effective
 */
function extractMeta(content: string): ExtractedMeta {
	const meta: ExtractedMeta = {};

	// Match: export const meta: WorkflowMeta = { ... }
	// or: export const meta = { ... }
	const metaMatch = content.match(
		/export\s+const\s+meta(?::\s*WorkflowMeta)?\s*=\s*(\{[\s\S]*?\n\});/,
	);

	if (!metaMatch) {
		return meta;
	}

	const metaBlock = metaMatch[1];

	// Extract title and description
	meta.title = extractStringValue(metaBlock, "title");
	meta.description = extractStringValue(metaBlock, "description");

	// Extract unlisted
	const unlistedMatch = metaBlock.match(/unlisted:\s*(true|false)/);
	if (unlistedMatch) meta.unlisted = unlistedMatch[1] === "true";

	// Extract access array
	const accessMatch = metaBlock.match(/access:\s*\[([\s\S]*?)\]/);
	if (accessMatch) {
		const accessStr = accessMatch[1];
		// Match each string in the array
		const items: string[] = [];
		const doubleMatches = accessStr.matchAll(/"([^"]*)"/g);
		for (const m of doubleMatches) items.push(m[1]);
		const singleMatches = accessStr.matchAll(/'([^']*)'/g);
		for (const m of singleMatches) items.push(m[1]);
		if (items.length > 0) meta.access = items;
	}

	return meta;
}

/**
 * Generate slug to title fallback
 */
function slugToTitle(slug: string): string {
	// biome-ignore lint/style/noNonNullAssertion: we know the slug is not empty
	return slug
		.split("/")
		.pop()!
		.replace(/-/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Scan workflows and extract metadata
 */
function scanWorkflows(): WorkflowInfo[] {
	const files = findWorkflowFiles(WORKFLOWS_DIR);
	const workflows: WorkflowInfo[] = [];

	for (const file of files) {
		const fullPath = path.join(WORKFLOWS_DIR, file);
		const content = fs.readFileSync(fullPath, "utf-8");

		// Check if file exports a workflow function
		if (!content.includes("export async function workflow")) {
			console.warn(`⚠️  Skipping ${file} - no 'workflow' export found`);
			continue;
		}

		const slug = fileToSlug(file);
		const meta = extractMeta(content);
		const loaders = extractLoaders(content);

		// Use extracted title or generate from slug
		if (!meta.title) {
			meta.title = slugToTitle(slug);
		}

		workflows.push({
			slug,
			filePath: file,
			meta,
			loaders,
		});
	}

	return workflows.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Generate the manifest file
 */
function generateManifest(workflows: WorkflowInfo[]): string {
	const imports = workflows
		.map((w) => {
			const importPath = `@/workflows/${w.filePath.replace(/\.ts$/, "")}`;
			return `  "${w.slug}": () => import("${importPath}"),`;
		})
		.join("\n");

	const entries = workflows
		.map((w) => {
			const pathArray = w.slug ? w.slug.split("/") : [];
			return `  {
    slug: "${w.slug}",
    path: ${JSON.stringify(pathArray)},
    title: ${JSON.stringify(w.meta.title)},
    description: ${w.meta.description ? JSON.stringify(w.meta.description) : "undefined"},
    access: ${w.meta.access ? JSON.stringify(w.meta.access) : "undefined"},
    unlisted: ${w.meta.unlisted ?? false},
    import: imports["${w.slug}"],
  },`;
		})
		.join("\n");

	// Generate loader registry
	const workflowsWithLoaders = workflows.filter((w) => w.loaders.length > 0);
	const loaderEntries = workflowsWithLoaders
		.map((w) => {
			const importPath = `@/workflows/${w.filePath.replace(/\.ts$/, "")}`;
			const loaderImports = w.loaders
				.map(
					(l) =>
						`      "${l}": (params: unknown) => import("${importPath}").then((m) => m.${l}(params)),`,
				)
				.join("\n");
			return `  "${w.slug}": {\n${loaderImports}\n  },`;
		})
		.join("\n");

	return `/**
 * Generated Workflow Registry
 *
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Run \`bun run generate\` to regenerate
 */

import type { WorkflowEntry } from "@/lib/relay/meta";

const imports: Record<string, () => Promise<{ workflow: () => Promise<unknown> }>> = {
${imports}
};

export const WORKFLOWS: WorkflowEntry[] = [
${entries}
];

export const WORKFLOW_SLUGS = [${workflows.map((w) => `"${w.slug}"`).join(", ")}] as const;

export type WorkflowSlug = (typeof WORKFLOW_SLUGS)[number];

/**
 * Get a workflow by slug
 */
export function getWorkflow(slug: string): WorkflowEntry | undefined {
  return WORKFLOWS.find((w) => w.slug === slug);
}

/**
 * Get all visible workflows (not unlisted)
 */
export function getVisibleWorkflows(): WorkflowEntry[] {
  return WORKFLOWS.filter((w) => !w.unlisted);
}

/**
 * Client-safe workflow list for sidebar (no functions)
 */
export const SIDEBAR_WORKFLOWS = WORKFLOWS
  .filter((w) => !w.unlisted)
  .map(({ slug, title, description }) => ({ slug, title, description }));

/**
 * Loader registry - async data fetchers exported from workflows
 */
// biome-ignore lint/suspicious/noExplicitAny: dynamic loader params
export const LOADERS: Record<string, Record<string, (params: any) => Promise<unknown>>> = {
${loaderEntries}
};

/**
 * Get a loader by workflow slug and loader name
 */
export function getLoader(workflowSlug: string, loaderName: string) {
  return LOADERS[workflowSlug]?.[loaderName];
}
`;
}

/**
 * Ensure output directory exists and write manifest
 */
function writeManifest(content: string): void {
	const outputDir = path.dirname(OUTPUT_FILE);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}
	fs.writeFileSync(OUTPUT_FILE, content);
}

/**
 * Main generation function
 */
function generate(): void {
	console.log("🔍 Scanning workflows...");

	const workflows = scanWorkflows();

	if (workflows.length === 0) {
		console.error("❌ No workflows found!");
		process.exit(1);
	}

	console.log(`📦 Found ${workflows.length} workflow(s):`);
	for (const w of workflows) {
		const loaderInfo =
			w.loaders.length > 0 ? ` [${w.loaders.length} loader(s)]` : "";
		console.log(`   - ${w.slug || "(root)"}: ${w.meta.title}${loaderInfo}`);
	}

	const manifest = generateManifest(workflows);
	writeManifest(manifest);

	console.log(`✅ Generated ${OUTPUT_FILE}`);
}

// Initial generation
generate();

// Watch mode
if (WATCH_MODE) {
	console.log("\n👀 Watching for changes...\n");

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	fs.watch(WORKFLOWS_DIR, { recursive: true }, (_event, filename) => {
		if (!filename?.endsWith(".ts")) return;

		// Debounce rapid changes
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			console.log(`\n📝 ${filename} changed, regenerating...`);
			generate();
		}, 100);
	});
}
