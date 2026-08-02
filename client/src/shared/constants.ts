const STORAGE = {
  token: "better_hr_token",
  refreshToken: "better_hr_sid",
  user: "better_hr_meta",
  theme: "better_hr_ui",
} as const;

const GRAPHQL = "/graphql";

const ROUTES = {
  login: "/login",
  employees: "/employees",
} as const;

const APP_NAME = "Better HR";

export { STORAGE, GRAPHQL, ROUTES, APP_NAME };
