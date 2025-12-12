
import Shipment, { IShipment } from "../models/shipment";
import merkleService from "./merkleService";
import { v4 as uuidv4 } from 'uuid';

export class AnchorService {

    /**
     * Anchor a Shipment to the "Blockchain"
     */
    async anchorShipment(shipmentId: string): Promise<any> {
        const shipment = await Shipment.findById(shipmentId).populate('items');
        if (!shipment) throw new Error("Shipment not found");

        if (shipment.status === 'DRAFT') throw new Error("Cannot anchor a DRAFT shipment");

        // 1. Gather Data Leaves
        // In reality, this would be hashes of files from S3 + data fields
        const leaves = [
            merkleService.hash(`BL:${shipment.bl_number}`),
            merkleService.hash(`FormM:${shipment.form_m_no}`),
            merkleService.hash(`Value:${shipment.shippingValue || 0}`),
            merkleService.hash(`User:${shipment.created_by}`)
        ];

        // 2. Generate Root
        const root = merkleService.generateMerkleRoot(leaves);

        // 3. "Write" to Chain (Mock)
        const txHash = await this.mockSmartContractCall(root, shipment.bl_number);

        // 4. Save Anchor Record
        const anchor = {
            id: uuidv4(),
            merkle_root: root,
            chain_tx_hash: txHash,
            chain: 'POLYGON_AMOY', // Example Testnet
            anchored_at: new Date(),
            publisher: 'CustomsConnect_Oracle'
        };

        // Update Shipment with new anchor
        // @ts-ignore
        shipment.anchors = shipment.anchors || [];
        // @ts-ignore
        shipment.anchors.push(anchor);

        await shipment.save();

        return anchor;
    }

    /**
     * Mock Smart Contract Interaction
     */
    private async mockSmartContractCall(root: string, bl: string): Promise<string> {
        console.log(`BLOCKCHAIN: Recording Root ${root} for BL ${bl}`);
        await new Promise(r => setTimeout(r, 2000)); // Latency
        return `0x${merkleService.hash(root + Date.now())}`; // Mock Tx Hash
    }
}

export default new AnchorService();
