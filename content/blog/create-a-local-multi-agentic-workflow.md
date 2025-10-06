---
title: 'Create a multi-agentic workflow using AI tools'
description: 'This demonstrates how to create a multi-agentic workflow using AI tools such as LangGraph, LangChain, and LangSmith.'
image: '/images/multi_agent.jpg'
date: '2025-01-07'
---

# Introduction

The rise of large language models (LLMs) has popularized **multi-agent workflows**, where multiple autonomous agents collaborate to solve complex tasks.  
In such workflows, each _agent_ is an independent actor powered by an LLM, with its own prompt, model, and toolset. These agents are connected by a control architecture — typically represented as a graph — that manages their information flow and interactions.

This approach allows complex problems to be decomposed into manageable subtasks, handled by specialized agents. For instance, in document research, one agent can gather sources, another can verify data, and a third can synthesize findings into a report.

As Andrew Ng observed, _“Agentic workflows are poised to massively accelerate AI progress this year.”_ Multi-agent architectures go beyond simple sequential LLM chains (like chatbots or Q&A systems) to handle branching, looping, and stateful workflows — scenarios where graph-based orchestration becomes essential.

To support these advanced workflows, the **[LangChain](https://www.langchain.com)** ecosystem offers a suite of tools: **[LangChain](https://python.langchain.com/docs)** for LLM chain composition, **[LangGraph](https://langchain-ai.github.io/langgraph/)** for orchestrating agentic graphs, and **[LangSmith](https://smith.langchain.com/)** for monitoring and debugging executions.  
This article explores these concepts with a concrete example: a **multi-agent RAG (Retrieval-Augmented Generation)** workflow for scientific research.

---

# Table of Contents

- [Introduction](#introduction)
- [Table of Contents](#table-of-contents)
- [Understanding Multi-Agent Workflows](#understanding-multi-agent-workflows)
- [LangChain, LangGraph, and LangSmith](#langchain-langgraph-and-langsmith)
- [Case Study: RAG for Scientific Research](#case-study-rag-for-scientific-research)
- [Requirements](#requirements)

---

# Understanding Multi-Agent Workflows

A _multi-agent workflow_ is based on the idea of autonomous entities collaborating within a **control graph**.  
Each agent is represented as a node, with its own prompt, model, and tools. The edges define communication and data exchange between agents.  
This graph-based approach offers a transparent, modular view of the workflow and enables explicit control of state transitions.

<div style="display:flex; justify-content:center;">
  <img style="border-radius: 20px; max-height:300px" src="https://blog.langchain.dev/content/images/2024/01/supervisor-diagram.png" alt="LangGraph multi-agent diagram" height="50%">
</div>

<div style="display:flex; justify-content:center; font-style: italic">Figure 1 – Simplified representation of a LangGraph multi-agent workflow.</div>

Key advantages of multi-agent workflows include:

- **Task specialization:** Each agent focuses on a specific function (e.g., “retriever,” “summarizer”), improving performance and reliability.
- **Dedicated prompts and models:** Each agent can be tuned to its subtask with a custom prompt and model.
- **Separation of concerns:** Agents can be developed and tested independently, making the system easier to maintain.
- **Problem decomposition:** Complex problems can be split into smaller, domain-focused subtasks.

In short, multi-agent architectures bring modularity, flexibility, and scalability to intelligent systems.

---

# LangChain, LangGraph, and LangSmith

The **LangChain ecosystem** provides three main tools to build such systems:

- **[LangChain](https://python.langchain.com/docs)** – the foundational library for composing modular LLM applications (prompts, models, tools, memory). Ideal for linear chains such as chatbots or Q&A systems.
- **[LangGraph](https://langchain-ai.github.io/langgraph/)** – an extension for orchestrating **graph-based** workflows with states and loops. It allows explicit node modeling and centralized state management.
- **[LangSmith](https://smith.langchain.com/)** – an observability and evaluation platform that logs, traces, and inspects every step of execution for debugging and optimization.

These layers are designed to work together. You typically start with LangChain for prototyping linear chains, then move to LangGraph when you need branching, reentrancy, or persistence. LangGraph builds on LangChain’s components but adds explicit state handling and robust control flow.  
LangSmith complements both by tracking and visualizing each prompt, call, and response.

As summarized by Galileo.AI’s Valur Bronsdon:

> _“LangChain excels at simple linear flows, LangGraph orchestrates complex stateful workflows, and LangSmith provides observability.”_

Together, these tools form a production-ready stack for designing, running, and monitoring complex agentic systems.

---

# Case Study: RAG for Scientific Research

**[Retrieval-Augmented Generation (RAG)](https://python.langchain.com/docs/use_cases/question_answering/)** is a perfect use case to illustrate a multi-agent workflow.  
In scientific research, a RAG system can automatically answer questions by retrieving and synthesizing text from academic papers.

The classic RAG process consists of two main phases:

1. **Indexing (offline):** Documents (e.g., papers, reports) are loaded, split into chunks, and stored as embeddings in a vector database.
2. **Retrieval & Generation (online):** Given a user query, a retriever pulls the most relevant chunks, which are passed to an LLM to generate a contextually grounded answer.

<div style="display:flex; justify-content:center;">
  <img style="border-radius: 20px; max-height:200px" src="https://python.langchain.com/assets/images/rag_concepts-4499b260d1053838a3e361fb54f376ec.png" alt="RAG workflow diagram" />
</div>
<div style="display:flex; justify-content:center; font-style: italic">Figure 2 – Simplified RAG architecture from LangChain documentation.</div>

In a **multi-agent version**, these tasks are distributed across specialized agents:

- **Supervisor (Editor-in-Chief):** Oversees the overall process and orchestrates other agents.
- **Research Agent:** Performs deep literature searches and retrieves candidate documents.
- **Planner Agent:** Defines the structure of the research report and delegates subtasks.
- **Reviewer Agent:** Evaluates intermediate drafts and ensures coherence.
- **Reviser Agent:** Improves writing based on feedback.
- **Writer Agent:** Compiles and writes the final report.
- **Publisher Agent:** Formats and exports the report (e.g., PDF, Markdown).

<div style="display:flex; justify-content:center;">
  <img style="border-radius: 20px; max-height:450px" src="https://blog.langchain.com/content/images/2024/05/1_ABcpKZRWsJRb9MIpkJ0htQ.webp" alt="Multi-agent workflow example" />
</div>

<div style="display:flex; justify-content:center; font-style: italic">Figure 3 – Example of a hierarchical multi-agent workflow for scientific research.</div>

This modular architecture mirrors a real editorial process — each agent handles a distinct responsibility.  
LangGraph manages this as a directed workflow: the Supervisor triggers the Planner, which spawns multiple Research Agents; results flow through Reviewer/Reviser loops until the Writer and Publisher finalize the output.

Each agent maintains its own context and tools, yet all share a common graph state for smooth coordination.  
This approach greatly enhances reliability, traceability, and scalability.

---

# Requirements

To build a similar workflow, ensure you have:

- **Python 3.9+** with `pip` or `conda`
- Libraries: [`langchain`](https://pypi.org/project/langchain/), [`langgraph`](https://pypi.org/project/langgraph/), [`langsmith`](https://pypi.org/project/langsmith/), and [`chromadb`](https://pypi.org/project/chromadb/)
- An **API key** (e.g., [OpenAI](https://platform.openai.com/), [Anthropic](https://www.anthropic.com/), or [Ollama](https://ollama.ai/))
- A **vector store** (like [ChromaDB](https://www.trychroma.com/), [QDrant](https://qdrant.tech/), Cassandra, or Pinecone) for embeddings
- Basic understanding of document processing (chunking, embedding, retrieval)
