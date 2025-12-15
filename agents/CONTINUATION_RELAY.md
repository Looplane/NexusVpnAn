# 🔁 CONTINUATION RELAY

# 🔁 CONTINUATION RELAY

## HANDOFF PROTOCOL
If execution is interrupted (e.g., context limit, timeout):

1.  **Snapshot State:** Ensure `TODO.md` accurately reflects what is done and what is pending.
2.  **Commit Changes:** If possible, commit current progress to git.
3.  **Relay:** The next agent will read `TODO.md` and `PHASES.md` to resume immediately.
4.  **No User Input:** The user should not need to re-prompt. The system auto-recovers.

*Key:* `TODO.md` is the single source of truth for state.
