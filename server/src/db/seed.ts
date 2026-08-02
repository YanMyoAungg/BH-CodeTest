import { initializeDatabase } from "./schema.js";
import db from "./connection.js";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

function seed(): void {
  initializeDatabase();

  db.exec("DELETE FROM employees");
  db.exec("DELETE FROM users");

  const passwordHash = bcrypt.hashSync("password123", 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
    "admin",
    passwordHash,
  );

  const insert = db.prepare(`
    INSERT INTO employees (employee_code, first_name, last_name, email, phone, address, salary, join_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const usedEmails = new Set<string>();

  const insertMany = db.transaction(() => {
    for (let i = 0; i < 150; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      let email: string;
      do {
        email = faker.internet.email({ firstName, lastName }).toLowerCase();
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const phone = faker.phone.number();
      const address = faker.location.streetAddress();
      const salary = faker.number.int({
        min: 40000,
        max: 160000,
        multipleOf: 1000,
      });
      const joinDate = faker.date
        .between({ from: "2024-01-01", to: "2025-12-31" })
        .toISOString()
        .slice(0, 10);

      const code = `BH-${String(i + 1).padStart(4, "0")}`;
      insert.run(
        code,
        firstName,
        lastName,
        email,
        phone,
        address,
        salary,
        joinDate,
      );
    }
  });

  insertMany();
}

seed();
