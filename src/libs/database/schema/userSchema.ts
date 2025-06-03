/*    This schema is used to validate the user collection in MongoDB.
    It ensures that each user document contains the required fields:
    - email: must be a valid email format
    - role: must be one of 'admin', 'user', or 'staff'
    - password: must be a SHA256 hash string
    The schema also enforces that these fields are present and correctly formatted.
    If a document does not conform to this schema, it will raise an error.
*/

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