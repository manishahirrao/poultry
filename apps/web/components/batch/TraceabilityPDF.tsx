import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  Image, 
  StyleSheet, 
  Font,
  PDFDownloadLink,
  PDFViewer
} from '@react-pdf/renderer';
import { TraceabilityReportData } from '@/lib/traceabilityReportGenerator';

// Register fonts (using system fonts for now, can be replaced with custom fonts)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font@2.0.0/fonts/Roboto-Regular.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font@2.0.0/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#16A34A',
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 140,
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    flex: 1,
    color: '#111827',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 20,
  },
  bullet: {
    marginRight: 8,
    color: '#16A34A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeGreen: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  badgeRed: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    textAlign: 'center',
    fontSize: 9,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
});

interface TraceabilityPDFProps {
  data: TraceabilityReportData;
}

export function TraceabilityPDF({ data }: TraceabilityPDFProps) {
  const abFreeBadge = data.hasAntibiotics ? (
    <View style={[styles.badge, styles.badgeRed]}>
      <Text>🚫 AB Used</Text>
    </View>
  ) : (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text>✅ AB-Free Eligible</Text>
    </View>
  );

  const fssaiBadge = data.hasAntibiotics ? (
    <View style={[styles.badge, styles.badgeRed]}>
      <Text>Non-Compliant</Text>
    </View>
  ) : (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text>Compliant ✅</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>🐔 FlockIQ</Text>
              <Text style={styles.subtitle}>FSSAI Batch Traceability Report</Text>
            </View>
            <Image src={data.qrCodeUrl} style={styles.qrCode} />
          </View>
        </View>

        {/* Batch Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Batch ID:</Text>
            <Text style={styles.value}>{data.batchIdDisplay}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Farm District:</Text>
            <Text style={styles.value}>{data.farmDistrict}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Breed:</Text>
            <Text style={styles.value}>{data.breed}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Harvest Date:</Text>
            <Text style={styles.value}>{data.harvestDate}</Text>
          </View>
        </View>

        {/* Bird Origin */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bird Origin</Text>
          <View style={styles.row}>
            <Text style={styles.label}>DOC Supplier:</Text>
            <Text style={styles.value}>{data.docSupplier}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Placement:</Text>
            <Text style={styles.value}>
              {data.docCount.toLocaleString()} birds · {data.docPlacementDate}
            </Text>
          </View>
        </View>

        {/* Nutrition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Feed Consumed:</Text>
            <Text style={styles.value}>{data.totalFeedConsumed.toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Feed Brand(s):</Text>
            <Text style={styles.value}>
              {data.feedBrands.length > 0 ? data.feedBrands.join(', ') : 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>FCR Achieved:</Text>
            <Text style={styles.value}>{data.fcrAchieved.toFixed(3)}</Text>
          </View>
        </View>

        {/* Health & Vaccination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Vaccination</Text>
          {data.vaccinations.length > 0 ? (
            data.vaccinations.map((vaccination, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>✓</Text>
                <Text style={styles.value}>
                  {vaccination.vaccineName} ({vaccination.administeredDate})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.value}>No vaccinations recorded</Text>
          )}
          
          <View style={styles.divider} />
          
          {data.medications.length > 0 ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Medications:</Text>
                <Text style={styles.value}>
                  {data.medications.map(med => med.drugName).join(', ')}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Antibiotic Use:</Text>
                <Text style={styles.value}>{abFreeBadge}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Medication:</Text>
                <Text style={styles.value}>Nil</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Antibiotic Use:</Text>
                <Text style={styles.value}>{abFreeBadge}</Text>
              </View>
            </>
          )}
        </View>

        {/* Mortality Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mortality Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Deaths:</Text>
            <Text style={styles.value}>{data.mortalitySummary.totalDeaths.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cumulative Rate:</Text>
            <Text style={styles.value}>{data.mortalitySummary.cumulativeRate.toFixed(2)}%</Text>
          </View>
        </View>

        {/* Harvest */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Harvest Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Live Birds Sold:</Text>
            <Text style={styles.value}>{data.harvest.birdsSold.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Average Weight:</Text>
            <Text style={styles.value}>{data.harvest.averageWeight.toFixed(2)} kg/bird</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Weight:</Text>
            <Text style={styles.value}>{data.harvest.totalWeight.toLocaleString()} kg</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Buyer:</Text>
            <Text style={styles.value}>{data.harvest.buyerName}</Text>
          </View>
        </View>

        {/* Certification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certification</Text>
          <View style={styles.row}>
            <Text style={styles.label}>FSSAI Status:</Text>
            <Text style={styles.value}>{fssaiBadge}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Generated:</Text>
            <Text style={styles.value}>
              {data.generatedDate} · FlockIQ v2.0
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Verify at: poulse.ai/trace/{data.batchIdDisplay}</Text>
          <Text style={{ marginTop: 5 }}>
            This document is valid for 5 years from harvest date
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface TraceabilityPDFDownloadProps {
  data: TraceabilityReportData;
  fileName?: string;
}

export function TraceabilityPDFDownload({ 
  data, 
  fileName = `traceability-${data.batchIdDisplay}.pdf` 
}: TraceabilityPDFDownloadProps) {
  return (
    <PDFDownloadLink document={<TraceabilityPDF data={data} />} fileName={fileName}>
      {({ loading }) => (
        <button
          disabled={loading}
          className="px-4 py-2 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? 'Generating PDF...' : 'Download Traceability Report'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
