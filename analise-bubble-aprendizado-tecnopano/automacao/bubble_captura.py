#!/usr/bin/env python3
"""
Automação por cliques (Playwright) para capturar telas do Bubble ou outro web app.
Grava PNGs na pasta ../imagens/ por padrão.

Instalação (uma vez):
  cd automacao && python3 -m venv .venv && source .venv/bin/activate
  pip install -r requirements.txt
  playwright install chromium

Uso:
  python bubble_captura.py --steps steps.example.json
  python bubble_captura.py --steps meu_fluxo.json --profile ./perfil-navegador

Perfil persistente: mantém cookies/sessão após login manual na primeira execução.
Documentação de seletores: https://playwright.dev/python/docs/selectors
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeout
from playwright.sync_api import sync_playwright


def load_steps(path: Path) -> dict:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def run(
    steps_path: Path,
    output_dir: Path,
    profile_dir: Path | None,
    headless: bool,
    slow_mo_ms: int,
) -> None:
    data = load_steps(steps_path)
    start_url = data.get("start_url")
    if not start_url:
        print("JSON precisa de 'start_url'.", file=sys.stderr)
        sys.exit(1)

    viewport = data.get("viewport") or {"width": 1440, "height": 900}
    steps = data.get("steps") or []

    output_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        launch_kwargs = {
            "headless": headless,
            "slow_mo": slow_mo_ms,
        }

        if profile_dir:
            profile_dir.mkdir(parents=True, exist_ok=True)
            context = p.chromium.launch_persistent_context(
                user_data_dir=str(profile_dir),
                viewport=viewport,
                **launch_kwargs,
            )
            page = context.pages[0] if context.pages else context.new_page()
        else:
            browser = p.chromium.launch(**launch_kwargs)
            context = browser.new_context(viewport=viewport)
            page = context.new_page()

        try:
            page.goto(start_url, wait_until="domcontentloaded", timeout=60_000)
        except PlaywrightTimeout:
            print("Timeout ao abrir start_url.", file=sys.stderr)
            context.close()
            sys.exit(1)

        for i, step in enumerate(steps):
            label = step.get("comment") or f"step {i}"
            print(f"— {label}")

            if "wait_ms" in step:
                time.sleep(step["wait_ms"] / 1000.0)

            if "click" in step:
                sel = step["click"]
                timeout = step.get("timeout_ms", 15_000)
                try:
                    page.locator(sel).first.click(timeout=timeout)
                except PlaywrightTimeout:
                    print(f"  ERRO: clique não encontrado: {sel!r}", file=sys.stderr)
                    if step.get("required", True):
                        context.close()
                        sys.exit(2)

                after = step.get("wait_after_ms", 0)
                if after:
                    time.sleep(after / 1000.0)

            if "fill" in step:
                # {"fill": {"selector": "input#email", "value": "a@b.com"}}
                spec = step["fill"]
                page.locator(spec["selector"]).fill(spec["value"], timeout=spec.get("timeout_ms", 15_000))
                after = step.get("wait_after_ms", 0)
                if after:
                    time.sleep(after / 1000.0)

            if "screenshot" in step:
                out = output_dir / step["screenshot"]
                page.screenshot(path=str(out), full_page=step.get("full_page", True))
                print(f"  → {out}")

        print("Concluído.")
        if not headless:
            input("Enter para fechar o navegador… ")
        context.close()


def main() -> None:
    root = Path(__file__).resolve().parent
    default_out = root.parent / "imagens"
    default_profile = root / "perfil-chromium-bubble"

    parser = argparse.ArgumentParser(description="Clicks + screenshots via Playwright")
    parser.add_argument(
        "--steps",
        type=Path,
        default=root / "steps.example.json",
        help="JSON com start_url e lista de steps",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=default_out,
        help="Pasta para PNGs",
    )
    parser.add_argument(
        "--profile",
        type=Path,
        nargs="?",
        const=default_profile,
        default=None,
        help="Pasta de perfil Chromium (sessão). Use sem valor para ./perfil-chromium-bubble",
    )
    parser.add_argument("--headless", action="store_true", help="Sem janela (servidor/CI)")
    parser.add_argument("--slow-mo", type=int, default=0, help="Atraso entre ações (ms), debug")

    args = parser.parse_args()
    if not args.steps.is_file():
        print(f"Arquivo não encontrado: {args.steps}", file=sys.stderr)
        sys.exit(1)

    run(
        steps_path=args.steps.resolve(),
        output_dir=args.output.resolve(),
        profile_dir=args.profile.resolve() if args.profile else None,
        headless=args.headless,
        slow_mo_ms=args.slow_mo,
    )


if __name__ == "__main__":
    main()
