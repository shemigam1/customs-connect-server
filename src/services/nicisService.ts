
export class NICISService {
    /**
     * Simulate SGD Submission to NICIS II
     * In production, this would make an mTLS HTTP request.
     */
    async submitSGD(shipmentData: any): Promise<{ sgd_id: string; status: string; duties_due: number }> {
        console.log("MOCK: Submitting SGD to NICIS II", shipmentData.bl_number);

        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple mock logic:
        // If BL starts with 'ERR', fail it.
        if (String(shipmentData.bl_number).startsWith('ERR')) {
            throw new Error("NICIS_REJECTED: Invalid BL format");
        }

        return {
            sgd_id: `SGD-${Math.floor(Math.random() * 100000)}`,
            status: 'SUBMITTED',
            duties_due: Math.floor(Math.random() * 500000) + 50000 // Random duty between 50k and 550k
        };
    }

    /**
     * Check Status (PAAR/Risk)
     */
    async checkStatus(sgdId: string): Promise<{ status: string; risk_channel?: string }> {
        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Randomly assign risk for demo
        const risks = ['GREEN', 'YELLOW', 'RED'];
        const risk = risks[Math.floor(Math.random() * risks.length)];

        return {
            status: 'PAAR_APPROVED',
            risk_channel: risk
        };
    }
}

export default new NICISService();
