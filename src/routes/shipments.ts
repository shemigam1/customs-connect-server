import { Router } from "express";
import authMiddleWare from "../utils/authMiddleware";
import Shipment from "../models/shipment";
import ShipmentItem from "../models/item";
import { ResultFunction } from "../utils/utils";

export const shipmentRouter = Router();

//  POST /shipments — create shipment. Body: {bl_number, form_m_no, containers, origin_country,
// destination_port, items[]} → returns shipment id.
// • GET /shipments/{id} — returns shipment with docs, messages, AI flags, anchor status.
// • PATCH /shipments/{id}/assign — assign officer.

/**
 * @openapi
 * /shipments:
 *  post:
 *     tags:
 *     - Shipments
 *     summary: Create a new shipment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              required:
 *                - items
 *              properties:
 *                bl_number:
 *                  type: string
 *                form_m_no:
 *                  type: string
 *                containers:
 *                  type: array
 *                  items:
 *                    type: string
 *                origin_country:
 *                  type: string
 *                destination_port:
 *                  type: string
 *                items:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                      quantity:
 *                        type: number
 *                      weight:
 *                        type: number
 *                      description:
 *                         type: string
 *     responses:
 *       201:
 *         description: Shipment created successfully
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
 *                   example: shipment created
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
shipmentRouter.post("/", authMiddleWare, async (req, res) => {
  try {
    const { items, ...shipmentData } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Shipment must contain at least one item" });
    }

    // Create items first
    const createdItems = await ShipmentItem.insertMany(
      items.map((item: any) => ({
        ...item,
        shipmentId: null, // Will be updated after shipment is created
      }))
    );

    const itemIds = createdItems.map((item) => item._id);

    // Create shipment with item references
    const shipment = new Shipment({
      ...shipmentData,
      items: itemIds,
    });

    await shipment.save();

    // Update items with shipmentId
    await ShipmentItem.updateMany(
      { _id: { $in: itemIds } },
      { shipmentId: shipment._id }
    );

    res
      .status(201)
      .json(ResultFunction(true, "shipment created", 201, shipment));
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to create shipment",
    });
  }
});

/**
 * @openapi
 * /shipments/{id}:
 *  get:
 *     tags:
 *     - Shipments
 *     summary: Get shipment details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     responses:
 *       200:
 *         description: Shipment retrieved successfully
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
 *                   example: shipment retrieved
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
shipmentRouter.get("/:id", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipment.findById(id).populate("items");

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res
      .status(200)
      .json(ResultFunction(true, "shipment retrieved", 200, shipment));
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to retrieve shipment",
    });
  }
});

/**
 * @openapi
 * /shipments/{id}/assign:
 *  put:
 *     tags:
 *     - Shipments
 *     summary: Assign officers to a shipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              required:
 *                - officerIds
 *              properties:
 *                officerIds:
 *                  type: array
 *                  items:
 *                    type: string
 *                  description: Array of Officer User IDs
 *     responses:
 *       200:
 *         description: Officers assigned successfully
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
 *                   example: officers assigned
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Shipment'
 *       400:
 *         description: Invalid input or empty list
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shipment not found
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
shipmentRouter.put("/:id/assign", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params;
    const { officerIds } = req.body;

    if (!officerIds || !Array.isArray(officerIds) || officerIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Officer IDs array is required and must not be empty" });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      id,
      { officersAssigned: officerIds },
      { new: true }
    )
      .populate("items")
      .populate("officersAssigned");

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res
      .status(200)
      .json(ResultFunction(true, "officers assigned", 200, shipment));
  } catch (error) {
    res.status(500).json({
    });
  }
});

/**
 * @openapi
 * /shipments/{id}/anchor:
 *  get:
 *     tags:
 *     - Shipments
 *     summary: Get blockchain anchor verification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     responses:
 *       200:
 *         description: Anchor details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     merkle_root:
 *                       type: string
 *                     chain_tx_hash:
 *                       type: string
 *                     chain:
 *                       type: string
 *                     anchored_at:
 *                       type: string
 *                       format: date-time
 *                     publisher:
 *                       type: string
 */
shipmentRouter.get("/:id/anchor", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findById(id);
    if (!shipment) return res.status(404).json({ error: "Shipment not found" });

    // Return the last anchor or all
    // @ts-ignore
    const anchors = shipment.anchors || [];
    const latestAnchor = anchors.length > 0 ? anchors[anchors.length - 1] : null;

    res.status(200).json(ResultFunction(true, "anchor retrieved", 200, latestAnchor));
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve anchor" });
  }
});

/**
 * @openapi
 * /shipments/verify/{bl_number}:
 *  get:
 *     tags:
 *     - Verification
 *     summary: Verify shipment by BL Number (Public/semi-public)
 *     description: Returns anchor data for verification screen
 *     parameters:
 *       - in: path
 *         name: bl_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                      verified:
 *                          type: boolean
 *                      anchor:
 *                          type: object
 */
shipmentRouter.get("/verify/:bl_number", async (req, res) => {
  try {
    const { bl_number } = req.params;
    const shipment = await Shipment.findOne({ bl_number });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    // @ts-ignore
    const anchors = shipment.anchors || [];
    const latestAnchor = anchors.length > 0 ? anchors[anchors.length - 1] : null;

    res.status(200).json(ResultFunction(true, "verification data", 200, {
      verified: !!latestAnchor,
      anchor: latestAnchor,
      shipmentId: shipment._id
    }));
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

export default shipmentRouter;
