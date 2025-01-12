import { Uri, workspace, TextDocument, Disposable, Document } from "coc.nvim";
import * as path from "path";
import { tableize } from "inflection";
import Parser, { Table } from "./Parser";

export default class Schema implements Disposable {
  private tables: Map<string, Table> = new Map();

  constructor(private uri: Uri) {}

  public dispose() {
    this.tables.clear();
  }

  public load() {
    const document = workspace.getDocument(this.uri.path);
    this.parse(document);
  }

  public getUri() {
    return this.uri;
  }

  public getTable(tableName: string) {
    return this.tables.get(tableName);
  }

  public getTableNames() {
    return Array.from(this.tables.keys());
  }

  public getTableByFileName(fileName: string) {
    const tableName = this.getTableNameByFileName(fileName);
    return tableName ? this.tables.get(tableName) : undefined;
  }

  public getTableNameByFileName(fileName: string) {
    if (!fileName.includes("/app/models/")) {
      return;
    }
    const tableName = tableize(path.basename(fileName, ".rb"));
    return this.tables.has(tableName) ? tableName : undefined;
  }

  private parse(document: Document) {
    const parser = new Parser(document);

    for (const table of parser.parseTables()) {
      this.tables.set(table.tableName, table);
    }
  }
}
