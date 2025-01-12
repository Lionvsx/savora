export type TaskLog = {
  type: "error" | "info";
  message: string;
  data?: any;
};
