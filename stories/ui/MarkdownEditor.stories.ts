import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MarkdownEditor from '../../app/ui/MarkdownEditor';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'ui/MarkdownEditor',
  component: MarkdownEditor,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof MarkdownEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    content: `# Another Story Map Tool
## Create a story map
### You can write a story map by a story board
### You can write a story map as a markdown
## Show your stories
### You can see a story map by a story board
### You can see a story map as a markdown
## Share your stories
### You can share the stories by markdown.
`,
    onChange: (content: string) => {
      console.log('Content changed:', content);
    }
  }
};
