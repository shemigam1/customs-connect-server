import ShipmentDocument from "../models/document";
import Shipment from "../models/shipment";
import authMiddleWare from "../utils/authMiddleware";
import { ResultFunction } from "../utils/utils";
import { shipmentRouter } from "./shipments";

shipmentRouter.post("/:id/documents", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType, documentUrl } = req.body;
    const userId = (req as any).user.id; // Assuming userId is attached to request by authMiddleware

    if (!documentType || !documentUrl) {
      return res
        .status(400)
        .json({ error: "Document type and URL are required" });
    }

    const validDocumentTypes = [
      "proforma_invoice",
      "ccvo",
      "commercial_invoice",
      "bill_of_lading",
      "airway_bill",
      "packing_list",
      "form_m",
      "sgd",
      "insurance_certificate",
      "import_duty_payment_evidence",
      "soncap_certificate",
      "paar",
      "nafdac_certificate",
      "product_certificate_of_conformity",
      "quota_allocation_certificate",
      "radiation_certificate",
    ];

    if (!validDocumentTypes.includes(documentType)) {
      return res.status(400).json({ error: "Invalid document type" });
    }

    // Verify shipment exists
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipmentDocument = await ShipmentDocument.create({
      shipmentId: id,
      userId,
      documentType,
      documentUrl,
    });

    res
      .status(201)
      .json(
        ResultFunction(true, "shipment document created", 201, shipmentDocument)
      );
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to create shipment document",
    });
  }
});

shipmentRouter.get(
  "/:id/documents/:docId",
  authMiddleWare,
  async (req, res) => {
    try {
      const { id, docId } = req.params;

      // Verify shipment exists
      const shipment = await Shipment.findById(id);
      if (!shipment) {
        return res.status(404).json({ error: "Shipment not found" });
      }

      const document = await ShipmentDocument.findById(docId).populate(
        "userId",
        "name email"
      );

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Verify the document belongs to the shipment
      if (document.shipmentId.toString() !== id) {
        return res
          .status(403)
          .json({ error: "Document does not belong to this shipment" });
      }

      res
        .status(200)
        .json(ResultFunction(true, "document retrieved", 200, document));
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve document",
      });
    }
  }
);
