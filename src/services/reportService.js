import apiClient from './apiClient';

// reportService now fetches real persisted reports from the backend API.

class ReportService {
  async getLatestReport() {
    return apiClient.getLatestReport();
  }

  async getAllReports() {
    return apiClient.getReports();
  }

  async getReportById(id) {
    return apiClient.getReportById(id);
  }

  // Format a report object as readable markdown (used for download/print)
  formatReportAsMarkdown(report) {
    if (!report) return '';

    let md = `# ${report.title}\n`;
    md += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n\n`;
    md += `---\n\n`;

    md += `## Executive Summary\n${report.summary}\n\n`;

    if (report.insights && report.insights.length > 0) {
      md += `## Key Insights\n`;
      report.insights.forEach((insight) => {
        md += `* ${insight}\n`;
      });
      md += '\n';
    }

    if (report.takeaways && report.takeaways.length > 0) {
      md += `## Actionable Takeaways\n`;
      report.takeaways.forEach((takeaway) => {
        md += `* ${takeaway}\n`;
      });
      md += '\n';
    }

    if (report.whyItMatters) {
      md += `## Why It Matters\n${report.whyItMatters}\n\n`;
    }

    if (report.articles && report.articles.length > 0) {
      md += `## Top Source Articles\n`;
      report.articles.forEach((art, i) => {
        md += `${i + 1}. **${art.title}** — *${art.source}* (Score: ${art.importanceScore}/10)\n`;
        md += `   ${art.url}\n\n`;
      });
    }

    md += `---\n*Generated automatically by TechPulse AI Research Platform.*\n`;
    return md;
  }
}

export const reportService = new ReportService();
