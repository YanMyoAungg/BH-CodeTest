import { gql } from "@apollo/client";

export const GET_EMPLOYEES = gql`
  query GetEmployees(
    $page: Int = 1
    $limit: Int = 10
    $search: String
    $sortBy: String
    $sortOrder: String
    $dateFrom: String
    $dateTo: String
  ) {
    employees(
      page: $page
      limit: $limit
      search: $search
      sortBy: $sortBy
      sortOrder: $sortOrder
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      items {
        id
        employeeCode
        firstName
        lastName
        email
        phone
        address
        salary
        joinDate
        createdAt
        updatedAt
      }
      total
      page
      totalPages
    }
  }
`;

export const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      employeeCode
      firstName
      lastName
      email
      phone
      address
      salary
      joinDate
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    createEmployee(input: $input) {
      id
      employeeCode
      firstName
      lastName
      email
      phone
      address
      salary
      joinDate
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      employeeCode
      firstName
      lastName
      email
      phone
      address
      salary
      joinDate
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;
