export type Maybe<T> = T | null | undefined;

export const LEFT_PAGE = "LEFT_PAGE";
export const RIGHT_PAGE = "RIGHT_PAGE";

export type Data = {
  count: number;
  entries: Entry[];
};

export type Row = {
  type?: string;
  id: number;
  api: string;
  auth: string;
  category: string;
  cors: string;
  description: string;
  https: string;
  link: string;
  expanded?: boolean;
};

export type Column = {
  key: string;
  name: string;
};

export type Entry = {
  API: any;
  Auth: any;
  Category: any;
  Cors: any;
  Description: any;
  HTTPS: any;
  Link: any;
};

export type ContextMenu = {
  rowId: number;
  top: number;
  left: number;
};

export type PaginationData = {
  currentPage: number;
  totalPages: number;
  pageLimit: number;
};

export type PaginationType = {
  currentRows: Row[];
  currentPage: number | null;
  totalPages: number | null;
};

export type Detail = Row & { type: string };

export type Filter = Omit<Row, "id">;

export type Comparator = (a: Row, b: Row) => number;

export type Header =
  | "type"
  | "api"
  | "auth"
  | "category"
  | "cors"
  | "description"
  | "https"
  | "link"
  | "expanded";

export type Orientation = "p" | "portrait" | "l" | "landscape";

export type Unit = "pt" | "px" | "in" | "mm" | "cm" | "ex" | "em" | "pc";

export type Size = "A1" | "A2" | "A3" | "A4";
