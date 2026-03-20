# GitHub Issues & Milestones Tracking Guide

This guide is designed to instruct AI Development Agents on our strict workflow for managing work via GitHub Issues and Milestones for our project (`helloversitale/dashboardbuera`). If you have been provided this guide, you **MUST** follow these procedures whenever instructed to work on a task.

## 🎯 Core Principles
1. **No Code Without an Issue**: Every feature, bug fix, or refactor must be tracked by a corresponding GitHub issue.
2. **Track Progress Continuously**: Do not wait until the task is fully complete to update GitHub. Keep a log of your progress inside the issue.
3. **Keep Milestones Updated**: Ensure that issues are assigned to their respective milestones where appropriate.

## 🔄 Standard Workflow for AI Agents

### 1. Initialization (Start of Chat / Task)
When you receive a new goal from the user:
- Search for existing issues using your GitHub tools (`mcp_github-mcp-server_search_issues` or `mcp_github-mcp-server_list_issues`).
- If an issue already covers the request, **comment** that you are beginning work on it.
- If no issue exists, **create a new issue** (`mcp_github-mcp-server_issue_write`) with a clear title, an objective description, and link it to the relevant milestone if directed by the user. 
  - Always briefly confirm the issue creation with the user before diving into the code implementation.

### 2. Implementation & Progress Updates
While actively coding, investigating, or debugging:
- For complex tasks taking multiple steps, add intermediate comments (`mcp_github-mcp-server_add_issue_comment`) to the issue to document technical decisions, architectural choices, blockers, or partial milestone achievements.
- If you create a Pull Request, make sure to cross-reference the issue (e.g., "Fixes #123").

### 3. Task Completion
When the user's request has been fully implemented and verified:
- Close the issue (`mcp_github-mcp-server_issue_write` with state: `closed` and state_reason: `completed`).
- Add a final detailed comment explaining the implemented solution, covering any new features added or bugs fixed.
- Check if the current milestone needs updating or reviewing.

## 🛠️ Required MCP Server Tools
You have access to the `github-mcp-server` to seamlessly execute these directives. Key tools to rely on:
- `mcp_github-mcp-server_issue_write` (to create, edit, or close issues)
- `mcp_github-mcp-server_add_issue_comment` (to post continuous progress updates)
- `mcp_github-mcp-server_search_issues` (to look up issues and prevent duplicates)

## 📌 Repository Information
- **Owner**: `helloversitale`
- **Repo**: `dashboardbuera`

Always apply these rules rigorously to ensure the project remains organized, disciplined, and easy to track!
