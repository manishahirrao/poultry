import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  PDFDownloadLink,
  PDFViewer
} from '@react-pdf/renderer';
import { HACCPAuditReport, getAllCCPs } from '@/lib/haccpTypes';

// Register fonts
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
    borderBottomColor: '#DC2626',
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
    color: '#DC2626',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
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
    color: '#DC2626',
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
    color: '#DC2626',
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
  badgeYellow: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 8,
    flex: 1,
  },
  tableCellSmall: {
    padding: 8,
    width: 80,
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
  deviationBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
    padding: 10,
    marginBottom: 8,
  },
});

interface HACCPAuditPDFProps {
  data: HACCPAuditReport;
}

export function HACCPAuditPDF({ data }: HACCPAuditPDFProps) {
  const ccps = getAllCCPs();
  
  const overallStatusBadge = data.overallStatus === 'compliant' ? (
    <View style={[styles.badge, styles.badgeGreen]}>
      <Text>✓ COMPLIANT</Text>
    </View>
  ) : data.overallStatus === 'non_compliant' ? (
    <View style={[styles.badge, styles.badgeRed]}>
      <Text>⚠ NON-COMPLIANT</Text>
    </View>
  ) : (
    <View style={[styles.badge, styles.badgeYellow]}>
      <Text>⚠ PARTIAL COMPLIANCE</Text>
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
              <Text style={styles.subtitle}>HACCP Audit Report</Text>
            </View>
            <View>{overallStatusBadge}</View>
          </View>
        </View>

        {/* Processing Run Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processing Run Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Processing Run ID:</Text>
            <Text style={styles.value}>{data.processingRunId}</Text>
          </View>
          {data.batchId && (
            <View style={styles.row}>
              <Text style={styles.label}>Batch ID:</Text>
              <Text style={styles.value}>{data.batchId}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Processing Date:</Text>
            <Text style={styles.value}>
              {new Date(data.processingDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Facility Name:</Text>
            <Text style={styles.value}>{data.facilityName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Facility Address:</Text>
            <Text style={styles.value}>{data.facilityAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>FSSAI License:</Text>
            <Text style={styles.value}>{data.fssaiLicenseNumber}</Text>
          </View>
        </View>

        {/* Audit Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audit Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Auditor Name:</Text>
            <Text style={styles.value}>{data.auditorName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Audit Date:</Text>
            <Text style={styles.value}>
              {new Date(data.auditDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Overall Status:</Text>
            <Text style={styles.value}>{overallStatusBadge}</Text>
          </View>
        </View>

        {/* Critical Control Points Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Critical Control Points Checklist</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCellSmall}>CCP</Text>
              <Text style={styles.tableCell}>Name</Text>
              <Text style={styles.tableCellSmall}>Status</Text>
              <Text style={styles.tableCell}>Supervisor</Text>
            </View>
            
            {ccps.map((ccp, index) => {
              const checklistItem = data.checklistItems.find(item => item.ccpId === ccp.id);
              const status = checklistItem?.status || 'not_monitored';
              
              return (
                <View key={ccp.id} style={styles.tableRow}>
                  <Text style={styles.tableCellSmall}>{index + 1}</Text>
                  <Text style={styles.tableCell}>
                    {ccp.name}
                    {'\n'}
                    <Text style={{ fontSize: 8, color: '#666666' }}>{ccp.nameHindi}</Text>
                  </Text>
                  <Text style={styles.tableCellSmall}>
                    {status === 'compliant' ? (
                      <Text style={{ color: '#16A34A' }}>✓</Text>
                    ) : status === 'deviation' ? (
                      <Text style={{ color: '#DC2626' }}>⚠</Text>
                    ) : (
                      <Text style={{ color: '#6B7280' }}>○</Text>
                    )}
                  </Text>
                  <Text style={styles.tableCell}>{checklistItem?.supervisorName || '-'}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Deviations */}
        {data.deviations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deviations Recorded ({data.deviations.length})</Text>
            
            {data.deviations.map((deviation) => (
              <View key={deviation.id} style={styles.deviationBox}>
                <View style={styles.row}>
                  <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>
                    {deviation.ccpName} - {deviation.parameter}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Actual Value:</Text>
                  <Text style={styles.value}>{deviation.actualValue}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Limit Value:</Text>
                  <Text style={styles.value}>{deviation.limitValue}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Severity:</Text>
                  <Text style={styles.value}>{deviation.deviationType.toUpperCase()}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Timestamp:</Text>
                  <Text style={styles.value}>
                    {new Date(deviation.timestamp).toLocaleString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Supervisor:</Text>
                  <Text style={styles.value}>{deviation.supervisorName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Corrective Action:</Text>
                  <Text style={styles.value}>{deviation.correctiveAction}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>
                    {deviation.resolved ? (
                      <Text style={{ color: '#16A34A' }}>✓ Resolved</Text>
                    ) : (
                      <Text style={{ color: '#DC2626' }}>⚠ Pending</Text>
                    )}
                  </Text>
                </View>
                {deviation.resolvedAt && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Resolved At:</Text>
                    <Text style={styles.value}>
                      {new Date(deviation.resolvedAt).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Detailed CCP Readings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed CCP Readings</Text>
          
          {ccps.map((ccp, index) => {
            const checklistItem = data.checklistItems.find(item => item.ccpId === ccp.id);
            if (!checklistItem) return null;
            
            return (
              <View key={ccp.id} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {index + 1}. {ccp.name} ({ccp.nameHindi})
                </Text>
                
                {ccp.measurableLimits.map((limit) => {
                  const reading = checklistItem.readings[limit.id];
                  return (
                    <View key={limit.id} style={styles.row}>
                      <Text style={styles.label}>{limit.parameter}:</Text>
                      <Text style={styles.value}>
                        {reading !== undefined ? `${reading} ${limit.unit}` : 'Not recorded'}
                        {' '} (Limit: {limit.minLimit !== undefined ? `${limit.minLimit}-` : ''}{limit.maxLimit} {limit.unit})
                      </Text>
                    </View>
                  );
                })}
                
                {checklistItem.notes && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Notes:</Text>
                    <Text style={styles.value}>{checklistItem.notes}</Text>
                  </View>
                )}
                
                <View style={styles.divider} />
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by FlockIQ HACCP Compliance Module</Text>
          <Text style={{ marginTop: 5 }}>
            This document is valid for FSSAI and export compliance purposes
          </Text>
          <Text style={{ marginTop: 5 }}>
            Report ID: {data.processingRunId} · Generated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

interface HACCPAuditPDFDownloadProps {
  data: HACCPAuditReport;
  fileName?: string;
}

export function HACCPAuditPDFDownload({ 
  data, 
  fileName = `haccp-audit-${data.processingRunId}.pdf` 
}: HACCPAuditPDFDownloadProps) {
  return (
    <PDFDownloadLink document={<HACCPAuditPDF data={data} />} fileName={fileName}>
      {({ loading }) => (
        <button
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? 'Generating PDF...' : 'Download HACCP Audit Report'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
