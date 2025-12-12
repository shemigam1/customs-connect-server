import Shipment, { ShipmentStatus, IShipment } from "../models/shipment";
import { v4 as uuidv4 } from "uuid";
import nicisService from "./nicisService";
import aiService from "./aiService";

export class ShipmentService {
    /**
     * Create a new shipment in DRAFT state
     */
    async createShipment(data: Partial<IShipment>, userId: string): Promise<IShipment> {
        const shipment = new Shipment({
            ...data,
            created_by: userId,
            status: ShipmentStatus.DRAFT,
            compliance_score: 100, // Default start
        });
        return await shipment.save();
    }

    /**
     * Submit a shipment for Pre-Check (AI Analysis)
     * TRANSITION: DRAFT -> DRAFT (Just updates flags, doesn't change official status yet)
     */
    async submitForPreCheck(shipmentId: string): Promise<IShipment> {
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) throw new Error("Shipment not found");

        if (shipment.status !== ShipmentStatus.DRAFT) {
            throw new Error("Shipment must be in DRAFT to run pre-check");
        }

        // Trigger AI Service
        const { score, flags } = await aiService.performPreCheck(shipmentId);

        console.log(`AI Pre-Check Completed. Score: ${score}, Flags: ${flags.length}`);

        return await Shipment.findById(shipmentId) as IShipment; // Reload with updates
    }

    /**
     * Submit to NICIS II (Mock)
     * TRANSITION: DRAFT -> SGD_SUBMITTED
     */
    async submitToNICIS(shipmentId: string): Promise<IShipment> {
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) throw new Error("Shipment not found");

        if (shipment.status !== ShipmentStatus.DRAFT) {
            throw new Error("Only DRAFT shipments can be submitted to NICIS");
        }

        // Validate mandatory fields (Docs, Items)
        if (!shipment.bl_number) throw new Error("BL Number is required for NICIS submission");

        // Call Mock NICIS
        const nicisResponse = await nicisService.submitSGD(shipment);

        shipment.status = ShipmentStatus.SGD_SUBMITTED;
        // Ideally store nicisResponse in shipment metadata or separate model
        console.log(`NICIS Response: ${JSON.stringify(nicisResponse)}`);

        return await shipment.save();
    }

    /**
     * Update Shipment Status (Manually or via Webhook)
     */
    async updateStatus(shipmentId: string, newStatus: ShipmentStatus, reason?: string): Promise<IShipment> {
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) throw new Error("Shipment not found");

        // Basic State Machine Validation
        // Use a map or switch if complexity grows
        const validTransitions: Record<string, ShipmentStatus[]> = {
            [ShipmentStatus.DRAFT]: [ShipmentStatus.SGD_SUBMITTED],
            [ShipmentStatus.SGD_SUBMITTED]: [ShipmentStatus.PAAR_APPROVED, ShipmentStatus.RISK_ASSESSMENT], // Or direct to risk?
            [ShipmentStatus.PAAR_APPROVED]: [ShipmentStatus.PAYMENT_RECEIVED],
            [ShipmentStatus.PAYMENT_RECEIVED]: [ShipmentStatus.RISK_ASSESSMENT],
            [ShipmentStatus.RISK_ASSESSMENT]: [ShipmentStatus.INSPECTION_SCHEDULED, ShipmentStatus.EXIT_NOTE_ISSUED, ShipmentStatus.CLEARED],
            [ShipmentStatus.INSPECTION_SCHEDULED]: [ShipmentStatus.EXIT_NOTE_ISSUED, ShipmentStatus.CLEARED],
            [ShipmentStatus.EXIT_NOTE_ISSUED]: [ShipmentStatus.CLEARED],
            [ShipmentStatus.CLEARED]: []
        };

        const allowed = validTransitions[shipment.status] || [];
        // Allow bypassing checks for now if strictly needed? No, enforce compliance.
        // For "Demo" purposes, we might be looser, but let's stick to PRD.

        // Exception: Admin/Officer might force update?
        if (!allowed.includes(newStatus)) {
            // Check if it's a regression (e.g. back to draft?) - usually not allowed in strict flows
            // For Hackathon/Mock, we permit simple flow forward.
            throw new Error(`Invalid status transition from ${shipment.status} to ${newStatus}`);
        }

        shipment.status = newStatus;

        if (newStatus === ShipmentStatus.RISK_ASSESSMENT) {
            // Mock triggers
        }

        return await shipment.save();
    }

    /**
     * Get Shipment Details
     */
    async getShipmentDetails(shipmentId: string): Promise<IShipment> {
        const shipment = await Shipment.findById(shipmentId)
            .populate('items')
            .populate('participants.user_id')
            .populate('assigned_officer_id');

        if (!shipment) throw new Error("Shipment not found");
        return shipment;
    }
}

export default new ShipmentService();
