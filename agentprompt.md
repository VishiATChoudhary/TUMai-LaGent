# LangGraph Agent Map for Landlord Management Tool (Updated Agent Design)

## Overview

This agent graph implements a LangGraph system using **Mistral** as the language model. It defines a pipeline that automates apartment-related communications, routing, asset management, and financial reporting for landlords.

---

## Visual Flow (Updated Agent Pipeline)

Start  
↓  
**Accumulator** → _Blob Storage_  
↓  
**Categorizer** → _Structured Messages Dataset_  
↓  
**Router**  
↓  
├── **Asset Expert**  
├── **Maintenance**  
└── **Taxation Report Generator**

---

## Agent Descriptions

### 1. Accumulator

- Collects messages from various communication channels (e.g., email, chat, forms).
- Sends all raw data to **Blob Storage**.
- Acts as the ingestion point of the system.

---

### 2. Categorizer

- Pulls data from **Blob Storage**.
- Performs:
  - Malicious content detection
  - Message prioritization
  - Category tagging:
    - Complaints
    - Maintenance
    - Emergency
    - General Information
- Adds metadata and routes the cleaned, labeled messages to the **Structured Messages Dataset**.

---

### 3. Router

- Reads from the **Structured Messages Dataset**.
- Extracts relevant context:
  - Location
  - Customer information
  - Time/date
- Routes messages to the appropriate agent based on category:
  - `Asset Expert`
  - `Maintenance`
  - `Taxation Report Generator`

---

## Specialized Agents

### 4. Asset Expert

- Has access to a knowledge base of assets.
- Answers basic user queries related to property features, appliances, and asset history.
- Designed for fast, low-latency responses.
- Uses Mistral to generate helpful replies.

---

### 5. Maintenance

- Handles maintenance-related issues.
- Scrapes external sources (e.g., vendor or city maintenance sites) for possible solutions.
- Suggests multiple options (DIY, professional, etc.).
- If permitted by the landlord:
  - Contacts contractors or technicians
  - Orders equipment or parts
  - Sends confirmation to the landlord

---

### 6. Taxation Report Generator

- Connects to the **Financial Database**.
- Produces:
  - A standard taxation PDF report
  - A natural language summary for chatbot interactions
- Mistral is used to generate the tax-related prompt version.

---

## Data Stores and Channels

- **Blob Storage**: Stores raw incoming messages.
- **Structured Messages Dataset**: Contains enriched, categorized messages.
- **Financial Database**: Used by the Taxation Report Generator to fetch revenue, expenses, etc.

---

## Implementation Guidelines

- Each agent is a **LangGraph node**.
- Transitions are **directed** between processing steps.
- Use Mistral for:
  - Categorization (in Categorizer)
  - Information extraction (in Router)
  - Answer generation (in Asset Expert and Maintenance)
  - Chatbot prompt formatting (in Taxation Report Generator)

---

## Output Requirements (for Cursor)

Cursor should generate:

1. A **LangGraph Python graph**, with:
   - Node definitions
   - Transitions
2. Agent node implementations:
   - Accumulator
   - Categorizer
   - Router
   - Asset Expert
   - Maintenance
   - Taxation Report Generator
3. Dataset interface placeholders:
   - Blob Storage
   - Structured Messages Dataset
   - Financial Database
4. Mistral prompt examples per agent.
5. Inline comments and extensible code structure.

---

## Notes

- Make Categorizer and Router resilient to failures with fallback logic.
- Securely log metadata and redactions (especially for malicious content).
- Design for scale: Each node should run independently and be queue-compatible (e.g., message bus / event-driven).

---

## Optional Future Additions

- **Legal Agent**: For contract/eviction questions.
- **Communication Agent**: For personalized tenant updates.
- **Scheduler**: To manage appointments, viewings, repairs.

---
