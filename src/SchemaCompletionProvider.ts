import { CompletionItemProvider, TextDocument, Position, Range } from "coc.nvim";
import { tableize } from "inflection";
import Schema from "./Schema";
import buildCompletionItems from "./buildCompletionItems";

const LINE_PETTERN = /(?:(\w+)\.|\W\w+)$/;

export default class SchemaCompSchemaletionProvider
  implements CompletionItemProvider {
  constructor(private schema: Schema) {}

  public provideCompletionItems(document: TextDocument, position: Position) {
    const text = document.getText(
      Range.create(
        Position.create(position.line, 0),
        Position.create(position.line, position.character)
      )
    );
    const matches = text.match(LINE_PETTERN);
    if (!matches) {
      return;
    }

    const [, receiver] = matches;

    if (!receiver || receiver === "self") {
      const table = this.schema.getTableByFileName(document.uri);
      return table ? buildCompletionItems(table) : null;
    }

    const tableName = tableize(receiver);
    const table = this.schema.getTable(tableName);
    return table ? buildCompletionItems(table) : null;
  }
}
