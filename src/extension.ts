// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "widget-extractor-flutter.extractWidget",
    () => {
      // get the selected text
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
      }
      const selection = editor.selection;
      const text = editor.document.getText(selection);

      // ask for the widget name
      vscode.window
        .showInputBox({
          placeHolder: "Widget name",
          prompt: "Enter the name of the widget",
          value: text,
          validateInput: (value: string) => {
            if (!value) {
              return "Please enter a name";
            }
            return null;
          },
        })
        .then((widgetName) => {
          // if the user canceled the input box
          if (!widgetName) {
            return;
          }

          // create a new file with a new Flutter widget and put inside the selected text
          let code = `class ${widgetName} extends StatelessWidget {
				@override
				Widget build(BuildContext context) {
					return ${text};
				}
			}`;

          // parse the widget name to snake case
          const snakeCaseWidgetName = widgetName.replace(
            /([A-Z])/g,
            (match) => `_${match.toLowerCase()}`
          );

          // create a new file with thesnaked case widget name
          const uri = vscode.Uri.parse(`untitled:${snakeCaseWidgetName}.dart`);

          // open the new file
          vscode.workspace.openTextDocument(uri).then((doc) => {
            vscode.window.showTextDocument(doc).then((editor) => {
              editor.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(0, 0), code);
              });
            });
          });

          // replace the selected text with the new widget
          editor.edit((editBuilder) => {
            editBuilder.replace(selection, `${widgetName}()`);
          });

          //   import the new widget
          editor.edit((editBuilder) => {
            editBuilder.insert(
              new vscode.Position(0, 0),
              `import '${snakeCaseWidgetName}.dart';\n`
            );
          });

          //   format all the documents modified
          vscode.commands.executeCommand("editor.action.formatDocument");

          //   show a message
          vscode.window.showInformationMessage(`Widget ${widgetName} created!`);
        });
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
