// app/api/invoice/[paymentId]/route.tsx

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Create PDF styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 12, color: "#333" },
  header: { borderBottom: "2px solid #1e3a8a", paddingBottom: 15, marginBottom: 20 },
  gymName: { fontSize: 24, fontWeight: "bold", color: "#1e3a8a", marginBottom: 5 },
  invoiceTitle: { fontSize: 16, color: "#666", textTransform: "uppercase", letterSpacing: 1 },
  section: { marginBottom: 15, lineHeight: 1.5 },
  label: { color: "#666", fontSize: 10, textTransform: "uppercase" },
  value: { fontSize: 14, fontWeight: "bold", color: "#111" },
  row: { flexDirection: "row", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: 10, marginBottom: 10 },
  footer: { position: "absolute", bottom: 40, left: 40, right: 40, textAlign: "center", color: "#888", fontSize: 10, borderTop: "1px solid #eee", paddingTop: 10 }
});

// Create the PDF Document Component
const InvoicePDF = ({ payment }: { payment: any }) => {
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.gymName}>FITNESS PRO</Text>
          <Text style={styles.invoiceTitle}>Payment Receipt</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Member Name</Text>
          <Text style={styles.value}>{payment.member.fullName}</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{payment.member.phone}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Amount Paid</Text>
            {/* FIXED: Added .toString() to handle Prisma Decimal objects */}
            <Text style={styles.value}>Rs. {payment.amount.toString()}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Payment Date</Text>
            <Text style={styles.value}>{formatDate(payment.paymentDate)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.label}>Valid Until (30 Days)</Text>
            <Text style={{ ...styles.value, color: "#e63946" }}>{formatDate(payment.expiryDate)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for choosing FITNESS PRO!</Text>
          <Text>System Generated Receipt.</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const resolvedParams = await params;
    const payment = await prisma.payment.findUnique({
      where: { id: resolvedParams.paymentId },
      include: { member: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Render the React Component to a PDF stream
    const stream = await renderToStream(<InvoicePDF payment={payment} />);
    
    // Convert stream to standard Web Response
    const response = new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="receipt-${payment.id}.pdf"`,
      },
    });

    return response;
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}