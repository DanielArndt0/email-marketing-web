export type ControlApiDependencyStatus = {
  status: "ok" | "error";
  details?: string;
};

export type ControlApiHealth = {
  status: "ok" | "error";
  service: "control-api";
  environment: string;
  timestamp: string;
  checks: {
    postgres: ControlApiDependencyStatus;
    redis: ControlApiDependencyStatus;
  };
};
