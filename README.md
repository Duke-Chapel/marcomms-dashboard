# Marketing Analytics Dashboard

A comprehensive marketing analytics dashboard that visualizes data from multiple channels including social media, email marketing, and YouTube.

## Overview

This dashboard integrates data from different marketing channels to provide a unified view of your marketing performance. It includes visualizations for:

- Executive summary with cross-channel performance metrics
- Social media analytics (Facebook and Instagram)
- Email marketing performance
- YouTube channel analytics

## Deployment Instructions

### Option 1: GitHub Pages Deployment (Recommended)

1. **Create a GitHub Repository**
   - Create a new public repository on GitHub
   - Name it something descriptive like "marketing-dashboard"

2. **Upload the Files**
   - Clone the repository or download it to your local machine
   - Add all files maintaining the following structure:

```
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   ├── charts.js
│   ├── dashboard.js
│   ├── executive-dashboard.js
│   ├── social-dashboard.js
│   ├── email-dashboard.js
│   └── youtube-dashboard.js
├── data/
│   ├── facebook_data.json
│   ├── instagram_data.json
│   ├── email_data.json
│   ├── youtube_data.json
│   └── cross_channel_data.json
└── tools/
    ├── csv-to-json.js
    └── data-converter.html
```

3. **Enable GitHub Pages**
   - Go to your repository's Settings
   - Scroll down to the "GitHub Pages" section
   - Select the branch you want to deploy (usually "main")
   - Save the settings
   - Your dashboard will be available at `https://yourusername.github.io/marketing-dashboard/`

### Option 2: Local Deployment

1. **Download the Files**
   - Download all dashboard files to your local machine
   - Maintain the directory structure as shown above

2. **Run a Local Server**
   - Due to browser security restrictions, you need to serve the files from a web server
   - You can use Python's built-in server:
     ```
     # If you have Python 3 installed
     python -m http.server
     
     # If you have Python 2 installed
     python -m SimpleHTTPServer
     ```
   - Or use a tool like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in Visual Studio Code

3. **Access the Dashboard**
   - Open your browser and navigate to `http://localhost:8000` (or the port your server is using)

## Weekly Data Updates

Follow these steps to update your dashboard data weekly:

1. **Export CSV Files**
   - Download CSV exports from your various marketing platforms:
     - Facebook analytics
     - Instagram analytics
     - Email marketing platform
     - YouTube Studio

2. **Convert CSV to JSON**
   - Open the `tools/data-converter.html` file in your browser
   - Upload or paste your CSV data for each platform
   - Process each data source
   - Generate the JSON files

3. **Update the Repository**
   - If using GitHub Pages:
     - Go to your repository on GitHub
     - Navigate to the `data` folder
     - Click "Add file" → "Upload files"
     - Drag and drop your new JSON files
     - Add a commit message (e.g., "Weekly data update - May 5, 2025")
     - Click "Commit changes"
   - If using local deployment:
     - Replace the JSON files in your local `data` folder

## Customization

### Basic Configuration

Open `js/config.js` to customize:

- Company name and dashboard title
- Default timeframe
- Chart colors and platform names
- Industry benchmarks for comparisons

### Advanced Customization

- Modify chart types and layouts by editing the respective dashboard JavaScript files
- Add new metrics by updating the CSV-to-JSON converter and dashboard renderers
- Change the visual design by modifying the CSS in `css/styles.css`

## Browser Compatibility

This dashboard works best in modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Common Issues

1. **Charts not displaying**
   - Check browser console for JavaScript errors
   - Verify JSON data files are correctly formatted
   - Ensure all required files are present in the correct folders

2. **Data not updating**
   - Verify that the JSON files were properly updated
   - Try clearing your browser cache
   - Check file permissions if using local deployment

3. **Converter tool not working**
   - Make sure your CSV files are properly formatted
   - Check for special characters or encoding issues in your CSVs
   - Look for JavaScript errors in the browser console

### Support

If you encounter issues with the dashboard, please:
1. Check the browser console for error messages
2. Verify all files are present and correctly structured
3. Ensure JSON data files are valid and complete

## License

This project is released under the MIT License.

## Credits

- Chart.js for visualization
- TailwindCSS for styling
- PapaParse for CSV parsing
