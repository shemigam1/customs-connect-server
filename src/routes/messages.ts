import express, { Request, Response } from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import Message from '../models/message';
import Shipment from '../models/shipment';
import authMiddleWare from '../utils/authMiddleware';

const router = express.Router();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * @openapi
 * /shipments/{id}/messages:
 *  get:
 *     tags:
 *     - Messages
 *     summary: Get messages for a shipment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before_timestamp
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: thread_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 has_more:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to fetch messages
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/shipments/:id/messages', authMiddleWare, async (req, res): Promise<any> => {
    try {
        const { id: shipmentId } = req.params;
        const {
            limit = 50,
            before_timestamp,
            thread_id
        } = req.query;

        // Adapted to existing middleware
        const user = res.locals.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const userId = user.id;

        const shipment = await Shipment.findOne({
            _id: shipmentId,
            $or: [
                { created_by: userId },
                { assigned_officer_id: userId },
                { 'participants.user_id': userId }
            ]
        });

        if (!shipment) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const query: any = {
            shipment_id: shipmentId,
            deleted_at: null
        };

        if (before_timestamp) {
            query.sent_at = { $lt: new Date(before_timestamp as string) };
        }

        if (thread_id) {
            query.thread_id = thread_id;
        }

        const messages = await Message.find(query)
            .sort({ sent_at: -1 })
            .limit(Number(limit))
            .lean();

        messages.reverse();

        res.json({
            messages,
            has_more: messages.length === Number(limit)
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * @openapi
 * /shipments/{id}/messages/upload:
 *  post:
 *     tags:
 *     - Messages
 *     summary: Upload a message attachment
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Failed to upload file
 */
/**
 * @openapi
 * /shipments/{id}/messages/upload:
 *  post:
 *     tags:
 *     - Messages
 *     summary: Upload a message attachment
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
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attachment:
 *                   $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: No file provided
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
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Failed to upload file
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/shipments/:id/messages/upload',
    authMiddleWare,
    upload.single('file'),
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id: shipmentId } = req.params;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No file provided' });
            }

            const user = res.locals.user;
            if (!user) return res.status(401).json({ error: 'Unauthorized' });
            const userId = user.id;

            const shipment = await Shipment.findOne({
                _id: shipmentId,
                $or: [
                    { created_by: userId },
                    { assigned_officer_id: userId },
                    { 'participants.user_id': userId }
                ]
            });

            if (!shipment) {
                return res.status(403).json({ error: 'Access denied' });
            }

            const s3Key = `shipments/${shipmentId}/messages/${uuidv4()}-${file.originalname}`;

            await s3.putObject({
                Bucket: process.env.S3_BUCKET!,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ServerSideEncryption: 'AES256'
            }).promise();

            const attachment = {
                file_id: uuidv4(),
                filename: file.originalname,
                file_type: file.mimetype,
                size: file.size,
                s3_key: s3Key,
                uploaded_at: new Date()
            };

            res.json({ attachment });

        } catch (error) {
            console.error('Error uploading attachment:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }
);

/**
 * @openapi
 * /messages/unread:
 *  get:
 *     tags:
 *     - Messages
 *     summary: Get unread message counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread counts returned
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch unread counts
 */
router.get('/messages/unread', authMiddleWare, async (req: Request, res: Response): Promise<any> => {
    try {
        const user = res.locals.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        const userId = user.id;

        const shipments = await Shipment.find({
            $or: [
                { created_by: userId },
                { assigned_officer_id: userId },
                { 'participants.user_id': userId }
            ]
        }).select('id bl_number unread_count_by_user last_message_at');

        const unreadByShipment = shipments.map((shipment: any) => ({
            shipment_id: shipment.id,
            bl_number: shipment.bl_number,
            unread_count: shipment.unread_count_by_user?.get(userId) || 0,
            last_message_at: shipment.last_message_at
        }));

        const total_unread = unreadByShipment.reduce(
            (sum, s) => sum + s.unread_count,
            0
        );

        res.json({
            total_unread,
            by_shipment: unreadByShipment
        });

    } catch (error) {
        console.error('Error fetching unread counts:', error);
        res.status(500).json({ error: 'Failed to fetch unread counts' });
    }
});

export default router;
