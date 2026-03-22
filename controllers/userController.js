const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { docClient } = require("../config/db");

// @desc    Create or update a user entry in DynamoDB
// @route   POST /user/:id
const createUser = async (req, res) => {
    try {
        const item = req.body;
        
        // Force the userId to be whatever you put in the URL (e.g. /user/1 -> userId = "1")
        item.userId = req.params.id;

        const command = new PutCommand({
            TableName: "Test_Table",
            Item: item
        });

        await docClient.send(command);
        res.status(201).json({ message: "Successfully inserted item!", item });
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Error inserting data");
    }
};

// @desc    Get an existing user from DynamoDB
// @route   GET /user/:id
const getUser = async (req, res) => {
    try {
        const command = new GetCommand({
            TableName: "Test_Table",
            Key: {
                userId: req.params.id,
            },
        });

        const data = await docClient.send(command);

        if (!data.Item) {
            return res.status(404).send("User not found");
        }

        res.json(data.Item);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Error fetching data");
    }
};

module.exports = {
    createUser,
    getUser
};
