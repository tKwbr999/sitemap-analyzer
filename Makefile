.PHONY: compile-check lint fmt test check-all help install

# Default target
help:
	@echo "Available commands:"
	@echo "  make fmt              - Format code with Prettier"
	@echo "  make lint             - Run ESLint"
	@echo "  make compile-check    - Check for TypeScript compilation errors"
	@echo "  make test             - Run tests"
	@echo "  make check-all        - Run fmt, lint, compile-check, and test in sequence"
	@echo "  make install          - Install dependencies"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	npm install --save-dev typescript ts-node @types/node prettier eslint eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser jest @types/jest ts-jest

# Format code with Prettier
fmt:
	@echo "Formatting code..."
	npx prettier --write "src/**/*.ts" "*.ts"

# Run ESLint
lint:
	@echo "Running ESLint..."
	npx eslint --ext .ts src/ *.ts

# Check for TypeScript compilation errors
compile-check:
	@echo "Checking for TypeScript compilation errors..."
	npx tsc --noEmit

# Run tests
test:
	@echo "Running tests..."
	npx jest

# Run all checks in sequence
check-all: fmt lint compile-check test
	@echo "All checks completed successfully!"
