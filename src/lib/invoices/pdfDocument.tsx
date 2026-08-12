import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { Invoice } from './types'

/**
 * Recreates FR_INVOICE_000_YY.numbers 1:1 (structure, spacing, alignment),
 * measured directly off a real exported invoice (FR_INVOICE_116_26.pdf) via
 * its PDF text/vector layer — every position below is a real coordinate,
 * not eyeballed off a raster. Only the color was changed on request (this
 * invoice's own #2D303E swapped for #464861, still on black).
 *
 * Two things worth knowing before touching this file:
 *
 * 1. Multi-line text is always rendered as sibling <Text> elements, never as
 *    a single <Text> with embedded "\n" — react-pdf ignores custom
 *    lineHeight on hard line breaks and falls back to a much taller
 *    default, which is why every "\n"-joined block used to render with
 *    doubled vertical spacing.
 *
 * 2. The item table and the totals rows are ONE bordered box, not two. The
 *    source PDF's item box is a fixed ~210pt-tall shell (sized for a full
 *    page of rows) that closes directly into the totals rows — same left/
 *    right border running top to bottom, one shared rule at the boundary.
 *    Totals rows reuse the exact same column widths as the item row so
 *    TOTAL/SUBTOTAL/TAX land under YEAR and their amounts under COST,
 *    pixel-identical to the item columns above them.
 */

const INK = '#464861'
const BG = '#000000'
const RULE = '#464861'

const COL_QTY_WIDTH = 58
const COL_YEAR_WIDTH = 78
const COL_COST_WIDTH = 76
// Fixed (not flex) so the note rows below the box — which have a trailing
// auto-width cell instead of a fixed-width COST cell — still line up: a
// flex:1 item column would otherwise resize itself per-row based on what
// its row's other siblings need, breaking column alignment across rows.
// 540 (page content width) - 8 (row's own horizontal padding) - 2 (box
// border) - the three fixed column widths above.
const COL_ITEM_WIDTH = 540 - 8 - 2 - COL_QTY_WIDTH - COL_YEAR_WIDTH - COL_COST_WIDTH
// Matches the source's fixed item-box height (item rows + blank filler),
// measured from just under the header row to just above the totals rows.
const ITEMS_BOX_MIN_HEIGHT = 195

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: INK,
    backgroundColor: BG,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 37,
  },
  headerLeft: { flexDirection: 'column', width: 275, flexShrink: 0 },
  title: {
    fontSize: 8.8,
    marginBottom: 7,
  },
  lineGap: { marginBottom: 2 },
  metaRow: { flexDirection: 'row', marginBottom: 7 },
  metaLabel: { width: 45, flexShrink: 0 },
  metaValue: { flex: 1, textAlign: 'right' },
  // A fixed width, not alignItems:'flex-end' on an auto-sized column, is
  // what actually makes textAlign:'right' line up sibling lines of
  // different lengths — with an auto width, Yoga sizes each Text to its
  // own content and textAlign has nothing to align within.
  headerRight: { width: 160, flexShrink: 0, flexDirection: 'column', gap: 10 },
  rightLine: { fontSize: 7.2, textAlign: 'right' },
  box: {
    borderWidth: 1,
    borderColor: RULE,
  },
  headerRowTable: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: RULE,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  itemsBox: {
    minHeight: ITEMS_BOX_MIN_HEIGHT,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  colItem: { width: COL_ITEM_WIDTH, flexShrink: 0 },
  colQty: { width: COL_QTY_WIDTH },
  colYear: { width: COL_YEAR_WIDTH },
  colCost: { width: COL_COST_WIDTH },
  totalsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderColor: RULE,
  },
  bold: { fontFamily: 'Helvetica-Bold' },
  noteRow: { flexDirection: 'row', marginTop: 2, paddingHorizontal: 4 },
  noteLabel: { flexShrink: 0 },
  taxNumberLine: { fontSize: 7, flexShrink: 0 },
  currencyNote: { fontSize: 8, fontFamily: 'Helvetica-Bold', flexShrink: 0 },
  footer: { marginTop: 14, maxWidth: 300 },
  footerHeading: { marginBottom: 8 },
  footerSection: { marginBottom: 11 },
  footerSectionHeading: { marginBottom: 3 },
  footerLine: { fontSize: 7.2 },
  notes: { marginTop: 16, maxWidth: 320, fontSize: 7.2 },
})

