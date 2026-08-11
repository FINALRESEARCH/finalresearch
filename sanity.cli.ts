import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'bril4x1q',
    dataset: 'production',
  },
  studioHost: 'finalresearch-portals',
  autoUpdates: true,
})
