"""Download MODIS MOD13Q1 NDVI/EVI granules from NASA Earthdata.

The default request is intentionally small: one day and one granule. Increase
--max-items only after the smoke test succeeds.
"""

from __future__ import annotations

import argparse
import os
from datetime import date, timedelta
from pathlib import Path

import earthaccess
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
for env_file in ('.env.local', '.env.prod', '.env.production', '.env.modis.local'):
    load_dotenv(PROJECT_ROOT / env_file, override=False)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--start', default='2020-01-01', help='First acquisition date (YYYY-MM-DD).')
    parser.add_argument('--end', default=None, help='Exclusive end date (YYYY-MM-DD). Defaults to start + 1 day.')
    parser.add_argument('--max-items', type=int, default=1, help='Maximum number of granules to download.')
    parser.add_argument('--output', type=Path, default=Path('data/raw/modis'), help='Output directory.')
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    start = date.fromisoformat(args.start)
    end = date.fromisoformat(args.end) if args.end else start + timedelta(days=1)
    if end <= start:
        raise SystemExit('--end must be after --start')
    if args.max_items < 1:
        raise SystemExit('--max-items must be at least 1')

    print('Opening NASA Earthdata authentication...')
    if os.environ.get('EARTHDATA_TOKEN'):
        earthaccess.login(strategy='environment')
    else:
        earthaccess.login(strategy='interactive', persist=True)
    results = earthaccess.search_data(
        short_name='MOD13Q1',
        version='061',
        temporal=(start.isoformat(), end.isoformat()),
    )
    selected = results[:args.max_items]
    if not selected:
        raise SystemExit('No MOD13Q1 granules found for the requested dates.')

    args.output.mkdir(parents=True, exist_ok=True)
    print(f'Found {len(results)} granule(s); downloading {len(selected)} to {args.output}')
    downloaded = earthaccess.download(selected, local_path=str(args.output))
    print(f'Downloaded {len(downloaded)} file(s).')


if __name__ == '__main__':
    main()
