#!/bin/bash

mydir="$(dirname "$(realpath "$0")")"

pushd "$mydir" > /dev/null

M_ACCENT="#8BC34A"
M_ACCENT_DARK="#689F38"

replace_colors() {
    f="$1"
    # Neutral colors
    sed -i 's|#15171b|#212121|gi' "$f"
    sed -i 's|#15191E|#212121|gi' "$f"
    sed -i 's|#181b21|#303030|gi' "$f"
    sed -i 's|#1A1D23|#303030|gi' "$f"
    sed -i 's|#20252B|#303030|gi' "$f"
    sed -i 's|#20252c|#303030|gi' "$f"
    sed -i 's|#238cf5|#303030|gi' "$f"
    sed -i 's|#25271F|#303030|gi' "$f"
    sed -i 's|#272c35|#303030|gi' "$f"
    sed -i 's|#343a46|#424242|gi' "$f"
    sed -i 's|#3c4556|#424242|gi' "$f"
    sed -i 's|#61708b|#616161|gi' "$f"
    sed -i 's|#616b7f|#616161|gi' "$f"
    sed -i 's|#8E99A4|#808080|gi' "$f"
    sed -i 's|#9fa9ba|#aaaaaa|gi' "$f"
    sed -i 's|#B9BEC6|#b3b3b3|gi' "$f"
    sed -i 's|#a1b2d1|#b3b3b3|gi' "$f"
    sed -i 's|#A9B2BC|#b3b3b3|gi' "$f"
    sed -i 's|#c8c8cd|#cccccc|gi' "$f"
    sed -i 's|#e3e8f0|#eeeeee|gi' "$f"
    sed -i 's|#edf3ff|#eeeeee|gi' "$f"
    sed -i 's|#f2f5f8|#ffffff|gi' "$f"
    sed -i 's|rgba(33, 38, 34,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(34, 38, 46,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(38, 39, 43,|rgba(48, 48, 48,|gi' "$f"
    sed -i 's|rgba(92, 100, 112,|rgba(97, 97, 97,|gi' "$f"
    sed -i 's|rgba(141, 151, 165,|rgba(144, 144, 144,|gi' "$f"

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
    sed -i "s|\\(\$reaction-row-button-selected-bg-color: \\).*;|\\1$M_ACCENT_DARK;|gi" "$f"
}

replace_colors res/themes/dark/css/_dark.scss
replace_colors res/themes/light/css/_light.scss
replace_colors res/themes/legacy-light/css/_legacy-light.scss
replace_colors res/themes/legacy-dark/css/_legacy-dark.scss

popd > /dev/null
