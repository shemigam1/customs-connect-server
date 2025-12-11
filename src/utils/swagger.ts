import { Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Customs Connect API Docs",
            version,
            description: "REST API Documentation for Customs Connect Server",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        code: { type: "integer" },
                        error: { type: "string" },
                    },
                },
                Attachment: {
                    type: "object",
                    properties: {
                        file_id: { type: "string" },
                        filename: { type: "string" },
                        file_type: { type: "string" },
                        size: { type: "number" },
                        s3_key: { type: "string" },
                        uploaded_at: { type: "string", format: "date-time" },
                    },
                },
                Message: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        shipment_id: { type: "string" },
                        sender_id: { type: "string" },
                        sender_name: { type: "string" },
                        sender_role: { type: "string" },
                        body: { type: "string" },
                        attachments: { type: "array", items: { $ref: "#/components/schemas/Attachment" } },
                        thread_id: { type: "string" },
                        priority: { type: "string", enum: ["urgent", "normal", "low"] },
                        message_type: { type: "string", enum: ["user", "system", "ai_flag", "status_update"] },
                        sent_at: { type: "string", format: "date-time" },
                    },
                },
                Document: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        shipmentId: { type: "string" },
                        userId: { type: "string" },
                        documentType: { type: "string" },
                        documentUrl: { type: "string", format: "uri" },
                        uploadedAt: { type: "string", format: "date-time" },
                        status: { type: "string", enum: ["pending", "approved", "rejected"] },
                    },
                },
                ShipmentItem: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        quantity: { type: "number" },
                        weight: { type: "number" },
                        description: { type: "string" },
                        sku: { type: "string" },
                    }
                },
                Shipment: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        bl_number: { type: "string" },
                        trackingNumber: { type: "string" },
                        sender: { type: "object", properties: { name: { type: "string" }, address: { type: "string" }, phoneNumber: { type: "string" } } },
                        recipient: { type: "object", properties: { name: { type: "string" }, address: { type: "string" }, phoneNumber: { type: "string" } } },
                        status: { type: "string" },
                        currentLocation: { type: "string" },
                        origin_country: { type: "string" },
                        destination_port: { type: "string" },
                        items: { type: "array", items: { $ref: "#/components/schemas/ShipmentItem" } },
                        estimatedDeliveryDate: { type: "string", format: "date-time" },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/main.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app: Express, port: number) {
    // Swagger page
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Docs in JSON format
    app.get("/docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`Docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;
