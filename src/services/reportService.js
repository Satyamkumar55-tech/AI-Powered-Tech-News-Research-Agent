import { initialReports } from '../data/reports';

class ReportService {
  constructor() {
    this.reports = [...initialReports];
  }

  async getLatestReport() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (this.reports.length === 0) {
      throw new Error("No reports available");
    }

    const latest = this.reports[0];
    return this.formatReportAsMarkdown(latest);
  }

  async getAllReports() {
    return this.reports;
  }

  formatReportAsMarkdown(report) {
    let md = `## Executive Summary\n${report.summary}\n\n`;
    
    md += `## Key Insights\n`;
    report.insights.forEach(insight => {
      md += `* ${insight}\n`;
    });
    md += `\n`;

    md += `## Actionable Takeaways\n`;
    report.takeaways.forEach(takeaway => {
      md += `* ${takeaway}\n`;
    });
    md += `\n`;

    md += `## Why It Matters\n${report.whyItMatters}\n`;
    
    return md;
  }
}

export const reportService = new ReportService();
