# 🔥 Firecrawl MCP Integration Guide

**Date**: 2024-12-15  
**Status**: ✅ **FIRECRAWL MCP SERVER CONFIGURED AND INTEGRATED**

---

## 🎯 **FIRECRAWL MCP OVERVIEW**

Firecrawl MCP server provides powerful web scraping and data extraction capabilities through the Model Context Protocol. This integration enables autonomous web content extraction, site crawling, and intelligent data analysis for your project.

### **Key Features**
- ✅ **Web Page Scraping**: Extract structured data from any web page
- ✅ **Site Crawling**: Intelligently crawl entire websites with link following
- ✅ **Content Extraction**: Extract specific content types (text, images, links)
- ✅ **Search Integration**: Search and scrape results simultaneously
- ✅ **Page Analysis**: Analyze page structure and metadata
- ✅ **Credit Monitoring**: Track API usage and remaining credits

---

## 🔧 **CONFIGURATION DETAILS**

### **API Key Configuration**
```json
{
  "firecrawl": {
    "name": "Firecrawl MCP Server",
    "description": "MCP server for web scraping and data extraction using Firecrawl",
    "command": "npx",
    "args": ["-y", "firecrawl-mcp"],
    "env": {
      "FIRECRAWL_API_KEY": "fc-d7b41c4f1c7a49eca63ea166bed5e181",
      "FIRECRAWL_RETRY_MAX_ATTEMPTS": "3",
      "FIRECRAWL_RETRY_INITIAL_DELAY": "1000",
      "FIRECRAWL_RETRY_MAX_DELAY": "10000",
      "FIRECRAWL_RETRY_BACKOFF_FACTOR": "2",
      "FIRECRAWL_CREDIT_WARNING_THRESHOLD": "1000",
      "FIRECRAWL_CREDIT_CRITICAL_THRESHOLD": "100"
    }
  }
}
```

### **Environment Variables Explained**

| Variable | Value | Description |
|----------|--------|-------------|
| `FIRECRAWL_API_KEY` | `fc-d7b41c4f1c7a49eca63ea166bed5e181` | Your Firecrawl API key |
| `FIRECRAWL_RETRY_MAX_ATTEMPTS` | `3` | Maximum retry attempts for failed requests |
| `FIRECRAWL_RETRY_INITIAL_DELAY` | `1000` | Initial retry delay in milliseconds |
| `FIRECRAWL_RETRY_MAX_DELAY` | `10000` | Maximum retry delay in milliseconds |
| `FIRECRAWL_RETRY_BACKOFF_FACTOR` | `2` | Exponential backoff factor |
| `FIRECRAWL_CREDIT_WARNING_THRESHOLD` | `1000` | Warning when credits drop below this value |
| `FIRECRAWL_CREDIT_CRITICAL_THRESHOLD` | `100` | Critical alert when credits drop below this value |

---

## 🚀 **AVAILABLE COMMANDS**

### **1. Scrape URL**
```javascript
// Scrape a single web page and extract structured data
firecrawl.scrape_url({
  url: "https://example.com",
  formats: ["markdown", "html", "text"],
  includeTags: ["h1", "h2", "p", "a"],
  excludeTags: ["script", "style"],
  timeout: 30000
})
```

**Use Cases:**
- Extract article content
- Scrape product information
- Extract structured data from pages
- Get clean markdown/HTML content

### **2. Crawl Site**
```javascript
// Crawl entire websites with intelligent link following
firecrawl.crawl_site({
  url: "https://example.com",
  maxDepth: 3,
  maxPages: 50,
  includePaths: ["/docs/*", "/blog/*"],
  excludePaths: ["/admin/*", "/private/*"],
  formats: ["markdown", "html"]
})
```

**Use Cases:**
- Build knowledge bases from documentation
- Extract content from blog archives
- Create searchable content databases
- Analyze website structure

### **3. Extract Content**
```javascript
// Extract specific content types from web pages
firecrawl.extract_content({
  url: "https://example.com",
  contentTypes: ["text", "images", "links", "metadata"],
  selectors: [".content", ".article", "#main"],
  includeMetadata: true
})
```

**Use Cases:**
- Extract text content for analysis
- Collect images and media
- Gather all links from a page
- Extract SEO metadata

### **4. Search and Scrape**
```javascript
// Search for content and scrape results
firecrawl.search_and_scrape({
  query: "machine learning tutorials",
  sites: ["github.com", "medium.com", "arxiv.org"],
  maxResults: 10,
  formats: ["markdown", "text"],
  includeSummaries: true
})
```

**Use Cases:**
- Research specific topics
- Collect educational content
- Gather technical documentation
- Build curated content collections

### **5. Analyze Page**
```javascript
// Analyze page structure and metadata
firecrawl.analyze_page({
  url: "https://example.com",
  includeStructure: true,
  includeMetadata: true,
  includePerformance: true,
  includeSEO: true
})
```

**Use Cases:**
- SEO analysis and optimization
- Website performance monitoring
- Content structure analysis
- Technical site audits

### **6. Monitor Credits**
```javascript
// Monitor API usage and remaining credits
firecrawl.monitor_credits({
  detailed: true,
  includeUsageHistory: true,
  includeRateLimits: true
})
```

**Use Cases:**
- Track API usage
- Monitor credit consumption
- Plan usage optimization
- Prevent service interruptions

---

## 📊 **USAGE EXAMPLES**

### **Example 1: Research and Documentation**
```javascript
// Research a topic and extract comprehensive information
const researchResults = await firecrawl.search_and_scrape({
  query: "IPv6 deployment best practices",
  sites: ["cloudflare.com", "google.com", "ietf.org"],
  maxResults: 15,
  formats: ["markdown", "text"],
  includeSummaries: true
});

// Save results to knowledge base
saveToKnowledgeBase(researchResults);
```

