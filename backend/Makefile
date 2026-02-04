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

