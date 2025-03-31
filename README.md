# Relâmpago Marquinhos

Relâmpago Marquinhos is a TypeScript-based project designed to manage electric vehicle charging stations and user interactions. It includes a server, client, and utilities for managing stations, users, and charging sessions.

## Prerequisites

To set up the environment, ensure you have the following installed:

1. **Node.js**: Install the latest stable version of Node.js from [Node.js official website](https://nodejs.org/).
2. **Corepack**: Corepack is included with Node.js starting from version 16.10.0. Enable it by running:
   ```bash
   corepack enable
   ```
3. **Yarn 4**: This project uses Yarn 4 as the package manager. Corepack will automatically manage the correct version of Yarn for this project.

## Installing Dependencies

To install the dependencies, run the following command in the root directory of the project:
```bash
yarn install
```

> **Note**: This project uses Yarn Workspaces to manage dependencies across multiple packages. Because of this, **no other package manager (e.g., npm, pnpm) can be used**. Using a different package manager may result in dependency resolution issues.

## Project Structure

The project is organized as follows:

```
.
├── .editorconfig          # Editor configuration for consistent coding styles
├── .gitattributes         # Git attributes for handling file types
├── .gitignore             # Files and directories to ignore in Git
├── .vscode/               # VS Code-specific settings and extensions
│   ├── extensions.json    # Recommended extensions for VS Code
│   └── settings.json      # VS Code workspace settings
├── Dockerfile             # Dockerfile for running tests
├── DockerfileC            # Dockerfile for running the car client
├── DockerfileS            # Dockerfile for running the server
├── install-deps.sh        # Script to install dependencies in a Docker container
├── package.json           # Root package configuration
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest configuration for testing
├── apps/                  # Workspace for sub-projects
│   └── car/               # Car client application
│       ├── .editorconfig  # Editor configuration for the car app
│       ├── .gitattributes # Git attributes for the car app
│       ├── .gitignore     # Files to ignore in the car app
│       ├── .prettierignore# Prettier ignore file for the car app
│       ├── package.json   # Package configuration for the car app
│       ├── readme.md      # Readme for the car app
│       ├── src/           # Source code for the car app
│       │   ├── app.tsx    # Main entry point for the car app
│       │   ├── appRegistry.tsx # App registry for the car app
│       │   └── components/ # Components for the car app
│       │       ├── screen/ # Screen component
│       │       └── resizableRootContainer/ # Resizable container component
│       └── test.tsx       # Tests for the car app
├── src/                   # Main source code
│   ├── car.ts             # Car client implementation
│   ├── location.ts        # Utilities for location calculations
│   ├── main.ts            # Main logic for recommendations
│   ├── main.test.ts       # Tests for the main logic
│   ├── main.types.ts      # Type definitions
│   ├── schemas/           # Zod schemas for validation
│   │   ├── carSchema.ts   # Schema for car validation
│   │   ├── locationSchema.ts # Schema for location validation
│   │   └── stationSchema.ts  # Schema for station validation
│   ├── server.ts          # Server implementation
│   └── server/            # Server-related logic
│       ├── router.ts      # Router for handling requests
│       └── routes/        # Routes for specific server actions
│           ├── registerCar.ts # Route for registering users
│           ├── registerStation.ts # Route for registering stations
│           ├── startCharging.ts # Route for starting a charging session
│           └── stationSuggestions.ts # Route for station recommendations
└── README.md              # Project documentation
```

## Key Features

- **Server**: Handles requests for registering users, stations, and managing charging sessions.
- **Car Client**: Simulates a car interacting with the server.
- **Utilities**: Includes helper functions for calculations and logging.
- **Validation**: Uses Zod schemas for strict type validation.
- **Testing**: Includes unit tests using Vitest.

## Running the Project

### Start the Server
To start the server, run:
```bash
yarn run runserver
```

### Run the Car Client
To simulate a car client, run:
```bash
yarn run runcar
```

### Run Tests
To execute the test suite, run:
```bash
yarn test
```

## Notes

- The project uses strict TypeScript configurations for better type safety.
- Dockerfiles are provided for containerized environments.
- Recommended VS Code extensions are listed in `.vscode/extensions.json`.

Feel free to explore the codebase and contribute!
