// Custom DOM event the slash command's "attachment" item dispatches to ask
// the editor shell to open its (hidden, toolbar-owned) file picker — slash
// command extensions don't have direct access to React component state.
export const ATTACH_FILE_EVENT = "editor:attachFile"
