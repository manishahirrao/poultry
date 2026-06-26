/**
 * Tally XML Exporter
 * 
 * Generates TallyPrime-compatible XML from batch P&L data
 * Field mapping: FlockIQ batch_cost → Tally stock_item + purchase_voucher
 *              FlockIQ batch_revenue → Tally sales_voucher
 * 
 * Requirements: REQ-019 §19.1, TASK-053
 */

export interface TallyCostCategory {
  name: string;
  amount: number;
  category: 'doc' | 'feed' | 'medicine' | 'vaccine' | 'labor' | 'electricity' | 'overhead';
  tallyLedger?: string; // Tally ledger name for this cost category
}

export interface TallyPnLData {
  batchId: string;
  batchName: string;
  docCount: number;
  docPlacementDate: string;
  currentBirdCount: number;
  avgWeightKg?: number | null;
  breed: string;
  ageDays: number;
  status: string;
  actualHarvestWeightKg?: number | null;
  birdsSold?: number | null;
  salePricePerKg?: number | null;
  revenue: number;
  costs: TallyCostCategory[];
  totalCost: number;
  netProfit: number;
  isProjected: boolean;
  companyName?: string; // Optional company name for Tally
}

export interface TallyExportOptions {
  companyName?: string;
  exportDate?: Date;
  voucherNumber?: string;
  includeProjected?: boolean;
}

/**
 * Default Tally ledger mappings for FlockIQ cost categories
 * These can be customized by the user in the integration settings
 */
const DEFAULT_TALLY_LEDGERS: Record<string, string> = {
  doc: 'Day Old Chicks',
  feed: 'Feed Cost',
  medicine: 'Medicine & Veterinary',
  vaccine: 'Vaccination',
  labor: 'Labor Charges',
  electricity: 'Electricity',
  overhead: 'Farm Overheads'
};

/**
 * Generate Tally XML for a batch P&L
 * Creates both purchase vouchers (for costs) and sales voucher (for revenue)
 */
export function generateTallyXML(pnlData: TallyPnLData, options: TallyExportOptions = {}): string {
  const {
    companyName = 'FlockIQ Farm',
    exportDate = new Date(),
    voucherNumber = generateVoucherNumber(),
    includeProjected = false
  } = options;

  // Don't export projected revenue (only actual harvest data)
  if (pnlData.isProjected && !includeProjected) {
    throw new Error('Cannot export projected P&L data. Only actual harvest data can be exported to Tally.');
  }

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ENVELOPE SYSTEM "Tally.dtd">
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName.XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>`;

  const xmlFooter = `
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  let vouchersXML = '';

  // Generate Purchase Vouchers for each cost category
  for (const cost of pnlData.costs) {
    if (cost.amount > 0) {
      vouchersXML += generatePurchaseVoucher(cost, pnlData, companyName, voucherNumber, exportDate);
    }
  }

  // Generate Sales Voucher for revenue (only if harvested)
  if (pnlData.status === 'harvested' && pnlData.revenue > 0) {
    vouchersXML += generateSalesVoucher(pnlData, companyName, voucherNumber, exportDate);
  }

  return xmlHeader + vouchersXML + xmlFooter;
}

/**
 * Generate a Tally Purchase Voucher for a cost category
 */
