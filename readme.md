# Marketing Analytics Dashboard

A comprehensive marketing analytics dashboard that integrates data from multiple sources including Google Analytics, social media platforms (Facebook, Instagram), email marketing campaigns, and YouTube.

## Features

- **Cross-Channel Overview**: Unified view of performance across all marketing channels
- **Web Analytics**: Traffic sources, audience demographics, and page performance metrics
- **Social Media Insights**: Facebook and Instagram audience data, post performance, and engagement metrics
- **Email Marketing Analysis**: Campaign performance, open rates, click rates, and subscriber growth
- **YouTube Analytics**: Video performance, audience demographics, and subscriber metrics
- **Dynamic Data Visualization**: Interactive charts and tables for all key marketing KPIs
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
marketing-dashboard/
├── data/                # JSON data files (generated from SQLite)
├── js/
│   └── dashboard.js     # Main dashboard JavaScript code
├── data_export.py       # Script to export data from SQLite to JSON
├── data_ingestor.py     # Script to ingest CSV files into SQLite
├── data_processor.py    # Script to process and normalize the data
├── index.html           # Main dashboard HTML
└── README.md            # This file
```

## Setup and Usage

### Prerequisites

- Python 3.6 or higher
- SQLite database
- Modern web browser with JavaScript enabled

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/marketing-dashboard.git
   cd marketing-dashboard
   ```

2. Install Python requirements:
   ```bash
   pip install pandas chardet sqlalchemy
   ```

3. Create the `data` directory if it doesn't exist:
   ```bash
   mkdir -p data
   ```

### Data Processing

1. First, ingest your marketing CSV files into the SQLite database:
   ```bash
   python data_ingestor.py --dir /path/to/your/csv/files
   ```

2. Export the processed data to JSON files for the dashboard:
   ```bash
   python data_export.py --db marketing_data.db --output data
   ```

### Viewing the Dashboard

Simply open `index.html` in your web browser to view the dashboard. No server is required as all data is loaded from the local JSON files.

For testing without actual data, you can generate dummy data:
```bash
python data_export.py --dummy
```

## Deployment to GitHub Pages

To deploy the dashboard to GitHub Pages:

1. Create a new GitHub repository
2. Push the entire project to your repository:
   ```bash
   git add .
   git commit -m "Initial dashboard commit"
   git remote add origin https://github.com/yourusername/marketing-dashboard.git
   git push -u origin main
   ```

3. In your GitHub repository settings, enable GitHub Pages:
   - Go to Settings > Pages
   - Select the "main" branch as the source
   - Click Save

4. Your dashboard will be available at `https://yourusername.github.io/marketing-dashboard/`

## Customization

### Adding New Data Sources

1. Modify `data_ingestor.py` to handle the new data source format
2. Update `data_export.py` to process and export the new data
3. Add new visualizations in `dashboard.js` and `index.html`

### Changing the Appearance

- Modify the CSS styles in `index.html` to change colors, fonts, and layout
- Update chart configurations in `dashboard.js` to change visualization appearance

## Troubleshooting

### Common Issues

- **No data appears in the dashboard**: Check that the JSON files exist in the `data/` directory and have valid content
- **Charts don't render**: Ensure you have an internet connection to load the Chart.js library
- **CSV processing errors**: Verify your CSV files have consistent formats and proper encoding

## Future Enhancements

- Real-time data updates via API integrations
- User authentication system
- Custom date range selection with calendar picker
- Export dashboard as PDF reports
- Advanced filtering capabilities
- Goal tracking and benchmarking

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Chart.js for visualization
- Bootstrap for responsive layout
- All the marketing platforms whose data makes this dashboard possible
