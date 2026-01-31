# Worktime Generator Chrome Extension

A lightweight Chrome extension that generates random worktime timestamps for a given month, excluding weekends and Taiwan public holidays.

## Features

- **Generate Worktimes**: Create N rows of 3 unique timestamps (08:30-16:30) per row.
- **Holiday Aware**: Automatically fetches and caches Taiwan public holidays to exclude them.
- **Month Selection**: Navigate between months to generate data for past or future periods.
- **Copy to Clipboard**: Easily copy generated rows for pasting into spreadsheets.
- **Offline Capable**: Caches holiday data for offline use after initial fetch.

## Quickstart

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd worktime-generator
    ```

2.  **Load in Chrome**:
    - Open `chrome://extensions`
    - Enable **Developer mode** (top right)
    - Click **Load unpacked**
    - Select the `specs/001-worktime-generator/chrome-extension` directory

3.  **Use**:
    - Click the extension icon.
    - Select the number of rows and month.
    - Click **Generate**.

## Development

See [specs/001-worktime-generator/quickstart.md](specs/001-worktime-generator/quickstart.md) for detailed development instructions.

## License

[MIT](LICENSE)