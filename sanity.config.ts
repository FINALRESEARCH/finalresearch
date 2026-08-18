'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { muxInput } from 'sanity-plugin-mux-input'

import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schemaTypes } from './src/sanity/schemaTypes'
import { schemaTemplates } from './src/sanity/templates'
import { presentationLocations } from './src/sanity/presentationLocations'
import { structure } from './src/sanity/structure'
import { studioTheme } from './src/sanity/studioTheme'
import './src/sanity/studioStyles.css'

export default defineConfig({
  basePath: '/studio',
  title: 'FINAL RESEARCH',
  projectId,
  dataset,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      title: 'Preview',
      previewUrl: {
        // `origin` defaults to `location.origin`, so this works in dev and
        // on Vercel previews without hardcoding a domain.
        previewMode: { enable: '/api/draft-mode/enable' },
      },
      resolve: presentationLocations,
    }),
    /*
     * Signed-only uploads. `defaultSigned` and `defaultPublic` are independent
     * flags: leaving `defaultPublic` at its `true` default would mint a public
     * playback ID alongside the signed one, and that public ID plays outside
     * the passcode gate. Both must be set for the gate to actually hold.
     */
    muxInput({
      defaultSigned: true,
      defaultPublic: false,
      video_quality: 'plus',
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  schema: { types: schemaTypes, templates: schemaTemplates },
  theme: studioTheme,
  studio: {
    components: {
      logo: () => null,
    },
  },
})
