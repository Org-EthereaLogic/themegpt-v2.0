# Orchestrating Multiple Agents - OpenAI Agents SDK

## Overview

Orchestration refers to the flow of agents in an application—which agents run, their execution order, and how they determine what happens next. The documentation describes two primary approaches:

1. **LLM-based orchestration**: Allowing the language model to make autonomous decisions
2. **Code-based orchestration**: Determining agent flow through programming logic

These patterns can be combined based on specific requirements.

## Orchestrating via LLM

This approach equips an agent with instructions, tools, and handoffs, enabling autonomous task planning. A research agent example might include web search, file retrieval, computer use, code execution, and handoffs to specialized agents.

**Key tactics mentioned:**

- "Invest in good prompts. Make it clear what tools are available, how to use them, and what parameters it must operate within."
- Monitor and iterate on performance based on observed failures
- Enable agent self-improvement through loops and error feedback
- Create specialized agents focused on specific tasks
- Invest in evaluation systems to train agents continuously

## Orchestrating via Code

This deterministic approach offers greater predictability regarding speed, cost, and performance. Common patterns include:

- Using structured outputs to generate inspectable data for routing decisions
- Chaining agents sequentially by transforming outputs into inputs
- Running feedback loops with evaluation agents until criteria are met
- Executing multiple agents in parallel using tools like `asyncio.gather`

The SDK provides example implementations in the `examples/agent_patterns` directory.
