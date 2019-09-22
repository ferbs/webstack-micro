// Endpoint handling permission inquiries from *traefik-gateway*.
export const InternalAuthVerificationEndPoint = "/_auth/verify";


// paths for current-user-controller.ts
export const CurrentUserApiMountPoint = "/auth/user";

export enum CurrentUserApiEndpoint {
  UserInfo = "/current",  // eg, GET /auth/user/current
  SignOut = "/sign_out" // POST /auth/user/sign_out
}

export const OpenIdApiMountPoint = "/auth/connect"; // requests to initiate and complete Oauth/OpenId connections mounted


// paths for local-password-controller.ts
// The endpoints mostly parallel front-end paths and are used for form submission redirects.
// For example, the user-visible form on the /app/sign_in page will POST to /auth/local/sign_in
export const LocalPasswordApiMountPoint = "/auth/local";

export enum LocalPasswordEndpoint {
  SignIn = "/sign_in", // eg, POST /auth/local/sign_in
  // maybe later:
  // SignUp = "/sign_up",
  // SendEmailConfirmationToken = "/send_confirmation_token",
  // ConfirmEmail = "/confirm_email",
  // SendResetPasswordToken = "/send_password_token",
  // ChangePassword = "/change_password",
}


// Relevant frontend-web paths used for redirects
// Consider refactoring into a library shared with frontend-web
export const FrontendPathPrefix = "/app";

export enum FrontendPageType {
  GuestHome = "/",
  UserHome = "/dashboard",
  SignIn = "/sign_in",

  // maybe later:
  // SignUp = "/sign_up",
  // ConfirmEmail = "/confirm_email",
  // SendResetPassword = "/reset_password",
  // ChangePassword = "/change_password",
}


export function frontendPagePath(pageType: FrontendPageType): string {
  return `${FrontendPathPrefix}${pageType}`;
}

