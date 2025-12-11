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
      { assignedOfficers: officerIds },
      { new: true }
    )
      .populate("items")
      .populate("assignedOfficers");

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res
      .status(200)
      .json(ResultFunction(true, "officers assigned", 200, shipment));
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to assign officer",
    });
  }
});
