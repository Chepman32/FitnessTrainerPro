# Exercise Photos

This directory contains exercise photos for the HomeScreen. The app now uses real exercise photos!

## Photo Requirements

1. **Format:** PNG or JPG
2. **Size:** Recommended 400x300px or larger
3. **Content:** Clear photos of people performing each exercise
4. **Style:** Professional fitness photography with good lighting

## Required Photos

- `pushups.png` - Person doing push-ups
- `plank.png` - Person holding plank position
- `squats.png` - Person doing squats
- `burpees.png` - Person doing burpees
- `lunges.png` - Person doing lunges
- `crunches.png` - Person doing crunches
- `mountain-climbers.png` - Person doing mountain climbers
- `jumping-jacks.png` - Person doing jumping jacks

## Current Status

✅ **Photos are now enabled!** The app will display your real exercise photos instead of fallback colors.

## Notes

- Photos are displayed with `resizeMode="cover"` for consistent card appearance
- The app automatically adds a dark overlay for text readability
- Photos fill the entire exercise card background
- If a photo fails to load, the app will fall back to the colored background