function money(amount: number, symbol: string) {
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Renders each string as its own <Text> sibling — see file-level note #1.
 * A small marginBottom between lines (not after the last) is the "line
 * break spacing" within a wrapped block — BILLED TO, the company address,
 * and both footer sections all go through here.
 */
function Lines({ lines, style }: { lines: Array<string | undefined | null>; style?: Style }) {
  const filtered = lines.filter((line): line is string => Boolean(line))
  return (
    <>
      {filtered.map((line, i) => (
        <Text key={i} style={i < filtered.length - 1 ? [style, styles.lineGap] : style}>
          {line}
        </Text>
      ))}
    </>
  )
}

export function InvoicePdfDocument({ invoice }: { invoice: Invoice }) {
  const symbol = currencySymbol(invoice.currency)
  const taxEnabled = Boolean(invoice.tax?.enabled)

  return (
    <Document title={invoice.invoiceNumber}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>
              {(invoice.company?.legalName || 'FINAL RESEARCH').toUpperCase()} INVOICE
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>DATE</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.date)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>INVOICE #</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>BILLED TO</Text>
              <View style={styles.metaValue}>
                <Lines
                  lines={[invoice.billedTo.name, invoice.billedTo.attn, ...(invoice.billedTo.addressLines || [])]}
                  style={{ textAlign: 'right' }}
                />
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View>
              <Lines
                lines={[invoice.company?.legalName, invoice.company?.entityName]}
                style={styles.rightLine}
              />
            </View>
            <Text style={styles.rightLine}>{invoice.company?.email}</Text>
            <View>
              <Lines lines={invoice.company?.addressLines || []} style={styles.rightLine} />
            </View>
          </View>
        </View>

        <View style={styles.box}>
          <View style={styles.headerRowTable}>
            <Text style={styles.colItem}>ITEM</Text>
            <Text style={styles.colQty}>QUANTITY</Text>
            <Text style={styles.colYear}>YEAR</Text>
            <Text style={styles.colCost}>COST</Text>
          </View>
          <View style={styles.itemsBox}>
            {invoice.lineItems.map((item, i) => (
              <View style={styles.itemRow} key={i}>
                <Text style={styles.colItem}>{item.description.toUpperCase()}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colYear}>{item.year}</Text>
                <Text style={styles.colCost}>{money(item.cost, symbol)}</Text>
              </View>
            ))}
          </View>
          {taxEnabled ? (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.colItem} />
                <Text style={styles.colQty} />
                <Text style={styles.colYear}>SUBTOTAL</Text>
                <Text style={styles.colCost}>{money(invoice.subtotal, symbol)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.colItem} />
                <Text style={styles.colQty} />
                <Text style={styles.colYear}>
                  TAX / {invoice.tax?.label} ({Math.round((invoice.tax?.rate || 0) * 100)}%)
                </Text>
                <Text style={styles.colCost}>{money(invoice.total - invoice.subtotal, symbol)}</Text>
              </View>
            </>
          ) : null}
          <View style={styles.totalsRow}>
            <Text style={styles.colItem} />
            <Text style={styles.colQty} />
            <Text style={[styles.colYear, styles.bold]}>TOTAL</Text>
            <Text style={[styles.colCost, styles.bold]}>{money(invoice.total, symbol)}</Text>
          </View>
        </View>

        {taxEnabled && invoice.tax?.taxNumber ? (
          <View style={styles.noteRow}>
            <Text style={styles.colItem} />
            <Text style={styles.colQty} />
            <Text style={styles.colYear} />
            <Text style={styles.taxNumberLine}>TAX # {invoice.tax.taxNumber}</Text>
          </View>
        ) : null}
        {invoice.currency === 'USD' ? (
          <View style={styles.noteRow}>
            <Text style={styles.colItem} />
            <Text style={styles.colQty} />
            <Text style={styles.colYear} />
            <Text style={styles.currencyNote}>({invoice.currency})</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerHeading}>PAYMENT</Text>
          <View style={styles.footerSection}>
            <Text style={styles.footerSectionHeading}>{invoice.payment.heading}</Text>
            <Lines lines={[invoice.payment.method, invoice.payment.payTo]} style={styles.footerLine} />
          </View>
          {invoice.bank ? (
            <View style={styles.footerSection}>
              <Text style={styles.footerSectionHeading}>{invoice.bank.heading}</Text>
              <Lines lines={bankLines(invoice.bank)} style={styles.footerLine} />
            </View>
          ) : null}
          {invoice.wireTransfer ? (
            <View style={styles.footerSection}>
              <Text style={styles.footerSectionHeading}>{invoice.wireTransfer.heading}</Text>
              <Lines lines={bankLines(invoice.wireTransfer)} style={styles.footerLine} />
            </View>
          ) : null}
        </View>

        {invoice.notes ? <Text style={styles.notes}>{invoice.notes}</Text> : null}
      </Page>
    </Document>
  )
}

function bankLines(bank: NonNullable<Invoice['bank']>): string[] {
  return [
    bank.beneficiary ? `Beneficiary: ${bank.beneficiary}` : null,
    bank.institutionNumber ? `Institution #: ${bank.institutionNumber}` : null,
    bank.transitNumber ? `Transit #: ${bank.transitNumber}` : null,
    bank.accountNumber ? `Account Number: ${bank.accountNumber}` : null,
    bank.achRoutingNumber ? `ACH Routing Number: ${bank.achRoutingNumber}` : null,
    bank.sortCode ? `Sort Code: ${bank.sortCode}` : null,
    bank.iban ? `IBAN: ${bank.iban}` : null,
    bank.bic ? `BIC: ${bank.bic}` : null,
    bank.bankName ? `Bank Name: ${bank.bankName}` : null,
    bank.bankAddress ? `Bank Address: ${bank.bankAddress}` : null,
  ].filter((line): line is string => Boolean(line))
}

function currencySymbol(currency: string): string {
  switch (currency) {
    case 'GBP':
      return '£'
    case 'EUR':
      return '€'
    default:
      return '$'
  }
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${m}/${d}/${y}`
}
