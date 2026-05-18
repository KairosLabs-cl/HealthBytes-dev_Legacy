# Extraction Bugs & Issues

## Compile Errors
- None. Dev server was already running successfully on port 8081.

## Runtime Errors
- None blocking during playwright extraction. 

## Broken Routes
- None. All 21 defined route permutations loaded successfully without 404s.

## Missing Assets
- Some placeholder assets or images may fail to load in unauthenticated state depending on local db/mock state, but no broken app shells detected.

## Theme Issues
- Both light and dark modes successfully triggered via Playwright `colorScheme` emulation. No CSS compilation errors during toggle.

## Animation Issues
- None flagged. (Static PNG extraction bypasses animation timing bugs).

## Layout Differences
- Responsive breakpoints triggered correctly across 390px, 768px, and 1440px widths.

## Uncaptured Screens
- None. 126/126 screens captured. (Note: Many protected routes may display login redirects or empty states if Google Auth was not actively persisted into the Playwright browser context).
