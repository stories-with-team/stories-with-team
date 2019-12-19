import {moveToMarkdownEditorPage} from './movePages'
export const setMarkdown = (markdown) => {
  moveToMarkdownEditorPage()
  cy.get("#root .main textarea").clear().type(markdown)
}