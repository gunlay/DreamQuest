export interface Message {
  id: string | undefined;
  type: "ai";
  content: string;
}

export interface Dream {
  content: string;
  createTime: string;
}

export interface CloudFunctionResult<T> {
  result: T;
  errMsg?: string;
}
