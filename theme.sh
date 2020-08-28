#!/bin/bash

mydir="$(dirname "$(realpath "$0")")"

pushd "$mydir" > /dev/null

M_ACCENT="#8BC34A"

replace_colors() {
    f="$1"
    # Neutral colors
    sed -i 's|#15191E|#212121|gi' "$f"
    sed -i 's|#181b21|#303030|gi' "$f"
    sed -i 's|#343a46|#424242|gi' "$f"
    sed -i 's|#61708b|#616161|gi' "$f"
    sed -i 's|#8E99A4|#808080|gi' "$f"
    sed -i 's|#B9BEC6|#b3b3b3|gi' "$f"
    sed -i 's|#A9B2BC|#b3b3b3|gi' "$f"
    sed -i 's|#c8c8cd|#cccccc|gi' "$f"
    sed -i 's|rgba(38, 39, 43,|rgba(48, 48, 48,|gi' "$f"

    # Accent colors
    sed -i "s|#368bd6|$M_ACCENT|gi" "$f"
    sed -i "s|#ac3ba8|$M_ACCENT|gi" "$f"
    sed -i "s|#0DBD8B|$M_ACCENT|gi" "$f"
    sed -i "s|#e64f7a|$M_ACCENT|gi" "$f"
    sed -i "s|#ff812d|$M_ACCENT|gi" "$f"
    sed -i "s|#2dc2c5|$M_ACCENT|gi" "$f"
    sed -i "s|#5c56f5|$M_ACCENT|gi" "$f"
    sed -i "s|#74d12c|$M_ACCENT|gi" "$f"
    sed -i "s|\\(\$roomtile-default-badge-bg-color: \\).*;|\\1$M_ACCENT;|gi" "$f"
}

replace_colors res/themes/dark/css/_dark.scss
replace_colors res/themes/light/css/_light.scss

popd > /dev/null
