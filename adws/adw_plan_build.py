# adws/adw_plan_build.py
import asyncio
import sys
import os
from adw_modules.agent import Agent

# Simple Planner Prompt Template
PLANNER_PROMPT = """
You are a Senior Architect.
Analyze the following request and create a detailed implementation plan.
Output the plan in Markdown format.

Request: {request}
"""

# Simple Builder Prompt Template
BUILDER_PROMPT = """
You are a Senior Full Stack Engineer.
Implement the following plan. You have full access to the codebase.
Execute the necessary file creation and edits.

Plan:
{plan}
"""

async def main():
    if len(sys.argv) < 2:
        print("Usage: uv run adw_plan_build.py <issue_description_or_id>")
        sys.exit(1)

    issue_input = sys.argv[1]
    
    # 1. Planning Phase
    planner = Agent("SDLC_Planner", "You are an expert software architect.")
    print(f"📋 Planning phase for: {issue_input}")
    plan = await planner.run(PLANNER_PROMPT.format(request=issue_input))
    
    # Save plan (Optional)
    os.makedirs("specs", exist_ok=True)
    with open("specs/latest_plan.md", "w") as f:
        f.write(plan)

    # 2. Build Phase
    builder = Agent("SDLC_Implementor", "You are an expert developer with file access.")
    print("\n🏗️ Build phase starting...")
    await builder.run(BUILDER_PROMPT.format(plan=plan))

if __name__ == "__main__":
    asyncio.run(main())
