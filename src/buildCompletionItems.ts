import { CompletionItem, CompletionItemKind } from "vscode-languageserver-protocol";
import { Table } from "./Parser";

export default function buildCompletionItems(table: Table): CompletionItem[] {
  return Array.from(table.columns.values()).map(column => {
    const item: CompletionItem = {
      label: column.name,
      kind: CompletionItemKind.Method
    }
    item.detail = table.className;
    return item;
  });
}
