```bash
.\.venv-modis\Scripts\python.exe scripts/download_modis_ndvi.py `  --start 2019-12-19`
--end 2019-12-20 `
--max-items 560

.\.venv-modis\Scripts\python.exe scripts/convert_modis_ndvi.py --input data/raw/modis --output data/processed/modis --workers 4; New-Item -ItemType Directory -Force public\data\modis | Out-Null; Copy-Item data\processed\modis\*.json public\data\modis\ -Force
```
