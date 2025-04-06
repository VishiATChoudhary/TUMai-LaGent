# TUMai-LaGent

A multi-agent system built with LangGraph and Mistral AI for intelligent property management and maintenance assistance.

## Overview

TUMai-LaGent is an advanced property management assistant that leverages multiple AI agents to handle various aspects of property management, including maintenance requests, asset management, taxation, and general inquiries. The system uses Mistral AI for natural language processing and integrates with various tools and services to provide comprehensive assistance.

## Architecture

The system is built using a multi-agent architecture with the following components:

### Backend Agents

1. **Base Agent**
   - Foundation for all specialized agents
   - Handles tool integration and basic message processing

2. **Categorizer Agent**
   - Analyzes incoming messages to determine their category and urgency
   - Integrates with Supabase for result storage
   - Categories include: maintenance, tax, noise-complaint, and miscellaneous

3. **Router Agent**
   - Routes messages to appropriate specialized agents based on content
   - Supports routing to: maintenance, asset_expert, taxation, and email_drafter

4. **Maintenance Agent**
   - Handles maintenance-related queries
   - Features:
     - Location extraction from messages
     - Maintenance worker search using Tavily API
     - Automated email notifications
     - Integration with maintenance worker contact system

5. **Asset Expert Agent**
   - Specializes in property asset management
   - Provides detailed information about property assets
   - Uses various tools for enhanced responses

6. **Taxation Report Generator**
   - Handles tax-related queries and report generation
   - Provides tax-related information and guidance

7. **Email Drafter**
   - Specializes in drafting professional emails
   - Helps with communication-related tasks

### Tools Integration

The system integrates with several external tools and services:

- **Tavily Search API**: For finding maintenance workers and relevant information
- **Supabase**: For storing categorizer results and other data
- **Email Service**: For sending notifications and communications
- **Python REPL**: For executing code when needed
- **Speech-to-Text Model**: For converting voice messages into text, enabling voice-based interactions with the system. This allows users to:
  - Record voice messages for maintenance requests
  - Dictate property-related queries
  - Provide hands-free interaction with the system
  - Access the system's capabilities through voice commands

### Frontend Implementation

The frontend is built using modern web technologies:

- **Vite**: For fast development and building
- **TypeScript**: For type-safe development
- **Tailwind CSS**: For styling
- **React**: For building the user interface

The frontend provides a clean and intuitive interface for users to interact with the AI agents, featuring:
- Real-time chat interface
- Message history
- Category visualization
- Response formatting
- Error handling and loading states

## Setup and Installation

### Backend

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. Run the backend server:
```bash
python run_api.py
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

## Environment Variables

Required environment variables:
- `MISTRAL_API_KEY`: Your Mistral AI API key
- `TAVILY_API_KEY`: Your Tavily Search API key
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase API key

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 