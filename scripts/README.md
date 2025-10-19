# Badge Background Removal Scripts

This directory contains automation scripts for processing achievement badge images.

## Setup

```bash
cd scripts
npm install
```

## Usage

### Test Mode (Recommended First)

Process 10 test badges to validate the approach:

```bash
npm run remove-backgrounds
# or
node remove-badge-backgrounds.js --test
```

This will:
- Download 10 diverse badge images from Supabase storage
- Detect and remove colored square backgrounds
- Save processed badges with transparency to `output/processed-badges/`
- Generate a detailed log at `output/processing-log.txt`

### Review Results

1. Check the `output/processed-badges/` directory
2. Compare processed badges with originals
3. Verify backgrounds are transparent
4. Check that badge artwork is preserved

### Full Batch Mode

Once test batch is successful, process all 351 badges:

```bash
npm run remove-backgrounds:all
# or
node remove-badge-backgrounds.js --all
```

## How It Works

1. **Download**: Fetches badge images from Supabase storage
2. **Detect**: Samples corner pixels to identify background color
3. **Remove**: Makes background pixels transparent using color distance algorithm
4. **Save**: Exports as PNG with alpha transparency

## Algorithm Details

- **Corner Sampling**: Takes 5x5 pixel samples from all four corners
- **Color Detection**: Finds most common color = background
- **Tolerance**: Uses ±30 RGB unit tolerance for variations
- **Transparency**: Converts background pixels to alpha=0

## Output

- **Processed Images**: `output/processed-badges/*.png`
- **Detailed Log**: `output/processing-log.txt`
- **Original Files**: Remain untouched in Supabase

## Next Steps

After successful processing:
1. Review quality of all processed badges
2. Upload processed badges to Supabase (replace originals)
3. Update frontend to display new transparent badges
4. Enjoy beautiful floating badges in trophy case! 🏆
