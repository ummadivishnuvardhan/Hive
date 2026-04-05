const { ScanCommand, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../config/db");

const TABLE_NAME = "hive_companion";

// Get all companions with filtering, sorting, and pagination
exports.getAllCompanions = async (req, res) => {
    try {
        const { q, cat, sort, price_min, price_max, page = 1, limit = 10 } = req.query;
        
        let filterExpressions = [];
        let expressionAttributeValues = {};
        let expressionAttributeNames = {};
        
        // Removed strict DynamoDB 'q' filter here, we will do a flexible, case-insensitive filter in Javascript.
        
        if (cat) {
            filterExpressions.push("#category = :cat");
            expressionAttributeNames["#category"] = "category";
            expressionAttributeValues[":cat"] = cat;
        }
        
        if (price_min) {
            filterExpressions.push("price >= :price_min");
            expressionAttributeValues[":price_min"] = Number(price_min);
        }
        
        if (price_max) {
            filterExpressions.push("price <= :price_max");
            expressionAttributeValues[":price_max"] = Number(price_max);
        }
        
        const params = {
            TableName: TABLE_NAME
        };
        
        if (filterExpressions.length > 0) {
            params.FilterExpression = filterExpressions.join(" AND ");
            params.ExpressionAttributeValues = expressionAttributeValues;
        }
        
        if (Object.keys(expressionAttributeNames).length > 0) {
            params.ExpressionAttributeNames = expressionAttributeNames;
        }

        const command = new ScanCommand(params);
        let response = await docClient.send(command);
        let items = response.Items || [];

        // 1. Flexible Case-Insensitive Search
        if (q) {
            const lowerQ = q.toLowerCase();
            items = items.filter(item => item.name && item.name.toLowerCase().includes(lowerQ));
        }

        // 2. Apply sorting in memory
        if (sort === 'rating') {
             // Assuming descending order for ratings (highest first)
            items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        // Apply in-memory pagination
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        const paginatedItems = items.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            totalItems: items.length,
            totalPages: Math.ceil(items.length / pageSize),
            currentPage: pageNumber,
            data: paginatedItems
        });
    } catch (error) {
        console.error("Error fetching companions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get companion details by ID
exports.getCompanionDetails = async (req, res) => {
    try {
        const { companion_id } = req.params;
        
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                userId: companion_id  // Matches the DynamoDB partition key
            }
        });
        
        const response = await docClient.send(command);
        
        if (!response.Item) {
            return res.status(404).json({ success: false, message: "Companion not found" });
        }
        
        res.status(200).json({
            success: true,
            data: response.Item
        });
    } catch (error) {
        console.error("Error fetching companion details:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Create a new companion
exports.createCompanion = async (req, res) => {
    try {
        const item = req.body;
        
        // Ensure a userId is provided
        if (!item.userId) {
            return res.status(400).json({ success: false, message: "userId is required" });
        }

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item
        });
        
        await docClient.send(command);
        
        res.status(201).json({
            success: true,
            message: "Companion created successfully",
            data: item
        });
    } catch (error) {
        console.error("Error creating companion:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
