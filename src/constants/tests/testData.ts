const mockData = [
    {
        name: "",
        email: "",
        password: ""
    },
    {
        name: "Valid User",
        email: "valid@email.com",
        password: 12467
    },
    {
        name: "Valid User",
        email: "invalid-email",
        password: "1234567"
    },
    {
        name: "Valid User",
        email: "valid@email.com",
        password: "1234"
    },
    {
        name: "Valid User",
        email: "unregistered@email.com",
        password: "1234567"
    },
    {
        name: "Valid User",
        email: "registered@email.com",
        password: "1234567"
    },
    {
        name: "Admin User",
        email: "admin@email.com",
        password: "admin12345",
        admin: true
    },
    {
        name: "Staff User",
        email: "staff@email.com",
        password: "staff12345",
    }
]

export default mockData;