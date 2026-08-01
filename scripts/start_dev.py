#!/usr/bin/env python3
"""Safely prepare and start the Astro development server.

This launcher is intended for a repository where branches may use different
dependency versions. It refreshes pnpm links when package metadata changes,
stops the previous Astro daemon, clears the requested port, and starts a fresh
background server.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time
from typing import Sequence
from urllib.error import HTTPError, URLError
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
STATE_FILE = ROOT / ".astro" / "start-dev-state.json"
LOCAL_STORE = ROOT / ".pnpm-store"
OFFICIAL_REGISTRY = "https://registry.npmjs.org"


def log(message: str) -> None:
    print(f"[start-dev] {message}", flush=True)


def command_text(command: Sequence[str]) -> str:
    return " ".join(command)


def run(
    command: Sequence[str],
    *,
    check: bool = True,
    capture: bool = False,
) -> subprocess.CompletedProcess[str]:
    log(f"$ {command_text(command)}")
    result = subprocess.run(
        list(command),
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
    )
    if capture and result.stdout:
        print(result.stdout, end="" if result.stdout.endswith("\n") else "\n")
    if check and result.returncode != 0:
        raise RuntimeError(
            f"命令执行失败（exit {result.returncode}）：{command_text(command)}"
        )
    return result


def require_command(name: str) -> str:
    path = shutil.which(name)
    if path is None:
        raise RuntimeError(f"未找到命令：{name}")
    return path


def git_branch() -> str:
    result = subprocess.run(
        ["git", "branch", "--show-current"],
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    return result.stdout.strip() or "detached-head"


def dependency_fingerprint() -> str:
    digest = hashlib.sha256()
    files = [ROOT / "package.json", ROOT / "pnpm-lock.yaml"]
    for path in files:
        if not path.exists():
            raise RuntimeError(f"缺少依赖文件：{path.name}")
        digest.update(path.name.encode())
        digest.update(path.read_bytes())
    return digest.hexdigest()


def read_state() -> dict[str, str]:
    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {}
    return data if isinstance(data, dict) else {}


def write_state(fingerprint: str, branch: str) -> None:
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(
        json.dumps(
            {"dependency_fingerprint": fingerprint, "branch": branch},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def dependencies_need_install(fingerprint: str, force: bool) -> bool:
    if force or not (ROOT / "node_modules").is_dir():
        return True
    return read_state().get("dependency_fingerprint") != fingerprint


def pnpm_install(registry: str | None) -> None:
    LOCAL_STORE.mkdir(parents=True, exist_ok=True)
    base_command = [
        "pnpm",
        "install",
        "--frozen-lockfile",
        "--store-dir",
        str(LOCAL_STORE),
        "--config.confirmModulesPurge=false",
    ]
    if registry:
        base_command.extend(["--registry", registry])

    result = run(base_command, check=False, capture=True)
    if result.returncode == 0:
        return

    output = result.stdout or ""
    network_error = any(
        marker in output
        for marker in ("ENOTFOUND", "ERR_PNPM_META_FETCH_FAIL", "ETIMEDOUT")
    )
    if registry is None and network_error:
        log("当前 npm 镜像不可用，自动改用 npm 官方 registry 重试。")
        run(base_command + ["--registry", OFFICIAL_REGISTRY])
        return

    raise RuntimeError("pnpm install 失败，请检查上方安装日志。")


def listening_pids(port: int) -> list[int]:
    if shutil.which("lsof") is None:
        raise RuntimeError("清理端口需要 lsof，请先安装该命令。")
    result = subprocess.run(
        ["lsof", "-nP", f"-iTCP:{port}", "-sTCP:LISTEN", "-t"],
        cwd=ROOT,
        check=False,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    pids: list[int] = []
    for line in result.stdout.splitlines():
        value = line.strip()
        if value.isdigit():
            pid = int(value)
            if pid > 1 and pid != os.getpid():
                pids.append(pid)
    return sorted(set(pids))


def pid_exists(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def clear_port(port: int) -> None:
    pids = listening_pids(port)
    if not pids:
        log(f"端口 {port} 当前空闲。")
        return

    log(f"端口 {port} 被进程 {', '.join(map(str, pids))} 占用，正在停止。")
    for pid in pids:
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        except PermissionError as error:
            raise RuntimeError(f"无权限停止进程 {pid}") from error

    deadline = time.monotonic() + 4
    while time.monotonic() < deadline and any(pid_exists(pid) for pid in pids):
        time.sleep(0.15)

    remaining = [pid for pid in pids if pid_exists(pid)]
    for pid in remaining:
        log(f"进程 {pid} 未正常退出，发送 SIGKILL。")
        os.kill(pid, signal.SIGKILL)

    time.sleep(0.2)
    still_listening = listening_pids(port)
    if still_listening:
        raise RuntimeError(
            f"端口 {port} 仍被进程 {', '.join(map(str, still_listening))} 占用"
        )


def stop_astro() -> None:
    log("停止已有 Astro 后台服务。")
    run(["pnpm", "astro", "dev", "stop"], check=False, capture=True)


def wait_until_ready(host: str, port: int, timeout: float) -> None:
    url = f"http://{host}:{port}/"
    deadline = time.monotonic() + timeout
    last_error: Exception | None = None

    while time.monotonic() < deadline:
        try:
            with urlopen(url, timeout=1.5) as response:
                if response.status < 500:
                    log(f"服务已就绪：{url}（HTTP {response.status}）")
                    return
        except HTTPError as error:
            if error.code < 500:
                log(f"服务已就绪：{url}（HTTP {error.code}）")
                return
            last_error = error
        except (URLError, TimeoutError, OSError) as error:
            last_error = error
        time.sleep(0.35)

    run(["pnpm", "astro", "dev", "logs"], check=False, capture=True)
    raise RuntimeError(f"服务在 {timeout:g} 秒内未就绪：{last_error}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="同步分支依赖、清理旧端口并启动 Astro 开发服务器。"
    )
    parser.add_argument("--host", default="127.0.0.1", help="监听地址")
    parser.add_argument("--port", type=int, default=3009, help="监听端口")
    parser.add_argument(
        "--timeout", type=float, default=25, help="等待 HTTP 就绪的秒数"
    )
    parser.add_argument(
        "--registry", help="pnpm registry；默认使用当前配置，网络失败时回退官方源"
    )
    install_group = parser.add_mutually_exclusive_group()
    install_group.add_argument(
        "--force-install", action="store_true", help="忽略缓存状态，强制安装依赖"
    )
    install_group.add_argument(
        "--skip-install", action="store_true", help="跳过依赖检查与安装"
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        require_command("git")
        require_command("pnpm")
        branch = git_branch()
        log(f"项目：{ROOT}")
        log(f"分支：{branch}")

        if not args.skip_install:
            fingerprint = dependency_fingerprint()
            if dependencies_need_install(fingerprint, args.force_install):
                log("检测到分支依赖发生变化，正在按锁文件同步依赖。")
                pnpm_install(args.registry)
                write_state(fingerprint, branch)
            else:
                log("依赖指纹未变化，跳过 pnpm install。")

        stop_astro()
        clear_port(args.port)
        run(
            [
                "pnpm",
                "astro",
                "dev",
                "--background",
                "--force",
                "--host",
                args.host,
                "--port",
                str(args.port),
            ]
        )
        wait_until_ready(args.host, args.port, args.timeout)
        return 0
    except (RuntimeError, OSError) as error:
        log(f"错误：{error}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
