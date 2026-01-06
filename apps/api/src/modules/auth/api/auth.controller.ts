import { Controller } from "@nestjs/common";
import { API_VERSION } from "../../../common/constants/api-version";

@Controller({
  path: "auth",
  version: API_VERSION.V1,
})
export class AuthController {}
