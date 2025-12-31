#!/usr/bin/env python3
"""
Kit Installer - Install Vibery kit bundles to projects.

Usage:
    python install.py <kit-name> [kit-name2 ...]
    python install.py --list
    python install.py --installed
    python install.py --uninstall <kit-name>
"""

import argparse
import hashlib
import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent

# Find stacks directory (works in both CLI package and development)
# Try CLI package structure first (cli/scripts/install.py -> cli/stacks)
STACKS_DIR = SCRIPT_DIR.parent / "stacks"
if not STACKS_DIR.exists():
    # Fall back to development structure
    ROOT = SCRIPT_DIR.parent.parent.parent.parent  # vibe-templates root
    STACKS_DIR = ROOT / "stacks"
CLAUDE_DIR = Path.cwd() / ".claude"
METADATA_FILE = CLAUDE_DIR / "metadata.json"
MCP_FILE = Path.cwd() / ".mcp.json"
CLAUDE_MD = Path.cwd() / "CLAUDE.md"
SETTINGS_FILE = CLAUDE_DIR / "settings.json"

# Colors
C = {
    "reset": "\033[0m",
    "green": "\033[32m",
    "yellow": "\033[33m",
    "blue": "\033[34m",
    "red": "\033[31m",
    "dim": "\033[2m",
}


def log(msg: str, color: str = "reset"):
    print(f"{C.get(color, '')}{msg}{C['reset']}")


