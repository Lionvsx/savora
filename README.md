# Savora - AI-Powered Restaurant Discovery

Savora is an intelligent restaurant recommendation system that helps users discover the perfect dining experiences in Paris. It combines real-time web scraping, AI-powered analysis, and natural language processing to provide personalized restaurant suggestions.

## Features

- 🤖 **AI-Powered Recommendations**: Uses Claude 3.5 to analyze user requests and match them with restaurant data
- 🌐 **Real-time Web Scraping**: Intelligent scraping system with automatic pattern generation
- 🗺️ **Paris-Focused**: Specialized in Parisian restaurants with location-aware data collection
- 💬 **Natural Language Interface**: Simply describe your ideal dining experience in plain language
- 🎯 **Personalized Matching**: Considers cuisine, price range, location, and user preferences
- ⚡ **Real-time Updates**: Fresh data through automated scraping and validation

## Tech Stack

- **Frontend**: Next.js 15.1, React 19, TailwindCSS
- **AI/ML**: Claude 3.5 (Anthropic), OpenAI, Groq
- **Scraping**: Puppeteer, Cheerio, BrowserBase
- **Data Storage**: Upstash Redis, Vector Store
- **Infrastructure**: Vercel, Trigger.dev

## Getting Started

1. Clone the repository
2. Install dependencies:
3. Run the development server:

## Project Structure

- `/app`: Next.js application routes and pages
- `/components`: Reusable React components
- `/functions`: Core business logic and AI functions
- `/services`: Service layer for scraping and data processing
- `/trigger`: Background job definitions for Trigger.dev
- `/lib`: Utility functions and shared code

## Key Components

### AI Scraping System

The project features a sophisticated web scraping system that:

- Automatically generates scraping patterns using AI
- Validates and cleans extracted data
- Maintains data freshness through periodic updates
- Handles pagination and complex page structures

### Restaurant Recommendation Engine

Powered by Claude 3.5, the recommendation engine:

- Analyzes natural language queries
- Matches user preferences with restaurant data
- Provides detailed explanations for recommendations
- Includes specific quotes from customer reviews

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Scraping infrastructure by [BrowserBase](https://browserbase.com/)
- Background jobs by [Trigger.dev](https://trigger.dev/)
