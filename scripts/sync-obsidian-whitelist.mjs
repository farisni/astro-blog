import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const defaultVaultRoot = join(homedir(), "Note/obsidian/faris-vault");
const vaultRoot = resolve(process.argv[2] ?? process.env.OBSIDIAN_VAULT_DIR ?? defaultVaultRoot);
const syncScript = join(import.meta.dirname, "sync-obsidian.mjs");

const whitelist = [
	{ source: "Linux", output: "linux" },
	{ source: "汇编", output: "assembly" },
];

function syncEntry(entry) {
	return new Promise((resolveRun, rejectRun) => {
		const child = spawn(
			process.execPath,
			[syncScript, join(vaultRoot, entry.source), join(projectRoot, "content/posts", entry.output)],
			{ stdio: "inherit" },
		);

		child.once("error", rejectRun);
		child.once("exit", (code, signal) => {
			if (code === 0) {
				resolveRun();
				return;
			}

			rejectRun(
				new Error(
					`同步 Obsidian ${entry.source} 失败（${signal ? `signal ${signal}` : `exit ${code}`}）`,
				),
			);
		});
	});
}

for (const entry of whitelist) {
	await syncEntry(entry);
}
