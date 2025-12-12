import ShipmentDocument from "../models/document";
import Shipment from "../models/shipment";
import authMiddleWare from "../utils/authMiddleware";
import { ResultFunction } from "../utils/utils";
import { shipmentRouter } from "./shipments";

/**
 * @openapi
 * /shipments/{id}/documents:
 *  post:
 *     tags:
 *     - Documents
 *     summary: Upload a document for a shipment
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
 *                - documentType
 *                - documentUrl
 *              properties:
 *                documentType:
 *                  type: string
 *                  enum: [proforma_invoice, ccvo, commercial_invoice, bill_of_lading, airway_bill, packing_list, form_m, sgd, insurance_certificate, import_duty_payment_evidence, soncap_certificate, paar, nafdac_certificate, product_certificate_of_conformity, quota_allocation_certificate, radiation_certificate]
 *                documentUrl:
 *                  type: string
 *                  format: uri
 *     responses:
 *       201:
 *         description: Document created successfully
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
 *                   example: shipment document created
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Invalid input or document type
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

/**
 * @openapi
 * /shipments/{id}/documents/{docId}:
 *  get:
 *     tags:
 *     - Documents
 *     summary: Get a specific document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *       - in: path
 *         name: docId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
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
 *                   example: document retrieved
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       403:
 *         description: Document mismatch (does not belong to shipment)
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Shipment or Document not found
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

/**
 * @openapi
 * /shipments/{id}/documents:
 *  get:
 *     tags:
 *     - Documents
 *     summary: List all documents for a shipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 */
shipmentRouter.get("/:id/documents", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await ShipmentDocument.find({ shipmentId: id }).populate('userId', 'name');
    res.status(200).json(ResultFunction(true, "documents retrieved", 200, documents));
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
});
