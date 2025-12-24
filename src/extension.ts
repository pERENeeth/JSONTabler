import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand('JSONTabler.showJsonAsTable', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("No active editor found.");
			return;
		}

		const document = editor.document;
		if (document.languageId !== "json") {
			vscode.window.showErrorMessage("Active document is not a JSON file.");
			return;
		}

		const jsonText = document.getText();
		let jsonData;
		try {
			jsonData = JSON.parse(jsonText);
		} catch (error) {
			vscode.window.showErrorMessage("Invalid JSON data.");
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			"JSONTabler",
			"JSON Table Viewer",
			vscode.ViewColumn.Beside,
			{ enableScripts: true }
		);

		const scriptSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "react-webview", "dist", "assets", "index.js"));
		const styleSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "react-webview", "dist", "assets", "index.css"));

		panel.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>React Webview</title>
				<link rel="stylesheet" href="${styleSrc}">
			</head>
			<body>
				<div id="root"></div>
				<script>
					window.INITIAL_DATA = ${JSON.stringify(jsonData)};
					window.vscode = acquireVsCodeApi();
				</script>
				<script src="${scriptSrc}"></script>
			</body>
		</html>`;

		panel.webview.postMessage({
			type: "jsonData",
			data: jsonData
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
