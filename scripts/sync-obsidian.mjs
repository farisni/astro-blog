import { homedir } from "node:os";
import {
	lstat,
	mkdir,
	readFile,
	readdir,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const defaultSource = join(homedir(), "Note/obsidian/faris-vault/Linux");
const sourceRoot = resolve(process.argv[2] ?? process.env.OBSIDIAN_LINUX_DIR ?? defaultSource);
const outputRoot = resolve(process.argv[3] ?? join(projectRoot, "content/posts/linux"));
const allowedOutputRoot = `${join(projectRoot, "content/posts")}${sep}`;
const manifestPath = join(outputRoot, ".obsidian-sync.json");

if (!outputRoot.startsWith(allowedOutputRoot)) {
	throw new Error(`输出目录必须位于 content/posts 内：${outputRoot}`);
}

if (sourceRoot === outputRoot || outputRoot.startsWith(`${sourceRoot}${sep}`)) {
	throw new Error("源目录与输出目录不能相同或互相包含。");
}

function parseScalar(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;
	return trimmed;
}

function parseFrontmatter(markdown) {
	const normalized = markdown.replace(/\r\n/g, "\n");
	if (!normalized.startsWith("---\n")) {
		return { data: {}, body: normalized };
	}

	const end = normalized.indexOf("\n---\n", 4);
	if (end === -1) {
		return { data: {}, body: normalized };
	}

	const data = {};
	let listKey;
	for (const line of normalized.slice(4, end).split("\n")) {
		const listItem = line.match(/^\s*-\s+(.+)$/);
		if (listItem && listKey) {
			data[listKey].push(parseScalar(listItem[1]));
			continue;
		}

		const property = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
		if (!property) continue;
		const [, key, rawValue] = property;
		if (rawValue.trim()) {
			data[key] = parseScalar(rawValue);
			listKey = undefined;
		} else {
			data[key] = [];
			listKey = key;
		}
	}

	return {
		data,
		body: normalized.slice(end + 5).replace(/^\s+/, ""),
	};
}

function cleanInlineMarkdown(value) {
	return value
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/[`*_~]/g, "")
		.replace(/<[^>]+>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function findFirstHeading(body) {
	const match = body.match(/^#\s+(.+)$/m);
	return match ? cleanInlineMarkdown(match[1]) : undefined;
}

function createDescription(body, title) {
	let insideFence = false;
	for (const sourceLine of body.split("\n")) {
		const line = sourceLine.trim();
		if (/^```|^~~~/.test(line)) {
			insideFence = !insideFence;
			continue;
		}
		if (
			insideFence ||
			!line ||
			/^(#|>|[-*+] |\d+[.)] |[|:]|---+$|\*\*\*\*+$)/.test(line)
		) {
			continue;
		}

		const description = cleanInlineMarkdown(line);
		if (description.length >= 12) {
			return description.length > 160
				? `${description.slice(0, 157).trimEnd()}...`
				: description;
		}
	}
	return `${title}，同步自 Obsidian Linux 笔记。`;
}

function slugifyHeading(value) {
	return value
		.normalize("NFKC")
		.toLowerCase()
		.replace(/\p{Extended_Pictographic}/gu, "")
		.replace(/[^\p{Letter}\p{Number}\s_-]/gu, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function slugifyFile(value) {
	return value
		.normalize("NFKC")
		.toLowerCase()
		.replace(/[：:＋+]/g, "-")
		.replace(/[^\p{Letter}\p{Number}_-]/gu, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function transformObsidianMarkdown(body) {
	let transformed = body.replace(
		/\[\[#([^|\]]+)(?:\|([^\]]+))?\]\]/g,
		(_match, heading, label) => `[${label ?? heading}](#${slugifyHeading(heading)})`,
	);

	transformed = transformed.replace(
		/\[\[([^#|\]]+)(?:#[^|\]]+)?(?:\|([^\]]+))?\]\]/g,
		(_match, target, label) => label ?? target,
	);

	const firstHeading = transformed.match(/^#\s+.+$/m);
	if (firstHeading && firstHeading.index !== undefined && firstHeading.index < 320) {
		transformed =
			transformed.slice(0, firstHeading.index) +
			transformed.slice(firstHeading.index + firstHeading[0].length);
	}

	return transformed.replace(/^\s*\*{4,}\s*$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}

function yamlString(value) {
	return JSON.stringify(String(value));
}

function normalizeDate(value, fallback) {
	const candidate = value ? new Date(String(value)) : fallback;
	if (Number.isNaN(candidate.getTime())) return fallback.toISOString().slice(0, 10);
	return candidate.toISOString().slice(0, 10);
}

async function collectMarkdownFiles(directory) {
	const files = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		if (entry.name.startsWith(".")) continue;
		const absolutePath = join(directory, entry.name);
		const entryStat = await lstat(absolutePath);
		if (entryStat.isSymbolicLink()) continue;
		if (entry.isDirectory()) {
			files.push(...(await collectMarkdownFiles(absolutePath)));
		} else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md") {
			files.push(absolutePath);
		}
	}
	return files.sort((a, b) => a.localeCompare(b, "zh-CN"));
}

async function prepareOutputDirectory() {
	try {
		const outputStat = await stat(outputRoot);
		if (outputStat.isDirectory()) {
			try {
				await stat(manifestPath);
			} catch {
				throw new Error(
					`拒绝清空非同步目录：${outputRoot}。请确认其中没有手写内容后再删除该目录。`,
				);
			}
			await rm(outputRoot, { recursive: true, force: true });
		}
	} catch (error) {
		if (error?.code !== "ENOENT") throw error;
	}
	await mkdir(outputRoot, { recursive: true });
}

const sourceStat = await stat(sourceRoot);
if (!sourceStat.isDirectory()) {
	throw new Error(`Obsidian 白名单目录不存在：${sourceRoot}`);
}

const sourceFiles = await collectMarkdownFiles(sourceRoot);
await prepareOutputDirectory();

const generated = [];
for (const sourcePath of sourceFiles) {
	const markdown = await readFile(sourcePath, "utf8");
	const { data, body } = parseFrontmatter(markdown);
	const fileStat = await stat(sourcePath);
	const title = String(data.title || findFirstHeading(body) || basename(sourcePath, ".md")).trim();
	const transformedBody = transformObsidianMarkdown(body);
	const description = createDescription(transformedBody, title);
	const publishDate = normalizeDate(
		data.publishDate || data.date || data.created,
		fileStat.birthtime,
	);
	const updatedDateValue = data.updatedDate || data.updated;
	const tags = Array.isArray(data.tags)
		? data.tags.map(String).filter(Boolean)
		: data.tags
			? [String(data.tags)]
			: [];
	if (!tags.some((tag) => tag.toLowerCase() === "linux")) tags.push("linux");

	const relativeSource = relative(sourceRoot, sourcePath);
	const relativeDirectory = dirname(relativeSource);
	const outputName = `${slugifyFile(basename(sourcePath, ".md")) || "note"}.md`;
	const outputDirectory =
		relativeDirectory === "." ? outputRoot : join(outputRoot, relativeDirectory);
	const outputPath = join(outputDirectory, outputName);
	await mkdir(outputDirectory, { recursive: true });

	const frontmatter = [
		"---",
		`title: ${yamlString(title)}`,
		`description: ${yamlString(description)}`,
		`publishDate: ${yamlString(publishDate)}`,
		...(updatedDateValue
			? [`updatedDate: ${yamlString(normalizeDate(updatedDateValue, fileStat.mtime))}`]
			: []),
		"tags:",
		...tags.map((tag) => `  - ${yamlString(tag)}`),
		"draft: false",
		"pinned: false",
		"---",
		"",
		"<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->",
		"",
		transformedBody,
		"",
	].join("\n");

	await writeFile(outputPath, frontmatter, "utf8");
	generated.push(relative(projectRoot, outputPath));
}

await writeFile(
	manifestPath,
	`${JSON.stringify(
		{
			source: "Linux",
			generatedAt: new Date().toISOString(),
			files: generated,
		},
		null,
		2,
	)}\n`,
	"utf8",
);

console.log(`已从 Obsidian Linux 白名单同步 ${generated.length} 篇文章：`);
for (const file of generated) console.log(`- ${file}`);
