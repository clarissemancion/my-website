# Portfolio image uploads

Apply these instructions whenever adding, replacing, or uploading photography for this portfolio, including the gallery, lightbox, and other page imagery.

- Keep original photos and print masters in private storage outside the repository and the website's served directory. Add only the prepared web exports to GitHub.
- Start with an unwatermarked source. Export each intended web version at 75% of its unwatermarked dimensions, preserving aspect ratio. Apply the 25% reduction once. When replacing an existing export, use its unwatermarked baseline to avoid reducing it again.
- Bake **© Clarisse Mancion** into the pixels of every exported copy, including thumbnails and lightbox versions. Place it in the lower-right corner in small, regular-weight Georgia with translucent off-white text and a soft dark shadow. Match the current portfolio photos. Keep the mark subtle and readable.
- Use the site's existing WebP and JPEG formats. Match the current export settings of WebP quality 86 and JPEG quality 88.
- When replacing an image under the same filename, update the version query parameter on every reference to that image, including responsive sources and lightbox overrides, so browsers load the new copy.
- Verify the exported dimensions and watermark. Preview the affected image locally, including in the lightbox where applicable, before pushing to `main`.
