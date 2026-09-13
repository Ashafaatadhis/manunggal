<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Context Tools

- Use Graphify before broad codebase changes to inspect related nodes, neighbors, communities, and PR impact. Pass `C:\Coding\saas\manunggal` as `project_path` when needed.
- Use Obsidian vault `notes` for project notes and decisions. Read notes before editing; preserve returned etags for concurrent edits.
- Keep generated `graphify-out/` files out of manual edits. Regenerate Graphify output through its configured tooling when source changes require refresh.
- Project skills live under `.agents/skills/`. Prefer these skills over copying duplicates into `.claude/skills/`.
- Load the matching skill before Prisma, UI component, or other specialized work. Keep application-specific guidance in this file or a project skill.
