export const clickNthIconOnToolbar = (nth) =>
    cy.get(".toolbar .toolbar-icon").eq(nth).click()
export const moveToMarkdownEditorPage = () => clickNthIconOnToolbar(1)
export const moveToStoryMapPage = () => clickNthIconOnToolbar(0)