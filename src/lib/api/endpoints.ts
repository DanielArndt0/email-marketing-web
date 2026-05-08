export const endpoints = {
  health: "/health",

  templates: {
    list: "/templates",
    create: "/templates",
    byId: (id: string) => `/templates/${id}`,

    inlineAssets: {
      list: (templateId: string) => `/templates/${templateId}/inline-assets`,
      create: (templateId: string) => `/templates/${templateId}/inline-assets`,
      byId: (templateId: string, fileId: string) =>
        `/templates/${templateId}/inline-assets/${fileId}`,
    },

    attachments: {
      list: (templateId: string) => `/templates/${templateId}/attachments`,
      create: (templateId: string) => `/templates/${templateId}/attachments`,
      byId: (templateId: string, fileId: string) =>
        `/templates/${templateId}/attachments/${fileId}`,
    },
  },

  audiences: {
    list: "/audiences",
    create: "/audiences",
    byId: (id: string) => `/audiences/${id}`,
    preview: (id: string) => `/audiences/${id}/preview`,
    resolve: "/audiences/resolve",
  },

  smtpSenders: {
    list: "/smtp-senders",
    create: "/smtp-senders",
    byId: (id: string) => `/smtp-senders/${id}`,
    test: (id: string) => `/smtp-senders/${id}/test`,
  },

  domains: {
    cnpjApi: {
      cities: "/domain/cnpj-api/cities",
      cnaes: "/domain/cnpj-api/cnaes",
    },
  },

  campaigns: {
    list: "/campaigns",
    create: "/campaigns",
    byId: (id: string) => `/campaigns/${id}`,
    audiencePreview: (id: string) => `/campaigns/${id}/audience-preview`,
    dispatch: (id: string) => `/campaigns/${id}/dispatch`,
    dispatchBatch: "/campaigns/dispatch/batch",
  },

  dispatches: {
    list: "/dispatches",
    byId: (id: string) => `/dispatches/${id}`,
    retry: (id: string) => `/dispatches/${id}/retry`,
  },
} as const;