function generatePurchaseVoucher(
  cost: TallyCostCategory,
  pnlData: TallyPnLData,
  companyName: string,
  voucherNumber: string,
  exportDate: Date
): string {
  const ledgerName = cost.tallyLedger || DEFAULT_TALLY_LEDGERS[cost.category] || cost.name;
  const formattedDate = formatDateForTally(exportDate);
  const formattedAmount = formatTallyAmount(cost.amount);

  return `
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER>
            <VOUCHERTYPE>Purchase</VOUCHERTYPE>
            <DATE>${formattedDate}</DATE>
            <VOUCHERNUMBER>${voucherNumber}-${cost.category.toUpperCase()}</VOUCHERNUMBER>
            <NARRATION>Batch: ${pnlData.batchName} | ${cost.name}</NARRATION>
            <LEDGERENTRIES.LIST>
              <LEDGERNAME>${ledgerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${formattedAmount}</AMOUNT>
              <BILLALLOCATIONS.LIST>
                <BILLTYPE>New Ref</BILLTYPE>
                <BILLNAME>${pnlData.batchId}-${cost.category}</BILLNAME>
                <AMOUNT>${formattedAmount}</AMOUNT>
              </BILLALLOCATIONS.LIST>
            </LEDGERENTRIES.LIST>
            <LEDGERENTRIES.LIST>
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>${formattedAmount}</AMOUNT>
            </LEDGERENTRIES.LIST>
            <BATCHALLOCATIONS.LIST>
              <BATCHNAME>${pnlData.batchName}</BATCHNAME>
              <ITEMNAME>${cost.category === 'doc' ? 'Day Old Chicks' : 'Stock Item'}</ITEMNAME>
              <QUANTITY>${cost.category === 'doc' ? pnlData.docCount : 1}</QUANTITY>
              <RATE>${cost.category === 'doc' ? (cost.amount / pnlData.docCount).toFixed(2) : cost.amount.toFixed(2)}</RATE>
              <AMOUNT>${formattedAmount}</AMOUNT>
            </BATCHALLOCATIONS.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>`;
}

/**
 * Generate a Tally Sales Voucher for batch revenue
 */
function generateSalesVoucher(
  pnlData: TallyPnLData,
  companyName: string,
  voucherNumber: string,
  exportDate: Date
): string {
  const formattedDate = formatDateForTally(exportDate);
  const formattedAmount = formatTallyAmount(pnlData.revenue);
  const buyerName = 'Poultry Buyer'; // This should come from batch harvest data

  return `
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER>
            <VOUCHERTYPE>Sales</VOUCHERTYPE>
            <DATE>${formattedDate}</DATE>
            <VOUCHERNUMBER>${voucherNumber}-SALE</VOUCHERNUMBER>
            <NARRATION>Batch: ${pnlData.batchName} | ${pnlData.birdsSold?.toLocaleString()} birds @ ${pnlData.actualHarvestWeightKg?.toFixed(2)} kg/bird</NARRATION>
            <LEDGERENTRIES.LIST>
              <LEDGERNAME>${buyerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${formattedAmount}</AMOUNT>
            </LEDGERENTRIES.LIST>
            <LEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>${formattedAmount}</AMOUNT>
            </LEDGERENTRIES.LIST>
            <INVENTORYENTRIES.LIST>
              <ITEMNAME>Broiler Chicken</ITEMNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <QUANTITY>${pnlData.birdsSold || 0}</QUANTITY>
              <RATE>${pnlData.salePricePerKg?.toFixed(2) || '0.00'}</RATE>
              <AMOUNT>${formattedAmount}</AMOUNT>
            </INVENTORYENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>`;
}

/**
 * Generate a unique voucher number
 */
function generateVoucherNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PP${year}${month}${day}${random}`;
}

/**
 * Format date for Tally (DD-MM-YYYY)
 */
function formatDateForTally(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format amount for Tally (negative for debits, positive for credits)
 * Tally uses negative amounts for debits in ledger entries
 */
function formatTallyAmount(amount: number): string {
  return `-${Math.abs(amount).toFixed(2)}`;
}

/**
 * Generate Tally XML for multiple batches (batch export)
 */
export function generateBatchTallyXML(
  batchesData: TallyPnLData[],
  options: TallyExportOptions = {}
): string {
  const {
    companyName = 'FlockIQ Farm',
    exportDate = new Date()
  } = options;

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ENVELOPE SYSTEM "Tally.dtd">
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVEXPORTFORMAT>$$SysName.XML</SVEXPORTFORMAT>
        </STATICVARIABLES>
      </REQUESTDESC>`;

  const xmlFooter = `
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  let vouchersXML = '';
  let voucherIndex = 1;

  for (const pnlData of batchesData) {
    // Skip projected data
    if (pnlData.isProjected) {
      continue;
    }

    const voucherNumber = generateVoucherNumber() + String(voucherIndex).padStart(2, '0');

    // Generate Purchase Vouchers for each cost category
    for (const cost of pnlData.costs) {
      if (cost.amount > 0) {
        vouchersXML += generatePurchaseVoucher(cost, pnlData, companyName, voucherNumber, exportDate);
      }
    }

    // Generate Sales Voucher for revenue (only if harvested)
    if (pnlData.status === 'harvested' && pnlData.revenue > 0) {
      vouchersXML += generateSalesVoucher(pnlData, companyName, voucherNumber, exportDate);
    }

    voucherIndex++;
  }

  return xmlHeader + vouchersXML + xmlFooter;
}

/**
 * Validate Tally XML structure
 */
export function validateTallyXML(xml: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required Tally XML elements
  if (!xml.includes('<ENVELOPE>')) {
    errors.push('Missing <ENVELOPE> element');
  }
  if (!xml.includes('<VOUCHER>')) {
    errors.push('Missing <VOUCHER> element');
  }
  if (!xml.includes('<VOUCHERTYPE>')) {
    errors.push('Missing <VOUCHERTYPE> element');
  }
  if (!xml.includes('<DATE>')) {
    errors.push('Missing <DATE> element');
  }
  if (!xml.includes('<LEDGERENTRIES.LIST>')) {
    errors.push('Missing <LEDGERENTRIES.LIST> element');
  }

  // Check for balanced vouchers (debits = credits)
  const voucherMatches = xml.match(/<VOUCHER>[\s\S]*?<\/VOUCHER>/g) || [];
  for (const voucher of voucherMatches) {
    const amountMatches = voucher.match(/<AMOUNT>(-?\d+\.\d+)<\/AMOUNT>/g) || [];
    if (amountMatches.length < 2) {
      errors.push('Voucher must have at least 2 ledger entries (debit and credit)');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Download Tally XML file
 */
export function downloadTallyXML(xml: string, filename: string = 'tally_export.xml'): void {
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate reconciliation report (exported entries vs expected)
 */
export function generateReconciliationReport(
  pnlData: TallyPnLData,
  tallyImportData?: any // Data returned from Tally after import
): {
  batchId: string;
  batchName: string;
  expectedRevenue: number;
  expectedCosts: number;
  expectedNetProfit: number;
  importedRevenue?: number;
  importedCosts?: number;
  importedNetProfit?: number;
  revenueMatch: boolean;
  costsMatch: boolean;
  discrepancies: string[];
} {
  const discrepancies: string[] = [];

  const expectedRevenue = pnlData.revenue;
  const expectedCosts = pnlData.totalCost;
  const expectedNetProfit = pnlData.netProfit;

  let importedRevenue = tallyImportData?.revenue;
  let importedCosts = tallyImportData?.costs;
  let importedNetProfit = tallyImportData?.netProfit;

  const revenueMatch = !importedRevenue || Math.abs(expectedRevenue - importedRevenue) < 0.01;
  const costsMatch = !importedCosts || Math.abs(expectedCosts - importedCosts) < 0.01;

  if (!revenueMatch) {
    discrepancies.push(`Revenue mismatch: Expected ₹${expectedRevenue.toFixed(2)}, Imported ₹${importedRevenue?.toFixed(2)}`);
  }

  if (!costsMatch) {
    discrepancies.push(`Costs mismatch: Expected ₹${expectedCosts.toFixed(2)}, Imported ₹${importedCosts?.toFixed(2)}`);
  }

  return {
    batchId: pnlData.batchId,
    batchName: pnlData.batchName,
    expectedRevenue,
    expectedCosts,
    expectedNetProfit,
    importedRevenue,
    importedCosts,
    importedNetProfit,
    revenueMatch,
    costsMatch,
    discrepancies
  };
}
