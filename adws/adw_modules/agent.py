# adws/adw_modules/agent.py
import asyncio
from typing import AsyncGenerator, Any
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock

class Agent:
    def __init__(self, name: str, system_prompt: str, model: str = "claude-3-5-sonnet-20241022"):
        self.name = name
        self.options = ClaudeAgentOptions(
            system_prompt=system_prompt,
            model=model,
            permission_mode="default",
            cwd="." # Runs from root
        )

    async def run(self, prompt: str) -> str:
        print(f"\n🤖 [{self.name}] Starting task...")
        full_response = ""
        
        async for message in query(prompt=prompt, options=self.options):
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(block.text, end="", flush=True)
                        full_response += block.text
        
        print(f"\n✅ [{self.name}] Finished.")
        return full_response

async def run_agent(name: str, system_prompt: str, prompt: str):
    agent = Agent(name, system_prompt)
    return await agent.run(prompt)
