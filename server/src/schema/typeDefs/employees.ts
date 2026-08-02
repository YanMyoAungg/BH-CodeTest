export const employeeTypeDefs = `#graphql
  type Employee {
    id: ID!
    employeeCode: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    address: String
    salary: Float!
    joinDate: String!
    createdAt: String!
    updatedAt: String!
  }

  type EmployeePage {
    items: [Employee!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  input EmployeeInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    address: String
    salary: Float!
    joinDate: String!
  }

  type Query {
    employees(
      page: Int = 1
      limit: Int = 10
      search: String
      sortBy: String = "firstName"
      sortOrder: String = "asc"
      dateFrom: String
      dateTo: String
    ): EmployeePage!

    employee(id: ID!): Employee
  }

  type Mutation {
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
  }
`;
