#!/bin/bash

# Reorganize Philharmonia samples to match expected structure
# Expected: philharmonia/{family}/{instrument}/{file}.mp3
# Current:  philharmonia/{family}/{Family}/{instrument}/{file}.mp3

PHIL_DIR="client/public/sounds/philharmonia"

echo "🔄 Reorganizing Philharmonia samples..."
echo ""

# Process each family
for family in strings woodwinds brass percussion; do
    FAMILY_DIR="$PHIL_DIR/$family"

    # Check if the capitalized subdirectory exists (from ZIP extraction)
    FAMILY_CAP_DIR="$FAMILY_DIR/$(echo ${family:0:1} | tr '[:lower:]' '[:upper:]')${family:1}"
    if [ "$family" = "woodwinds" ]; then
        FAMILY_CAP_DIR="$FAMILY_DIR/Woodwind"
    elif [ "$family" = "brass" ]; then
        FAMILY_CAP_DIR="$FAMILY_DIR/Brass"
    elif [ "$family" = "strings" ]; then
        FAMILY_CAP_DIR="$FAMILY_DIR/Strings"
    elif [ "$family" = "percussion" ]; then
        FAMILY_CAP_DIR="$FAMILY_DIR/Percussion"
    fi

    if [ -d "$FAMILY_CAP_DIR" ]; then
        echo "📁 Processing $family..."

        # Move all instrument directories from capitalized folder to parent
        for instrument_dir in "$FAMILY_CAP_DIR"/*; do
            if [ -d "$instrument_dir" ]; then
                instrument_name=$(basename "$instrument_dir")
                echo "   Moving $instrument_name..."

                # If target directory exists, merge; otherwise move
                if [ -d "$FAMILY_DIR/$instrument_name" ]; then
                    # Merge by copying files
                    cp -r "$instrument_dir"/* "$FAMILY_DIR/$instrument_name/" 2>/dev/null
                else
                    # Move entire directory
                    mv "$instrument_dir" "$FAMILY_DIR/"
                fi
            fi
        done

        # Remove the now-empty capitalized directory
        rm -rf "$FAMILY_CAP_DIR"
        echo "   ✅ Done"
        echo ""
    else
        echo "⏭️  Skipping $family (already organized or not extracted)"
        echo ""
    fi
done

# Count final MP3s
echo "📊 Final counts:"
for family in strings woodwinds brass percussion; do
    count=$(find "$PHIL_DIR/$family" -name "*.mp3" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "   $family: $count MP3 files"
done

echo ""
echo "✅ Reorganization complete!"
