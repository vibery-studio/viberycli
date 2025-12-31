# API Builder Kit - Use Cases

## Who This Is For

Backend developers building REST APIs in Node.js who need architecture guidance, clear documentation, and best practice patterns. Perfect for teams shipping production APIs without months of design overhead.

## Use Case 1: Design REST API Contract Before Coding

**Scenario:** Starting a new payment service API. Need to define endpoints, request/response schemas, and error codes BEFORE implementation.

**Prompt:** `Using the API Documenter, create an OpenAPI 3.1 spec for a payment service with endpoints: POST /payments (create), GET /payments/{id} (retrieve), GET /payments (list with pagination). Include proper HTTP status codes, error responses, and authentication via Bearer token.`

**Outcome:** Validated OpenAPI spec you can share with frontend team, auto-generate client SDKs, and use for contract testing.

## Use Case 2: Build Performant Node.js API Quickly

**Scenario:** Have OpenAPI spec, need actual implementation that handles async properly, doesn't block, and is production-ready.

**Prompt:** `Using the Backend Developer agent, generate a Node.js/Express REST API from this OpenAPI spec. Include async/await patterns, proper error handling middleware, input validation, and Jest test suite with 80%+ coverage.`

**Outcome:** Working API with modular architecture, comprehensive tests, and zero technical debt from day one.

## Use Case 3: Document Legacy API for Client Integration

**Scenario:** 6-month-old API with no formal docs. Clients asking for implementation examples and clarification on edge cases.

**Prompt:** `Using the API Documenter, reverse-engineer an OpenAPI 3.1 specification from this codebase. Include all endpoints, authentication mechanisms, pagination patterns, rate limiting, and common error scenarios with examples.`

**Outcome:** Professional OpenAPI spec, auto-generated interactive docs, client integration guides, and foundation for API versioning strategy.

## Quick Start Workflow

1. **Design:** Use API Documenter to create OpenAPI spec with clear contracts
2. **Build:** Use Backend Developer to implement with async patterns and tests
3. **Validate:** Run generated contract tests against implementation
4. **Document:** Auto-generate interactive docs from spec for clients
5. **Deploy:** Push production-ready code with monitoring already configured

## Pro Tips

- Start with OpenAPI design _before_ coding to prevent scope creep and miscommunication
- Use cursor-based pagination patterns for large datasets instead of offset-based
- Leverage batch requests in single endpoint to reduce N+1 query problems
- Set up rate limiting and query complexity analysis from day one, not as afterthought
- Generate client SDKs automatically so client teams stay in sync with API changes