def file_checksum(path: Path) -> str:
    """Calculate SHA256 checksum of file."""
    if not path.exists():
        return ""
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def load_json(path: Path) -> dict:
    """Load JSON file or return empty dict."""
    if path.exists():
        try:
            return json.loads(path.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def save_json(path: Path, data: dict):
    """Save dict to JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n")


def list_available_kits() -> list[dict]:
    """List all available kits."""
    kits = []
    if not STACKS_DIR.exists():
        return kits

    for kit_dir in STACKS_DIR.iterdir():
        if not kit_dir.is_dir():
            continue
        manifest = kit_dir / "kit.json"
        if manifest.exists():
            kit = load_json(manifest)
            kit["path"] = str(kit_dir)
            kits.append(kit)

    return sorted(kits, key=lambda k: k.get("id", ""))


def get_installed_kits() -> dict:
    """Get installed kits from metadata."""
    metadata = load_json(METADATA_FILE)
    return metadata.get("vibery_kits", {})


def copy_files(src_dir: Path, dest_dir: Path, kit_id: str, dry_run: bool = False) -> list[dict]:
    """Copy files from kit to destination, return file records."""
    records = []
    if not src_dir.exists():
        return records

    for src_file in src_dir.rglob("*"):
        if src_file.is_dir():
            continue
        if src_file.name.startswith("."):
            continue

        rel_path = src_file.relative_to(src_dir)
        dest_file = dest_dir / rel_path

        if dry_run:
            log(f"  [DRY] {rel_path} -> {dest_file.relative_to(Path.cwd())}", "dim")
        else:
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dest_file)
            log(f"  + {rel_path}", "dim")

        records.append({
            "path": str(rel_path),
            "checksum": file_checksum(src_file),
            "ownership": "kit",
            "kit": kit_id,
        })

    return records


def merge_hooks(hooks_dir: Path, dry_run: bool = False) -> bool:
    """Merge hook configs into settings.json."""
    if not hooks_dir.exists():
        return True

    settings = load_json(SETTINGS_FILE)
    if "hooks" not in settings:
        settings["hooks"] = {}

    for hook_file in hooks_dir.glob("*.json"):
        hook_config = load_json(hook_file)
        if "hooks" in hook_config:
            for event, handlers in hook_config["hooks"].items():
                if event not in settings["hooks"]:
                    settings["hooks"][event] = []
                # Add handlers avoiding duplicates
                existing = [json.dumps(h) for h in settings["hooks"][event]]
                for handler in handlers:
                    if json.dumps(handler) not in existing:
                        settings["hooks"][event].append(handler)
                        if not dry_run:
                            log(f"  + hook: {event}", "dim")

    if not dry_run:
        save_json(SETTINGS_FILE, settings)

    return True


def merge_mcps(mcps_dir: Path, dry_run: bool = False) -> bool:
    """Merge MCP configs into .mcp.json."""
    if not mcps_dir.exists():
        return True

    mcp_config = load_json(MCP_FILE)
    if "mcpServers" not in mcp_config:
        mcp_config["mcpServers"] = {}

    for mcp_file in mcps_dir.glob("*.json"):
        mcp_data = load_json(mcp_file)
        if "mcpServers" in mcp_data:
            for name, config in mcp_data["mcpServers"].items():
                if name not in mcp_config["mcpServers"]:
                    mcp_config["mcpServers"][name] = config
                    if not dry_run:
                        log(f"  + mcp: {name}", "dim")

    if not dry_run:
        save_json(MCP_FILE, mcp_config)

    return True


def prepend_claude_md(kit_dir: Path, kit_id: str, dry_run: bool = False) -> bool:
    """Prepend kit content to CLAUDE.md."""
    prepend_file = kit_dir / "CLAUDE.md.prepend"
    if not prepend_file.exists():
        return True

    prepend_content = prepend_file.read_text()
    marker_start = f"<!-- VIBERY-KIT:{kit_id}:"
    marker_end = f"<!-- /VIBERY-KIT:{kit_id} -->"

    # Read existing CLAUDE.md
    existing = CLAUDE_MD.read_text() if CLAUDE_MD.exists() else ""

    # Check if already installed
    if marker_start in existing:
        log(f"  Kit already in CLAUDE.md, skipping prepend", "yellow")
        return True

    # Prepend
    new_content = prepend_content + existing

    if dry_run:
        log(f"  [DRY] Prepend to CLAUDE.md", "dim")
    else:
        CLAUDE_MD.write_text(new_content)
        log(f"  + CLAUDE.md prepended", "dim")

    return True


def install_kit(kit_id: str, dry_run: bool = False) -> bool:
    """Install a single kit."""
    kit_dir = STACKS_DIR / kit_id
    manifest_file = kit_dir / "kit.json"

    if not manifest_file.exists():
        log(f"Kit not found: {kit_id}", "red")
        return False

    manifest = load_json(manifest_file)
    version = manifest.get("version", "0.0.0")

    log(f"\nInstalling {kit_id} v{version}...", "blue")

    # Track installed files
    installed_files = []

    # Copy agents
    if (kit_dir / "agents").exists():
        files = copy_files(kit_dir / "agents", CLAUDE_DIR / "agents", kit_id, dry_run)
        installed_files.extend(files)

    # Copy commands
    if (kit_dir / "commands").exists():
        files = copy_files(kit_dir / "commands", CLAUDE_DIR / "commands", kit_id, dry_run)
        installed_files.extend(files)

    # Copy skills
    if (kit_dir / "skills").exists():
        files = copy_files(kit_dir / "skills", CLAUDE_DIR / "skills", kit_id, dry_run)
        installed_files.extend(files)

    # Merge hooks
    merge_hooks(kit_dir / "hooks", dry_run)

    # Merge MCPs
    merge_mcps(kit_dir / "mcps", dry_run)

    # Prepend CLAUDE.md
    prepend_claude_md(kit_dir, kit_id, dry_run)

    # Update metadata
    if not dry_run:
        metadata = load_json(METADATA_FILE)
        if "vibery_kits" not in metadata:
            metadata["vibery_kits"] = {}

        metadata["vibery_kits"][kit_id] = {
            "version": version,
            "installedAt": datetime.now().isoformat(),
            "files": installed_files,
        }
        save_json(METADATA_FILE, metadata)

    log(f"Installed {kit_id} v{version}", "green")
    return True


def uninstall_kit(kit_id: str, dry_run: bool = False) -> bool:
    """Uninstall a kit."""
    metadata = load_json(METADATA_FILE)
    installed = metadata.get("vibery_kits", {})

    if kit_id not in installed:
        log(f"Kit not installed: {kit_id}", "red")
        return False

    kit_data = installed[kit_id]
    log(f"\nUninstalling {kit_id}...", "blue")

    # Remove files
    for file_info in kit_data.get("files", []):
        # Determine full path based on file type
        rel_path = file_info["path"]
        if rel_path.endswith(".md"):
            if "agent" in rel_path or file_info.get("kit") == kit_id:
                full_path = CLAUDE_DIR / "agents" / rel_path
            else:
                full_path = CLAUDE_DIR / "commands" / rel_path
        else:
            full_path = CLAUDE_DIR / rel_path

        if full_path.exists():
            if file_info.get("ownership") == "kit":
                if dry_run:
                    log(f"  [DRY] Remove {rel_path}", "dim")
                else:
                    full_path.unlink()
                    log(f"  - {rel_path}", "dim")
            else:
                log(f"  Skipping user-modified: {rel_path}", "yellow")

    # Remove from CLAUDE.md
    if CLAUDE_MD.exists():
        content = CLAUDE_MD.read_text()
        marker_start = f"<!-- VIBERY-KIT:{kit_id}:"
        marker_end = f"<!-- /VIBERY-KIT:{kit_id} -->"

        if marker_start in content and marker_end in content:
            start_idx = content.find(marker_start)
            end_idx = content.find(marker_end) + len(marker_end)
            new_content = content[:start_idx] + content[end_idx:].lstrip("\n")
            if not dry_run:
                CLAUDE_MD.write_text(new_content)
                log(f"  - CLAUDE.md section removed", "dim")

    # Update metadata
    if not dry_run:
        del metadata["vibery_kits"][kit_id]
        save_json(METADATA_FILE, metadata)

    log(f"Uninstalled {kit_id}", "green")
    return True


def main():
    parser = argparse.ArgumentParser(description="Install Vibery kits")
    parser.add_argument("kits", nargs="*", help="Kit names to install")
    parser.add_argument("--list", action="store_true", help="List available kits")
    parser.add_argument("--installed", action="store_true", help="Show installed kits")
    parser.add_argument("--uninstall", metavar="KIT", help="Uninstall a kit")
    parser.add_argument("--dry-run", action="store_true", help="Preview without changes")

    args = parser.parse_args()

    if args.list:
        log("\nAvailable Kits:", "blue")
        for kit in list_available_kits():
            log(f"  {kit['id']} v{kit.get('version', '?')}", "green")
            log(f"    {kit.get('description', '')}", "dim")
        return

    if args.installed:
        installed = get_installed_kits()
        if not installed:
            log("\nNo kits installed", "yellow")
            return
        log("\nInstalled Kits:", "blue")
        for kit_id, data in installed.items():
            log(f"  {kit_id} v{data.get('version', '?')}", "green")
            log(f"    Installed: {data.get('installedAt', '?')}", "dim")
        return

    if args.uninstall:
        uninstall_kit(args.uninstall, args.dry_run)
        return

    if not args.kits:
        parser.print_help()
        return

    # Install kits
    CLAUDE_DIR.mkdir(parents=True, exist_ok=True)

    for kit_id in args.kits:
        install_kit(kit_id, args.dry_run)

    if not args.dry_run:
        log("\nDone! Restart Claude Code to apply changes.", "green")


if __name__ == "__main__":
    main()
