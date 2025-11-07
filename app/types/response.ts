export interface Response<T = any> {
  status: number;
  message: string;
  validation: Record<string, string[]> | null;
  data: T;
}
