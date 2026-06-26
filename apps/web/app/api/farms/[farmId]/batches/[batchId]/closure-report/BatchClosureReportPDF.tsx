'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@pdf-font/helvetica/Helvetica.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@pdf-font/helvetica/Helvetica-Bold.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.4 },
  header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#1A5C34', paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A5C34', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A5C34', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  gridItem: { width: '48%', marginRight: '2%', marginBottom: 10 },
  label: { fontSize: 9, color: '#666', marginBottom: 3 },
  value: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  tableRow: { borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tableHeader: { backgroundColor: '#1A5C34', color: '#fff', fontSize: 10, fontWeight: 'bold' },
  tableCell: { padding: 8, fontSize: 9 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999', borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10 },
  statusSuccess: { backgroundColor: '#d4edda', color: '#155724', padding: 4, fontSize: 8 },
  statusWarning: { backgroundColor: '#fff3cd', color: '#856404', padding: 4, fontSize: 8 },
  statusError: { backgroundColor: '#f8d7da', color: '#721c24', padding: 4, fontSize: 8 },
});

interface ReportData {
  farm_name: string;
  batch_number: string | number;
  breed: string;
  closed_at: string;
  duration_days: number;
  birds_placed: number;
  birds_harvested: number;
  mortality_pct: number;
  final_fcr: number;
  avg_weight_g: number;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  gross_margin_pct: number;
  cost_per_bird: number;
  profit_per_bird: number;
  cost_breakdown?: Record<string, number>;
  sales?: Array<{ sale_date: string; birds_sold: number; total_weight_kg: number; rate_per_kg: number; net_revenue: number }>;
  vaccinations?: Array<{ name: string; scheduled_day: number; administered_day?: number; status: string }>;
  treatments?: Array<{ treatment_date: string; medicine_name: string; purpose: string[]; withdrawal_days: number; is_complete: boolean }>;
  documents?: Record<string, unknown>;
}

export function BatchClosureReportPDF({ data }: { data: ReportData }) {
  return (
    <Document>
      {/* Page 1: Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FlockIQ Batch Closure Report</Text>
          <Text style={styles.subtitle}>Farm: {data.farm_name}</Text>
          <Text style={styles.subtitle}>Batch #{data.batch_number} · {data.breed}</Text>
          <Text style={styles.subtitle}>Closed: {new Date(data.closed_at).toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch Summary</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{data.duration_days} days</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Birds Placed</Text><Text style={styles.value}>{data.birds_placed.toLocaleString()}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Birds Harvested</Text><Text style={styles.value}>{data.birds_harvested.toLocaleString()}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Mortality %</Text><Text style={styles.value}>{data.mortality_pct.toFixed(2)}%</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Final FCR</Text><Text style={styles.value}>{data.final_fcr.toFixed(3)}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Avg Weight (g)</Text><Text style={styles.value}>{data.avg_weight_g.toLocaleString()}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}><Text style={styles.label}>Total Revenue</Text><Text style={styles.value}>Rs.{data.total_revenue.toLocaleString()}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Total Cost</Text><Text style={styles.value}>Rs.{data.total_cost.toLocaleString()}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Gross Profit</Text><Text style={styles.value}>Rs.{data.gross_profit.toLocaleString()}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Gross Margin %</Text><Text style={styles.value}>{data.gross_margin_pct.toFixed(1)}%</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Cost per Bird</Text><Text style={styles.value}>Rs.{data.cost_per_bird.toFixed(2)}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Profit per Bird</Text><Text style={styles.value}>Rs.{data.profit_per_bird.toFixed(2)}</Text></View>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated by FlockIQ on {new Date().toLocaleDateString()} | Batch data is self-reported
        </Text>
      </Page>
    </Document>
  );
}
