
import { Router } from "express";
import authMiddleWare from "../utils/authMiddleware";
import Shipment from "../models/shipment";
import { ResultFunction } from "../utils/utils";

export const dashboardRouter = Router();

/**
 * @openapi
 * /dashboard/stats:
 *  get:
 *     tags:
 *     - Dashboard
 *     summary: Get user dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: stats retrieved
 *                 data:
 *                   type: object
 *                   properties:
 *                     avgClearanceTime:
 *                       type: string
 *                       example: "3.2 Days"
 *                     pendingAlerts:
 *                       type: integer
 *                       example: 4
 *                     clearedCount:
 *                       type: integer
 *                       example: 128
 *                     demurrageSaved:
 *                       type: string
 *                       example: "₦ 2.4M"
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                           time:
 *                             type: string
 *                     aiInsights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [warning, success, info]
 *                           text:
 *                             type: string
 */
dashboardRouter.get("/stats", authMiddleWare, async (req, res) => {
    try {
        const userId = (req as any).user.id; // Corrected to just use id directly

        // Calculate metrics
        const shipments = await Shipment.find({
            $or: [{ created_by: userId }, { assigned_officer_id: userId }]
        });

        const activeShipments = shipments.filter(s => s.status !== 'CLEARED');
        const clearedShipments = shipments.filter(s => s.status === 'CLEARED');

        // Mock data for demo
        const data = {
            avgClearanceTime: "3.2 Days",
            pendingAlerts: activeShipments.filter(s => (s.compliance_score || 0) < 80).length,
            clearedCount: clearedShipments.length,
            demurrageSaved: "₦ 2.4M",
            recentActivity: shipments.slice(0, 5).map(s => ({
                text: `Shipment #${s.bl_number} Updated`,
                time: "2h ago"
            })),
            aiInsights: [
                { type: 'warning', text: 'Potential HS Code Mismatch on #SH-002' },
                { type: 'success', text: 'Clearance Probability High for #SH-005' }
            ]
        };

        res.status(200).json(ResultFunction(true, "stats retrieved", 200, data));
    } catch (error) {
        res.status(500).json({ error: "Failed to get stats" });
    }
});
