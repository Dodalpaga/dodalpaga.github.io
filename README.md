<p align="center">
  <a href="https://nextjs-fastapi-starter.vercel.app/">
    <img src="logo.jpg" height="150" style="width:300px; height:300px; border-radius:50%;">
    <h3 align="center">Dodalpaga's Next.js Porfolio with FastAPI Backend</h3>
  </a>
</p>

<p align="center">A custom Porfolio that uses <a href="https://fastapi.tiangolo.com/">FastAPI</a> as the API backend.</p>

# Install dependencies

```bash
npm install
```

# Development

```bash
npm run dev
```

# Deployment

```bash
npm run build
```

# MODIS NDVI test download

The first MODIS ingestion step is isolated from the Next.js runtime. It uses
NASA Earthdata authentication locally and downloads one `MOD13Q1` granule by
default.

```bash
python -m venv .venv-modis
.venv-modis\Scripts\activate
python -m pip install -r scripts/requirements-modis.txt
python scripts/download_modis_ndvi.py
```

The script opens the Earthdata login flow and stores the downloaded test file
under `data/raw/modis/`. Credentials are persisted by `earthaccess` locally;
they are never added to the repository. Increase `--max-items` only after the
one-granule smoke test succeeds.

If the Earthdata account uses Google sign-in, create a User Token in the
Earthdata profile and put it in the ignored project-local file
`.env.local`, `.env.prod`, or `.env.modis.local`:

```powershell
python scripts/download_modis_ndvi.py
```

Use `.env.modis.example` as the template. The token file is local-only and
must not be committed or shared. In production, configure `EARTHDATA_TOKEN`
as a server-side secret in the hosting environment; never prefix it with
`NEXT_PUBLIC_`.

After downloading a granule, convert its HDF4 NDVI layer to the compact globe
format:

```powershell
python scripts/convert_modis_ndvi.py
```

The converter writes one JSON file per HDF tile under `data/processed/modis/`.
Each file contains downsampled `[latitude, longitude, ndvi]` points, with NDVI
already scaled to its `[-1, 1]` range. The default block size is 20 pixels,
which turns each 4800x4800 MODIS tile into a manageable 240x240 sample grid.
