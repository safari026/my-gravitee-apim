export const enObservability = {
  overview: {
    title: 'Overview',
    subtitle: "Get a quick overview of what's happening across your platform.",
  },

  dashboards: {
    title: 'Dashboards',
    subtitle: 'Monitor and visualize your API analytics with custom dashboards.',
    create: 'Create dashboard',
    createFromTemplate: 'Create from template',
    createFromScratch: 'Create from scratch',
    empty: 'No dashboards to display',
    loading: 'Loading dashboard...',
    updated: 'Dashboard updated',
    saveFailed: 'Failed to save dashboard.',
    deleteTitle: 'Delete Dashboard',
    deleteContent: 'Are you sure you want to delete the dashboard "<strong>{name}</strong>"?',
    deleteSuccess: 'Dashboard "{name}" deleted successfully.',
    deleteError: 'An error occurred while deleting the dashboard.',
    columns: {
      name: 'Name',
      lastModified: 'Last modified',
      labels: 'Labels',
    },
  },

  templateSelector: {
    title: 'Create from template',
    info: 'Info',
    labels: 'Labels:',
    useTemplate: 'Use template',
    previewAlt: '{name} preview',
  },

  logs: {
    title: 'Logs',
    subtitle: 'Inspect and analyze API runtime logs.',
    httpProxyOnly: 'Currently, only HTTP Proxy is supported.',
    comingSoonApis: 'Message APIs, SSEs, and webhook support are coming soon.',
    tableAria: 'Environment logs table',
    warningsCount: '{count} warning(s)',
    requestFailed: 'Request failed: {status} {statusText}',
    loadError: 'An unexpected error occurred while loading logs.',
    columns: {
      timestamp: 'Timestamp',
      assetType: 'Asset Type',
      method: 'Method',
      status: 'Status',
      api: 'API',
      path: 'Path',
      application: 'Application',
      plan: 'Plan',
      gateway: 'Gateway',
      responseTime: 'Response Time',
      endpointReached: 'Endpoint reached',
      issues: 'Issues',
    },
    details: {
      loading: 'Loading log details…',
      back: 'Back to logs',
      title: 'Log',
      overview: 'Overview',
      request: 'Request',
      response: 'Response',
      date: 'Date',
      host: 'Host',
      method: 'Method',
      uri: 'URI',
      requestId: 'Request ID',
      transactionId: 'Transaction ID',
      remoteIp: 'Remote IP',
      status: 'Status',
      globalResponseTime: 'Global response time',
      apiResponseTime: 'API response time',
      latency: 'Latency',
      contentLength: 'Content-length',
      moreDetails: 'More details',
      application: 'Application',
      plan: 'Plan',
      apiProduct: 'API Product',
      endpoint: 'Endpoint',
      headers: 'Headers',
      consumer: 'Consumer',
      gateway: 'Gateway',
      body: 'Body',
      noRequestBody: 'No request body captured.',
      noResponseBody: 'No response body captured.',
      notFound: 'Log not found.',
      loadFailed: 'Failed to load log: {status} {statusText}',
      loadError: 'An unexpected error occurred while loading the log.',
    },
  },

  templates: {
    'http-proxy': {
      name: 'HTTP Proxy',
      shortDescription: 'Monitor real-time API health, traffic trends, and service reliability.',
      description:
        'This dashboard provides a centralized view of global API performance, error distribution, and latency across your infrastructure. It enables teams to quickly identify service bottlenecks and ensure consistent reliability for all API consumers.',
      info: 'For V4 proxy APIs only. V2 APIs are not supported.',
    },
    llm: {
      name: 'LLM',
      shortDescription: 'Monitor real-time LLM usage, token consumption, and associated AI costs.',
      description:
        'This dashboard provides a centralized view of your LLM usage, token consumption, and costs. Track total and average tokens, monitor cost over time, analyze usage per model, and observe response status repartition to optimize your AI integrations.',
    },
    mcp: {
      name: 'MCP',
      shortDescription: 'Monitor MCP protocol usage, method distribution, and gateway performance.',
      description:
        'This dashboard provides a centralized view of your MCP (Model Context Protocol) API usage. Track request volume and latency, analyze method, resource, tool, and prompt usage, monitor response status distribution, and observe gateway response times to optimize your MCP integrations.',
    },
  },

  widgets: {
    'proxy-requests': {
      title: 'Requests',
      description: 'Requests count',
    },
    'proxy-error-rate': {
      title: 'Error Rate',
      description: 'Percentage of responses in error',
    },
    'proxy-average-latency': {
      title: 'Average Latency',
      description: 'Average latency of the Gateway',
    },
    'proxy-average-response-time': {
      title: 'Average Response Time',
      description: 'Average response time of the Gateway',
    },
    'proxy-http-statuses': {
      title: 'HTTP Statuses',
      description: 'Number of HTTP requests per HTTP Status',
    },
    'proxy-response-time': {
      title: 'Response Time',
      description: 'Average response time of the Endpoint and Gateway in ms',
    },
    'proxy-response-statuses': {
      title: 'Response Statuses',
      description: 'Number of response statuses over time',
    },
    'proxy-top-5-applications': {
      title: 'Top 5 Applications',
      description: 'Top 5 applications by number of HTTP requests',
    },
    'llm-requests': {
      title: 'LLM requests',
      description: 'Number of requests targeting LLM providers.',
    },
    'llm-total-tokens': {
      title: 'Total tokens',
      description: 'Total number of tokens processed (prompt and completion).',
    },
    'llm-total-cost': {
      title: 'Total cost',
      description: 'Total cost incurred by LLM usage.',
    },
    'llm-average-cost-per-request': {
      title: 'Average cost per request',
      description: 'Average cost incurred per LLM request.',
    },
    'llm-average-tokens-per-request': {
      title: 'Average tokens per request',
      description: 'Average number of tokens consumed per LLM request.',
    },
    'llm-total-requests': {
      title: 'Total requests',
      description: 'Total number of HTTP requests processed by the gateway.',
    },
    'llm-token-count-over-time': {
      title: 'Token count over time',
      description: 'Evolution of token consumption (prompt, completion, and total).',
    },
    'llm-token-cost-over-time': {
      title: 'Token cost over time',
      description: 'Evolution of LLM costs over time, broken down by prompt and completion.',
    },
    'llm-total-tokens-per-model': {
      title: 'Total tokens per model',
      description: 'Distribution of total tokens consumed across different LLM models.',
    },
    'llm-response-status-repartition': {
      title: 'Response status repartition',
      description: 'Distribution of HTTP response status codes for LLM requests.',
    },
    'mcp-requests': {
      title: 'MCP requests',
      description: 'Total number of requests targeting MCP APIs.',
    },
    'mcp-average-latency': {
      title: 'Average latency',
      description: 'Average gateway latency for MCP requests.',
    },
    'mcp-max-latency': {
      title: 'Max latency',
      description: 'Maximum gateway latency observed for MCP requests.',
    },
    'mcp-p90-latency': {
      title: 'P90 latency',
      description: '90th percentile gateway latency for MCP requests.',
    },
    'mcp-p99-latency': {
      title: 'P99 latency',
      description: '99th percentile gateway latency for MCP requests.',
    },
    'mcp-method-usage': {
      title: 'Method usage',
      description: 'Distribution of MCP proxy methods by request count (top 10).',
    },
    'mcp-method-usage-over-time': {
      title: 'Method usage over time',
      description: 'Evolution of method usage over time',
    },
    'mcp-most-used-resources': {
      title: 'Most used Resources',
      description: 'Top 5 most used MCP resources by request count.',
    },
    'mcp-response-status-repartition': {
      title: 'Response status repartition',
      description: 'Distribution of HTTP response status codes for MCP requests.',
    },
    'mcp-most-used-prompts': {
      title: 'Most used Prompts',
      description: 'Top 5 most used MCP prompts by request count.',
    },
    'mcp-most-used-tools': {
      title: 'Most used Tools',
      description: 'Top 5 most used MCP tools by request count.',
    },
    'mcp-average-response-time': {
      title: 'Average response time',
      description: 'Average gateway response time for MCP requests over time.',
    },
  },
} as const;
