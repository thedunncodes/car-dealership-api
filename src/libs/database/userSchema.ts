const userSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "role", "password"],
            properties: {
                email: {
                    bsonType: "string",
                    pattern: "^.+@.+\\..+$",
                    description: "must be a string and is required"
                },
                role: {
                    enum: ["admin", "user", "staff"],
                    description: "can only be either admin, staff, or user and is required"
                },
                password:{
                    bsonType: "string",
                    description: "SHA256 hash string and is required"
                }
            }
        }
    },
    validationAction: "error",
    validationLevel: "strict"
}

export default userSchema;