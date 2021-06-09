import Schema from "./Schema";
import SchemaCompletionProvider from "./SchemaCompletionProvider";
import SchemaDefinitionProvider from "./SchemaDefinitionProvider";
import SymbolCompletionProvider from "./SymbolCompletionProvider";
import { ExtensionContext, workspace, languages, WorkspaceFolder } from "coc.nvim";

const GLOB_PATTERN = "db/schema.rb";
const SELECTOR = ["ruby", "erb", "haml", "slim"];

export async function activate(context: ExtensionContext) {
  const schemaFiles = await workspace.findFiles(GLOB_PATTERN);
  if (schemaFiles.length < 1) {
    return;
  }

  const schemaFile = schemaFiles[0];

  const schema = new Schema(schemaFile);
  schema.load();
  context.subscriptions.push(schema);

  const fileWatcher = workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      workspace.getWorkspaceFolder(schemaFile) as WorkspaceFolder,
      GLOB_PATTERN
    )
  );
  fileWatcher.onDidChange(() => {
    schema.load();
  });
  context.subscriptions.push(fileWatcher);

  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      SELECTOR,
      new SchemaCompletionProvider(schema),
      "."
    )
  );

  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      SELECTOR,
      new SymbolCompletionProvider(schema),
      ":"
    )
  );

  context.subscriptions.push(
    languages.registerDefinitionProvider(
      SELECTOR,
      new SchemaDefinitionProvider(schema)
    )
  );

  const commands = new Commands(schema);

  context.subscriptions.push(
    commands.registerCommand("railsDbSchema.open", async (...args) => {
      await commands.open(...args);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("railsDbSchema.insert", async () => {
      await commands.insert();
    })
  );
}

export function deactivate() {}
