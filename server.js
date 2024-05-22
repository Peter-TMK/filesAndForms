const http = require("http");
const fs = require("fs");
const path = require("path");

// Initialize the database
const databasePath = path.join(__dirname, "database.json");
if (!fs.existsSync(databasePath)) {
  fs.writeFileSync(databasePath, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Serve the HTML form
    fs.readFile(path.join(__dirname, "form.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.method === "POST" && req.url === "/") {
    // Handle form submission
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const formData = JSON.parse(body);
      const validationErrors = validateForm(formData);

      if (validationErrors.length > 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ errors: validationErrors }));
      } else {
        saveFormData(formData);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Form submitted successfully!" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});

function validateForm(formData) {
  const errors = [];
  const namePattern = /^[a-zA-Z]+$/;

  // Validate first name and last name
  if (!formData.firstName || formData.firstName.length < 1) {
    errors.push("First name is required and cannot be less than 1 character");
  } else if (!namePattern.test(formData.firstName)) {
    errors.push("First name cannot contain numbers");
  }

  if (!formData.lastName || formData.lastName.length < 1) {
    errors.push("Last name is required and cannot be less than 1 character");
  } else if (!namePattern.test(formData.lastName)) {
    errors.push("Last name cannot contain numbers");
  }

  // Validate email
  if (
    !formData.email ||
    !formData.email.includes("@") ||
    !formData.email.includes(".")
  ) {
    errors.push("Invalid email address");
  }

  // Validate phone number length and numeric only
  const phoneLength = 10; // Example specific length
  if (
    !formData.phone ||
    !/^\d+$/.test(formData.phone) ||
    formData.phone.length !== phoneLength
  ) {
    errors.push(`Phone number must be ${phoneLength} numeric characters long`);
  }

  // Validate gender
  if (!formData.gender) {
    errors.push("Gender is required");
  }

  return errors;
}

function saveFormData(formData) {
  try {
    const data = fs.readFileSync(databasePath, "utf-8");
    const existingData = data ? JSON.parse(data) : [];
    existingData.push(formData);
    fs.writeFileSync(databasePath, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error("Error reading or writing database file:", error);
  }
}
