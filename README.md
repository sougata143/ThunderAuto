# ThunderAuto

A modern, responsive website offering comprehensive specifications for various car models.

## Features

- 🚗 Comprehensive car specifications database
- 🔍 Advanced search functionality
- 📊 Car comparison tool with:
  - Side-by-side specification comparison
  - Difference highlighting
  - Print and export functionality
  - Advanced filtering options
- 🎯 Advanced filtering capabilities:
  - Make selection
  - Price range
  - Year range
  - Engine type
  - Transmission type
- ⭐ User reviews and ratings
- 🎮 Interactive 3D car models
- 🔢 VIN number lookup
- 📧 Newsletter subscription
- 🌐 Multilingual support (i18next)
- 📱 Social media integration
- 📊 Admin dashboard
- 🚀 Comprehensive car specifications with detailed technical specs
  - Engine details
  - Performance metrics
  - Chassis specifications
  - Dimensions
  - Transmission details
  - Fuel efficiency
  - Interior features
  - Safety technologies
  - Warranty information

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS
- Three.js for 3D models
- Apollo Client for GraphQL
- Headless UI components
- i18next for internationalization

### Backend
- Node.js
- Express.js
- GraphQL (Apollo Server)
- MongoDB
- Redis for caching
- RabbitMQ for message queue

### DevOps
- Docker
- AWS
- Jenkins
- Nginx

## Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- Redis >= 6.x
- RabbitMQ >= 3.12
- Docker
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/thunderauto.git
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd client
   npm install

   # Install backend dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   ```bash
   # In server directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Install and start required services:
   ```bash
   # Install MongoDB (if not installed)
   brew install mongodb-community
   brew services start mongodb-community

   # Install Redis (if not installed)
   brew install redis
   brew services start redis

   # Install RabbitMQ (if not installed)
   brew install rabbitmq
   brew services start rabbitmq
   ```

5. Create admin user:
   ```bash
   # In server directory
   cd server
   ts-node scripts/reset-admin.ts
   ```
   This will create an admin user with the following credentials:
   - Email: admin@thunderauto.com
   - Password: Admin@123

6. Start development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend development server
   cd client
   npm run dev
   ```

7. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - GraphQL Playground: http://localhost:4000/graphql
   - RabbitMQ Management UI: http://localhost:15672

## Project Structure

```
thunderauto/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       │   ├── CarFilterSort/      # Filtering component
│       │   ├── SpecificationCard/  # Car spec display
│       │   └── ComparisonPrintView/# Print-friendly comparison
│       ├── pages/        # Page components
│       ├── graphql/      # GraphQL queries and mutations
│       └── i18n/         # Internationalization files
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── models/       # MongoDB models
│   │   ├── graphql/      # GraphQL schema and resolvers
│   │   └── utils/        # Utility functions
│   └── tests/            # Test files
├── docker/               # Docker configuration files
└── docs/                 # Documentation

## Key Features Implementation

### Car Comparison System
- Enhanced CompareView page with advanced filtering
- Side-by-side car specification comparison
- Print and export functionality
- Visual difference highlighting between specifications

### Specification Display
- Flexible specification rendering
- Support for complex specification data
- Type-safe implementation
- Visual indicators for differences

### Filtering and Sorting
- Comprehensive filter options
- Multiple sorting strategies
- Responsive design
- Real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
