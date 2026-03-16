# Testing Structure

This project keeps all automated tests inside the `tests/` folder.

Folders:
- `tests/unit` contains component and service unit tests.
- `tests/e2e` contains route-level user journey tests.
- `tests/support` contains small shared testing helpers.

Scripts:
- `npm test` runs the full test suite once.
- `npm run test:unit` runs only component and service tests.
- `npm run test:e2e` runs only end-to-end route flows.
- `npm run test:watch` starts Angular's watcher for active test development.
