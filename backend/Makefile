# Makefile for backend using uv

.PHONY: install run dev


install:
	uv sync

lint:
	uv run ruff check .

fmt:
	uv run ruff format .

run:
	PYTHONPATH=. uv run uvicorn app.main:app --reload

dev:
	PYTHONPATH=. uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

test:
	PYTHONPATH=. uv run pytest -v

test-coverage:
	PYTHONPATH=. uv run pytest --cov=app --cov-report=html

database:
	docker compose -f docker-compose.yml up -d

env:
	@if [ -f .env ]; then \
		read -p ".env file already exists. Overwrite? (y/N): " yn; \
		case $$yn in \
			[Yy]*) \
				echo "API_KEY=supersecretapikey" > .env; \
				echo "DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5430/fastapi_db" >> .env; \
				;; \
			*) \
				echo "Aborted. .env not overwritten."; \
				exit 1; \
				;; \
		esac \
	else \
		echo "API_KEY=supersecretapikey" > .env; \
		echo "DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5430/fastapi_db" >> .env; \
	fi

setup: 
	$(MAKE) install
	$(MAKE) env
	$(MAKE) database
	PYTHONPATH=. uv run alembic upgrade head
	@echo ""
	@echo "  Setup complete!"
	@echo "  --->   API_KEY and DATABASE_URL have been added to .env file."
	@echo "  --->   Database is running on localhost:5430 with username 'postgres' and password 'postgres'."
	@echo "  --->   You can run the application using 'make dev'."
	