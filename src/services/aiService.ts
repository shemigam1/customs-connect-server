
import Shipment, { IShipment } from "../models/shipment";
import { sendAIFlagMessage } from "./aiMessageService";

export class AIService {

    /**
     * Main Pre-Check Entry Point
     */
    async performPreCheck(shipmentId: string): Promise<{ score: number; flags: any[] }> {
        console.log(`AI: Starting pre-check for ${shipmentId}`);

        // Fetch shipment with items
        const shipment = await Shipment.findById(shipmentId).populate('items');
        if (!shipment) throw new Error("Shipment not found");

        const flags: any[] = [];

        // 1. Document Completeness Check (Mock)
        if (!shipment.bl_number) {
            flags.push({ type: 'document_incomplete', details: "Bill of Lading Number is missing", confidence: 1.0 });
        }
        if (!shipment.form_m_no) {
            flags.push({ type: 'document_incomplete', details: "Form M Number is missing", confidence: 1.0 });
        }

        // 2. HS Code Validation (Items)
        if (shipment.items && Array.isArray(shipment.items)) {
            for (const item of shipment.items as any[]) {
                const validation = this.checkHSCode(item);
                if (!validation.valid) {
                    flags.push({
                        type: 'hs_mismatch',
                        details: `Item '${item.name}': ${validation.reason}`,
                        confidence: 0.85
                    });
                }

                // Valuation Check
                const valCheck = this.checkValuation(item);
                if (!valCheck.valid) {
                    flags.push({
                        type: 'valuation_issue',
                        details: `Item '${item.name}': ${valCheck.reason}`,
                        confidence: 0.7
                    });
                }
            }
        }

        // 3. Mock OCR Consistency (Invoice Total vs Items Total)
        // We assume we 'extracted' a total from the invoice document
        const mockInvoiceTotal = 100000; // Mock value
        const declaredTotal = (shipment.items as any[]).reduce((sum: number, item: any) => sum + (item.value || 0), 0);

        // Only flag if we have items with value
        if (declaredTotal > 0 && Math.abs(declaredTotal - mockInvoiceTotal) > 1000) {
            // flags.push({ type: 'valuation_issue', details: `Invoice total differs from declared items total`, confidence: 0.9 });
        }

        // Calculate Score (Simple deduction)
        const score = Math.max(0, 100 - (flags.length * 15));

        // Persist Flags (Send messages)
        for (const flag of flags) {
            await sendAIFlagMessage(shipmentId, flag);
        }

        // Update Shipment
        shipment.compliance_score = score;
        await shipment.save();

        return { score, flags };
    }

    /**
     * Rule-based HS Code Check
     */
    private checkHSCode(item: any): { valid: boolean; reason?: string } {
        if (!item.hs_code) return { valid: false, reason: "HS Code missing" };

        const desc = (item.description || "").toLowerCase();
        // Simple Keyword Mismatches
        if (desc.includes("electronics") && !item.hs_code.startsWith("85")) {
            return { valid: false, reason: "HS Code does not match electronics category (should start with 85)" };
        }
        if (desc.includes("vehicle") && !item.hs_code.startsWith("87")) {
            return { valid: false, reason: "HS Code does not match vehicle category (should start with 87)" };
        }

        return { valid: true };
    }

    /**
     * Valuation Benchmark Check
     */
    private checkValuation(item: any): { valid: boolean; reason?: string } {
        if (!item.value || !item.quantity) return { valid: true }; // Skip if missing data

        const unitPrice = item.value / item.quantity;

        // Mock Benchmarks
        if (item.description?.toLowerCase().includes("iphone") && unitPrice < 500) {
            return { valid: false, reason: "Unit price is significantly below reference price for this commodity" };
        }

        return { valid: true };
    }

}

export default new AIService();
