export type InvoiceRegionCode = 'CA' | 'US' | 'UK' | 'EU'

export interface InvoiceCompany {
  legalName?: string
  entityName?: string
  email?: string
  addressLines?: string[]
}

export interface InvoiceBillTo {
  name: string
  attn?: string
  addressLines?: string[]
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  year: number
  cost: number
}

export interface InvoiceTax {
  enabled?: boolean
  label?: string
  rate?: number
  taxNumber?: string
}

export interface InvoicePaymentNote {
  heading: string
  method: string
  payTo: string
}

export interface InvoiceBankDetails {
  heading: string
  beneficiary?: string
  institutionNumber?: string
  transitNumber?: string
  accountNumber?: string
  achRoutingNumber?: string
  sortCode?: string
  iban?: string
  bic?: string
  bankName?: string
  bankAddress?: string
}

export interface InvoiceRegionProfile {
  regionCode: InvoiceRegionCode
  currency: string
  currencySymbol: string
  tax?: InvoiceTax
  payment: InvoicePaymentNote
  bank?: InvoiceBankDetails
}

export interface InvoiceSettings {
  company?: InvoiceCompany
  lastInvoiceNumber: number
  /** Shown on every invoice regardless of region, below the region-specific bank block. */
  wireTransfer?: InvoiceBankDetails
  regions: InvoiceRegionProfile[]
}

export interface Invoice {
  _id: string
  invoiceNumber: string
  number: number
  date: string
  region: InvoiceRegionCode
  currency: string
  company?: InvoiceCompany
  billedTo: InvoiceBillTo
  lineItems: InvoiceLineItem[]
  subtotal: number
  tax?: InvoiceTax
  total: number
  payment: InvoicePaymentNote
  bank?: InvoiceBankDetails
  wireTransfer?: InvoiceBankDetails
  notes?: string
  status: 'draft' | 'sent' | 'paid'
}

/** Input for creating a new invoice — everything except what's derived/snapshotted. */
export interface CreateInvoiceInput {
  region: InvoiceRegionCode
  date: string
  billedTo: InvoiceBillTo
  lineItems: Array<{ description: string; quantity?: number; year?: number; cost: number }>
  notes?: string
}