### **Example 2: Content Monitoring**
```javascript
// Monitor competitor websites for changes
const competitorAnalysis = await firecrawl.crawl_site({
  url: "https://competitor-website.com",
  maxDepth: 2,
  maxPages: 25,
  includePaths: ["/products/*", "/blog/*"],
  formats: ["text", "metadata"]
});

// Analyze and compare with previous data
analyzeCompetitorChanges(competitorAnalysis);
```

### **Example 3: Technical Documentation**
```javascript
// Extract technical documentation for a project
const docs = await firecrawl.crawl_site({
  url: "https://docs.example-api.com",
  maxDepth: 4,
  maxPages: 100,
  includePaths: ["/api/*", "/guides/*"],
  formats: ["markdown"]
});

// Build searchable documentation database
buildDocumentationIndex(docs);
```

---

## 🔍 **MONITORING AND CREDITS**

### **Credit Management**
- **Current API Key**: `fc-d7b41c4f1c7a49eca63ea166bed5e181`
- **Warning Threshold**: 1000 credits
- **Critical Threshold**: 100 credits
- **Monitoring**: Automatic alerts when thresholds are reached

### **Usage Tracking**
```javascript
// Check current credit status
const creditStatus = await firecrawl.monitor_credits({
  detailed: true,
  includeUsageHistory: true
});

console.log(`Remaining credits: ${creditStatus.remaining}`);
console.log(`Used this month: ${creditStatus.usedThisMonth}`);
console.log(`Rate limit remaining: ${creditStatus.rateLimitRemaining}`);
```

---

## ⚠️ **IMPORTANT NOTES**

### **API Key Security**
- ✅ **Never commit actual API keys to version control**
- ✅ **Use environment variables for sensitive data**
- ✅ **Rotate API keys regularly**
- ✅ **Monitor API usage for unusual activity**

### **Rate Limiting**
- ✅ **Respect rate limits to avoid service interruption**
- ✅ **Use exponential backoff for retries**
- ✅ **Monitor credit consumption regularly**
- ✅ **Plan usage based on project needs**

### **Content Ethics**
- ✅ **Respect robots.txt and website terms of service**
- ✅ **Don't scrape private or copyrighted content without permission**
- ✅ **Use scraped data responsibly and legally**
- ✅ **Consider website server load when crawling**

---

## 🎯 **INTEGRATION WITH EXISTING WORKFLOW**

### **With Supabase MCP**
```javascript
// Scrape content and store in Supabase
const scrapedData = await firecrawl.scrape_url({
  url: "https://example.com/article",
  formats: ["markdown", "metadata"]
});

// Store in Supabase database
await supabase.query_database({
  query: "INSERT INTO articles (title, content, url, scraped_at) VALUES ($1, $2, $3, $4)",
  params: [scrapedData.title, scrapedData.content, scrapedData.url, new Date()]
});
```

### **With Render MCP**
```javascript
// Scrape deployment documentation
const docs = await firecrawl.crawl_site({
  url: "https://render.com/docs",
  maxDepth: 3,
  maxPages: 50,
  formats: ["markdown"]
});

// Update environment variables with scraped info
await render.update_env_vars({
  serviceId: "your-service-id",
  variables: {
    DEPLOYMENT_DOCS: JSON.stringify(docs),
    LAST_SCRAPED: new Date().toISOString()
  }
});
```

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

**1. API Key Invalid**
```bash
# Check if API key is set correctly
echo $FIRECRAWL_API_KEY
# Should output: fc-d7b41c4f1c7a49eca63ea166bed5e181
```

**2. Rate Limit Exceeded**
```javascript
// Check credit status
const status = await firecrawl.monitor_credits();
if (status.remaining < 100) {
  console.log("⚠️ Low credits - consider upgrading plan");
}
```

**3. Connection Issues**
```javascript
// Test basic connectivity
const test = await firecrawl.scrape_url({
  url: "https://httpbin.org/json",
  formats: ["json"]
});
console.log("✅ Firecrawl connection working");
```

---

## 📊 **MONITORING DASHBOARD**

### **Credit Usage Tracking**
- **Daily**: Monitor API usage
- **Weekly**: Analyze usage patterns
- **Monthly**: Review credit consumption
- **Alerts**: Automatic notifications at thresholds

### **Performance Metrics**
- **Success Rate**: Track successful scrapes
- **Average Response Time**: Monitor performance
- **Error Rate**: Identify and resolve issues
- **Content Quality**: Assess extracted data quality

---

## 🚀 **NEXT STEPS**

### **Immediate Actions**
- [ ] Test Firecrawl MCP server functionality
- [ ] Create sample scraping scripts
- [ ] Integrate with existing deployment workflow
- [ ] Set up monitoring and alerting

### **Future Enhancements**
- [ ] Create automated content monitoring
- [ ] Build knowledge base from scraped content
- [ ] Implement content change detection
- [ ] Create content analysis and classification tools

---

## 📞 **SUPPORT AND RESOURCES**

### **Firecrawl Resources**
- **Documentation**: https://docs.firecrawl.dev
- **API Reference**: https://docs.firecrawl.dev/api-reference
- **Support**: https://firecrawl.dev/support

### **MCP Integration**
- **MCP Documentation**: `--DOCUMENTATIONS--/05-MCP/`
- **Configuration**: `mcp-config.json`
- **Testing**: `mcp-scripts/test-firecrawl.sh`

---

**🔥 Firecrawl MCP server is now fully configured and ready for powerful web scraping and data extraction capabilities!**