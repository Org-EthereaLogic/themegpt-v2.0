# adws/adw_modules/agent.py
import asyncio
from typing import Any
from anthropic import AsyncAnthropic


class Agent:
    def __init__(
        self,
        name: str,
        system_prompt: str,
        model: str = "claude-opus-4-5-20251101",
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.model = model
        self.client = AsyncAnthropic()

    async def run(self, prompt: str) -> str:
        print(f"\n🤖 [{self.name}] Starting task...")
        full_response = ""

        response = await self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=self.system_prompt,
            messages=[{"role": "user", "content": prompt}],
        )

        for block in response.content:
            if block.type == "text":
                print(block.text, end="", flush=True)
                full_response += block.text

        print(f"\n✅ [{self.name}] Finished.")
        return full_response


async def run_agent(name: str, system_prompt: str, prompt: str) -> str:
    agent = Agent(name, system_prompt)
    return await agent.run(prompt)
